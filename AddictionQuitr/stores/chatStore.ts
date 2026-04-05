// Chat store - manages conversation state with Zustand

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage, parseToolArguments, type ChatMessage, type ToolCall } from '../services/ai';
import { saveChatMessageWithSession, getSessionMessages, getTodayProgress } from '../services/database';
import { buildDynamicSystemPrompt, type UserDailyContext } from '../utils/prompts';
import { useUserStore } from './userStore';

export interface DisplayMessage {
  id: string;
  role: 'user' | 'assistant' | 'tool_result';
  content: string;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  timestamp: number;
}

interface ChatState {
  messages: DisplayMessage[];
  apiMessages: ChatMessage[];
  isLoading: boolean;
  pendingToolCalls: ToolCall[];
  sessionDate: string;  // Today's date YYYY-MM-DD

  addUserMessage: (text: string) => Promise<void>;
  handleToolResult: (toolCallId: string, toolName: string, result: string) => Promise<void>;
  clearMessages: () => void;
  loadTodaySession: () => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  apiMessages: [],
  isLoading: false,
  pendingToolCalls: [],
  sessionDate: new Date().toISOString().split('T')[0],

  addUserMessage: async (text: string) => {
    const userMsg: DisplayMessage = {
      id: uuidv4(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const apiUserMsg: ChatMessage = { role: 'user', content: text };

    set((state) => ({
      messages: [...state.messages, userMsg],
      apiMessages: [...state.apiMessages, apiUserMsg],
      isLoading: true,
    }));

    // Persist with session date (fire-and-forget)
    const today = get().sessionDate;
    saveChatMessageWithSession({ id: userMsg.id, role: 'user', content: text, session_date: today }).catch(() => {});

    try {
      // Build dynamic context for system prompt
      const userStore = useUserStore.getState();
      const todayProgress = await getTodayProgress();
      const currentHour = new Date().getHours();

      const context: UserDailyContext = {
        streak: userStore.streak,
        currentHour,
        checklistCompleted: todayProgress.checklistCompleted,
        checklistTotal: 6,
        lastEmotion: todayProgress.lastEmotion,
        weeklyUrgeCount: 0, // simplified for now
        sleepLogged: todayProgress.sleepLogged,
        activeGoalsCount: todayProgress.goalsCount,
        virtueLogsToday: todayProgress.virtueLogsToday,
      };

      const dynamicPrompt = buildDynamicSystemPrompt(context);
      const response = await sendChatMessage([...get().apiMessages], true, dynamicPrompt);

      if (response.tool_calls && response.tool_calls.length > 0) {
        // LLM wants to call tools
        const assistantApiMsg: ChatMessage = {
          role: 'assistant',
          content: response.content,
          tool_calls: response.tool_calls,
        };

        const toolDisplayMsgs: DisplayMessage[] = response.tool_calls.map((tc) => ({
          id: tc.id,
          role: 'tool_result' as const,
          content: `正在执行: ${tc.function.name}`,
          toolName: tc.function.name,
          toolArgs: parseToolArguments(tc.function.arguments),
          timestamp: Date.now(),
        }));

        set((state) => ({
          apiMessages: [...state.apiMessages, assistantApiMsg],
          messages: [
            ...state.messages,
            ...(response.content
              ? [{ id: uuidv4(), role: 'assistant' as const, content: response.content, timestamp: Date.now() }]
              : []),
            ...toolDisplayMsgs,
          ],
          pendingToolCalls: response.tool_calls!,
          isLoading: false,
        }));

        // Persist assistant message with tool_calls (fire-and-forget)
        const assistantId = uuidv4();
        saveChatMessageWithSession({
          id: assistantId,
          role: 'assistant',
          content: response.content || '',
          tool_calls: JSON.stringify(response.tool_calls),
          session_date: get().sessionDate,
        }).catch(() => {});

        // Persist tool_result display messages (fire-and-forget)
        toolDisplayMsgs.forEach((msg) => {
          saveChatMessageWithSession({
            id: msg.id,
            role: 'tool_result',
            content: msg.content,
            tool_calls: JSON.stringify(msg.toolArgs || {}),
            tool_call_id: msg.toolName || '',
            session_date: get().sessionDate,
          }).catch(() => {});
        });
      } else {
        // Normal text response
        const assistantMsg: DisplayMessage = {
          id: uuidv4(),
          role: 'assistant',
          content: response.content || '...',
          timestamp: Date.now(),
        };

        const assistantApiMsg: ChatMessage = {
          role: 'assistant',
          content: response.content || '',
        };

        set((state) => ({
          messages: [...state.messages, assistantMsg],
          apiMessages: [...state.apiMessages, assistantApiMsg],
          isLoading: false,
        }));

        // Persist with session date (fire-and-forget)
        saveChatMessageWithSession({ id: assistantMsg.id, role: 'assistant', content: response.content || '', session_date: get().sessionDate }).catch(() => {});
      }
    } catch (error: any) {
      const errorMsg: DisplayMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: `抱歉，发生了错误：${error.message || '网络连接失败'}`,
        timestamp: Date.now(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
        isLoading: false,
      }));
    }
  },

