// Chat store - manages conversation state with Zustand

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { sendChatMessage, parseToolArguments, type ChatMessage, type ToolCall } from '../services/ai';
import { saveChatMessage } from '../services/database';

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

  addUserMessage: (text: string) => Promise<void>;
  handleToolResult: (toolCallId: string, toolName: string, result: string) => Promise<void>;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  apiMessages: [],
  isLoading: false,
  pendingToolCalls: [],

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

    // Persist
    saveChatMessage({ id: userMsg.id, role: 'user', content: text }).catch(() => {});

    try {
      const response = await sendChatMessage([...get().apiMessages]);

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

        saveChatMessage({ id: assistantMsg.id, role: 'assistant', content: response.content || '' }).catch(() => {});
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
      // Send tool result back to LLM for final response
      const response = await sendChatMessage([...get().apiMessages]);

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
    } catch {
      set({ isLoading: false });
    }
  },

  clearMessages: () => {
    set({ messages: [], apiMessages: [], pendingToolCalls: [] });
  },
}));
