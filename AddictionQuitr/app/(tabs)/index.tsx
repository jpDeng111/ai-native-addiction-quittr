// Main chat screen - the agent conversation interface

import React, { useRef, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useChatStore, type DisplayMessage } from '../../stores/chatStore';
import { useUserStore } from '../../stores/userStore';
import { useTimerStore } from '../../stores/timerStore';
import { createCalendarEvent } from '../../services/calendar';
import { searchBailianKnowledge } from '../../services/ai';
import { saveDailyStats, getTodayDate, getMantraCountForDate, getFocusMinutesForDate } from '../../services/database';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import ToolResultCard from '../../components/chat/ToolResultCard';

export default function ChatScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const { messages, isLoading, pendingToolCalls, addUserMessage, handleToolResult } = useChatStore();
  const canSend = useUserStore((s) => s.canSendMessage());
  const incrementMessageCount = useUserStore((s) => s.incrementMessageCount);

  const handleSend = useCallback(
    async (text: string) => {
      incrementMessageCount();
      await addUserMessage(text);
    },
    [addUserMessage, incrementMessageCount]
  );

  // Execute tool calls from the LLM
  const executeToolCall = useCallback(
    async (toolCallId: string, toolName: string, args: Record<string, unknown>) => {
      let result = '';

      switch (toolName) {
        case 'schedule_event': {
          const calResult = await createCalendarEvent({
            title: args.title as string,
            date: args.date as string,
            time: args.time as string,
            durationMinutes: (args.duration_minutes as number) || 30,
            reminderMinutes: (args.reminder_minutes as number) || 10,
          });
          result = calResult.success
            ? `已创建日程「${args.title}」在 ${args.date} ${args.time}`
            : `创建失败: ${calResult.error}`;
          break;
        }

        case 'start_pomodoro': {
          const duration = (args.duration_minutes as number) || 25;
          const label = (args.label as string) || '专注';
          useTimerStore.getState().startTimer(duration, label);
          router.push('/pomodoro');
          result = `已启动 ${duration} 分钟番茄钟: ${label}`;
          break;
        }

        case 'stop_pomodoro': {
          useTimerStore.getState().stopTimer(false);
          result = '已停止番茄钟';
          break;
        }

        case 'start_mantra': {
          const target = (args.target_count as number) || 10;
          router.push({ pathname: '/mantra', params: { target: String(target) } });
          result = `已打开口诀工具，目标 ${target} 轮`;
          break;
        }

        case 'write_diary': {
          const date = (args.date as string) || getTodayDate();
          router.push({ pathname: '/diary/[id]', params: { id: date } });
          result = `已打开日记: ${date}`;
          break;
        }

        case 'get_stats': {
          const today = getTodayDate();
          const mantraCount = await getMantraCountForDate(today);
          const focusMins = await getFocusMinutesForDate(today);
          result = `今日统计:\n- 口诀: ${mantraCount} 轮\n- 专注: ${focusMins} 分钟`;
          break;
        }

        case 'content_alert': {
          const level = (args.level as string) || 'moderate';
          result = `已触发${level === 'gentle' ? '温和' : level === 'urgent' ? '紧急' : '中等'}提醒`;
          // The InterventionModal would be triggered here
          break;
        }

        case 'search_knowledge': {
          const query = (args.query as string) || '';
          try {
            result = await searchBailianKnowledge(query);
          } catch (err: any) {
            result = `知识库搜索失败: ${err.message || '请检查百炼配置'}`;
          }
          break;
        }

        default:
          result = `未知工具: ${toolName}`;
      }

      await handleToolResult(toolCallId, toolName, result);
    },
    [router, handleToolResult]
  );

  // Auto-execute pending tool calls
  React.useEffect(() => {
    if (pendingToolCalls.length > 0) {
      const tc = pendingToolCalls[0];
      const args = JSON.parse(tc.function.arguments || '{}');
      executeToolCall(tc.id, tc.function.name, args);
    }
  }, [pendingToolCalls, executeToolCall]);

  const renderItem = useCallback(
    ({ item }: { item: DisplayMessage }) => {
      if (item.role === 'tool_result' && item.toolName && item.toolArgs) {
        return (
          <ToolResultCard
            toolName={item.toolName}
            args={item.toolArgs}
            onPress={() => {
              // Navigate to the relevant tool screen
              if (item.toolName === 'start_mantra') router.push('/mantra');
              else if (item.toolName === 'start_pomodoro') router.push('/pomodoro');
              else if (item.toolName === 'write_diary') router.push('/diary');
            }}
          />
        );
      }
      return <ChatBubble message={item} />;
    },
    [router]
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <ChatInput onSend={handleSend} isLoading={isLoading} disabled={!canSend} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
});