  handleToolResult: async (toolCallId: string, toolName: string, result: string) => {
    const toolApiMsg: ChatMessage = {
      role: 'tool',
      content: result,
      tool_call_id: toolCallId,
      name: toolName,
    };

    set((state) => ({
      apiMessages: [...state.apiMessages, toolApiMsg],
      isLoading: true,
    }));

    try {
      // Send tool result back to LLM for final response with dynamic context
      const userStore = useUserStore.getState();
      const todayProgress = await getTodayProgress();
      const currentHour = new Date().getHours();

      const context: UserDailyContext = {
        streak: userStore.streak,
        currentHour,
        checklistCompleted: todayProgress.checklistCompleted,
        checklistTotal: 6,
        lastEmotion: todayProgress.lastEmotion,
        weeklyUrgeCount: 0,
        sleepLogged: todayProgress.sleepLogged,
        activeGoalsCount: todayProgress.goalsCount,
        virtueLogsToday: todayProgress.virtueLogsToday,
      };

      const dynamicPrompt = buildDynamicSystemPrompt(context);
      const response = await sendChatMessage([...get().apiMessages], true, dynamicPrompt);

      const assistantMsg: DisplayMessage = {
        id: uuidv4(),
        role: 'assistant',
        content: response.content || '完成！',
        timestamp: Date.now(),
      };

      set((state) => ({
        messages: [...state.messages, assistantMsg],
        apiMessages: [
          ...state.apiMessages,
          { role: 'assistant', content: response.content || '' },
        ],
        pendingToolCalls: state.pendingToolCalls.filter((tc) => tc.id !== toolCallId),
        isLoading: false,
      }));

      // Persist tool message (fire-and-forget)
      saveChatMessageWithSession({
        id: Date.now().toString() + '_tool',
        role: 'tool',
        content: result,
        tool_call_id: toolCallId,
        session_date: get().sessionDate,
      }).catch(() => {});

      // Persist assistant response (fire-and-forget)
      saveChatMessageWithSession({
        id: assistantMsg.id,
        role: 'assistant',
        content: response.content || '',
        session_date: get().sessionDate,
      }).catch(() => {});
    } catch {
      set({ isLoading: false });
    }
  },

  clearMessages: () => {
    set({ messages: [], apiMessages: [], pendingToolCalls: [] });
  },

  loadTodaySession: async () => {
    const today = new Date().toISOString().split('T')[0];
    const { sessionDate } = get();

    // If date changed (new day), reset
    if (sessionDate !== today) {
      set({ sessionDate: today, messages: [], apiMessages: [] });
    }

    // Load today's messages from DB
    const savedMessages = await getSessionMessages(today);
    if (savedMessages.length > 0) {
      const displayMessages: DisplayMessage[] = [];
      const apiMsgs: ChatMessage[] = [];

      for (const msg of savedMessages) {
        // Rebuild display messages
        if (msg.role === 'user' || msg.role === 'assistant') {
          displayMessages.push({
            id: msg.id,
            role: msg.role,
            content: msg.content || '',
            timestamp: msg.created_at,
          });
          apiMsgs.push({
            role: msg.role,
            content: msg.content || '',
            ...(msg.tool_calls ? { tool_calls: JSON.parse(msg.tool_calls) } : {}),
          });
        } else if (msg.role === 'tool') {
          apiMsgs.push({
            role: 'tool',
            content: msg.content || '',
            tool_call_id: msg.tool_call_id || '',
            name: '', // tool name not critical for history
          });
        } else if (msg.role === 'tool_result') {
          // Tool result display messages
          let toolArgs = {};
          try { toolArgs = msg.tool_calls ? JSON.parse(msg.tool_calls) : {}; } catch(e) {}
          displayMessages.push({
            id: msg.id,
            role: 'tool_result',
            content: msg.content || '',
            toolName: msg.tool_call_id || undefined, // stored tool name in tool_call_id for display
            toolArgs: toolArgs,
            timestamp: msg.created_at,
          });
        }
      }

      set({ messages: displayMessages, apiMessages: apiMsgs, sessionDate: today });
    }
  },
}));
