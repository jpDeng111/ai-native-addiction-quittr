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
import {
  saveDailyStats,
  getTodayDate,
  getMantraCountForDate,
  getFocusMinutesForDate,
  getTodayProgress,
  saveChecklistItem,
  saveEmotionLog,
  getActiveGoals,
  saveGoal,
  saveVirtueLog,
  saveSleepLog,
  getSleepLogForDate,
  getSessionSummaryText,
  getSessionMessageCount,
} from '../../services/database';
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
          const prompt = args.prompt as string || '';

          // Get today's conversation as context for diary
          const sessionText = await getSessionSummaryText(date);
          const messageCount = await getSessionMessageCount(date);

          router.push({ pathname: '/diary/[id]', params: { id: date, prompt } });
          result = `已打开日记: ${date}${prompt ? ' - ' + prompt : ''}。今日已有${messageCount}条对话记录可作为反省参考。`;
          break;
        }

        case 'get_stats': {
          const today = getTodayDate();
          const mantraCount = await getMantraCountForDate(today);
          const focusMins = await getFocusMinutesForDate(today);
          result = `今日统计:\n- 口诀: ${mantraCount} 轮\n- 专注: ${focusMins} 分钟`;

          // Add framework progress
          const todayProgress = await getTodayProgress();
          const checklistCompleted = todayProgress.checklistCompleted;
          const categoryNames: Record<string, string> = {
            early_sleep: '早睡', exercise: '健身', reading: '读书',
            good_deed: '行善', reflection: '反省', health_practice: '养生'
          };
          const completedStr = checklistCompleted.map((c: string) => categoryNames[c] || c).join('、') || '无';
          const pendingCategories = ['early_sleep', 'exercise', 'reading', 'good_deed', 'reflection', 'health_practice']
            .filter(c => !checklistCompleted.includes(c))
            .map(c => categoryNames[c]);
          const pendingStr = pendingCategories.join('、') || '全部完成!';

          // Append to existing result
          result += `\n七步法进度: ${checklistCompleted.length}/6 已完成\n已完成: ${completedStr}\n待完成: ${pendingStr}`;
          if (todayProgress.lastEmotion) {
            result += `\n最近情绪: ${todayProgress.lastEmotion.emotion}(强度${todayProgress.lastEmotion.intensity}/10)`;
          }
          result += `\n今日德行: ${todayProgress.virtueLogsToday}条`;
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

        case 'track_checklist': {
          const action = (args.action as string) || 'check_progress';
          const category = args.category as string;

          if (action === 'check_progress') {
            const progress = await getTodayProgress();
            const completed = progress.checklistCompleted;
            const categories = ['early_sleep', 'exercise', 'reading', 'good_deed', 'reflection', 'health_practice'];
            const categoryNames: Record<string, string> = {
              early_sleep: '早睡早起', exercise: '健身运动', reading: '读书学习',
              good_deed: '日行一善', reflection: '每日反省', health_practice: '养生功法'
            };
            const completedNames = completed.map((c: string) => categoryNames[c] || c);
            const pendingNames = categories.filter(c => !completed.includes(c)).map(c => categoryNames[c]);
            result = `今日七步法进度: ${completed.length}/${categories.length}\n已完成: ${completedNames.join('、') || '无'}\n待完成: ${pendingNames.join('、') || '全部完成！'}`;
          } else {
            const details = (args.details as string) || '';
            const notes = (args.notes as string) || '';
            const today = new Date().toISOString().split('T')[0];
            await saveChecklistItem({
              id: Date.now().toString(),
              date: today,
              category,
              details: JSON.stringify({ details, notes }),
              completed_at: Date.now(),
            });
            const categoryNames: Record<string, string> = {
              early_sleep: '早睡早起', exercise: '健身运动', reading: '读书学习',
              good_deed: '日行一善', reflection: '每日反省', health_practice: '养生功法'
            };
            result = `已记录${categoryNames[category] || category}: ${details || '完成'}`;
          }
          break;
        }

        case 'track_emotion': {
          const type = (args.type as string) || 'emotion_log';
          const emotion = (args.emotion as string) || 'peace';
          const intensity = (args.intensity as number) || 5;
          const context = (args.context as string) || '';
          const needIntervention = (args.need_intervention as boolean) || false;
          const today = new Date().toISOString().split('T')[0];

          const emotionNames: Record<string, string> = {
            peace: '平静', anxiety: '焦虑', boredom: '无聊', frustration: '挫败',
            urge: '冲动', excitement: '兴奋', sadness: '悲伤', gratitude: '感恩'
          };
          const typeNames: Record<string, string> = {
            emotion_log: '情绪记录', solitude_checkin: '独处守护', visual_trigger: '视线管理'
          };

          await saveEmotionLog({
            id: Date.now().toString(),
            date: today,
            type,
            emotion,
            intensity,
            context,
            intervention_used: needIntervention ? 'pending' : 'none',
          });

          let interventionHint = '';
          if (needIntervention || intensity >= 7) {
            interventionHint = '\n⚠️ 建议立即使用断念口诀或番茄钟来稳定状态';
          }

          result = `${typeNames[type]}已记录: ${emotionNames[emotion]}(强度${intensity}/10)${context ? ' - ' + context : ''}${interventionHint}`;
          break;
        }

        case 'manage_goals': {
          const type = args.type as string;

          if (type === 'review_goals') {
            const goals = await getActiveGoals();
            if (goals.length === 0) {
              result = '当前没有设定目标。建议设定短期、中期、长期目标来引导你的自律之路。';
            } else {
              const goalList = goals.map((g: any) => {
                const timeLabels: Record<string, string> = { short_1yr: '短期', medium_3yr: '中期', long_10yr: '长期' };
                return `- [${timeLabels[g.timeframe] || g.timeframe}] ${g.goal_text}`;
              }).join('\n');
              result = `当前活跃目标 (${goals.length}个):\n${goalList}`;
            }
          } else if (type === 'set_goal') {
            const goalText = (args.goal_text as string) || '';
            const category = (args.category as string) || 'health';
            const timeframe = (args.timeframe as string) || 'short_1yr';
            await saveGoal({
              id: Date.now().toString(),
              type: 'goal',
              category,
              timeframe,
              goal_text: goalText,
              status: 'active',
            });
            result = `已设定目标: ${goalText}`;
          } else if (type === 'log_virtue') {
            const virtueType = (args.virtue_type as string) || '';
            const situation = (args.situation as string) || '';
            const actionTaken = (args.action_taken as string) || '';
            const today = new Date().toISOString().split('T')[0];
            await saveVirtueLog({
              id: Date.now().toString(),
              date: today,
              virtue_type: virtueType,
              situation,
              action_taken: actionTaken,
              notes: (args.notes as string) || '',
            });
            result = `德行修炼已记录: ${virtueType} - ${actionTaken || situation}`;
          } else {
            result = '已收到学习规划请求，建议使用搜索知识库获取相关学习资料。';
          }
          break;
        }

        case 'sleep_schedule': {
          const action = (args.action as string) || 'get_report';
          const today = new Date().toISOString().split('T')[0];

          if (action === 'set_schedule') {
            const targetBedtime = (args.target_bedtime as string) || '22:00';
            const targetWakeTime = (args.target_wake_time as string) || '06:00';
            await saveSleepLog({
              id: Date.now().toString(),
              date: today,
              target_bedtime: targetBedtime,
              target_wake_time: targetWakeTime,
            });
            result = `早睡计划已设定: 目标就寝 ${targetBedtime}，目标起床 ${targetWakeTime}`;
          } else if (action === 'log_actual') {
            const actualBedtime = (args.actual_bedtime as string) || '';
            const actualWakeTime = (args.actual_wake_time as string) || '';
            const quality = (args.sleep_quality as string) || 'fair';
            const barriers = (args.barriers as string) || '';
            const qualityNames: Record<string, string> = { good: '良好', fair: '一般', poor: '较差' };
            await saveSleepLog({
              id: Date.now().toString(),
              date: today,
              actual_bedtime: actualBedtime,
              actual_wake_time: actualWakeTime,
              sleep_quality: quality,
              barriers: barriers || undefined,
            });
            result = `睡眠记录已保存: 就寝 ${actualBedtime}，起床 ${actualWakeTime}，质量 ${qualityNames[quality] || quality}${barriers ? '，障碍: ' + barriers : ''}`;
          } else {
            const log = await getSleepLogForDate(today);
            if (log) {
              result = `今日睡眠: 目标 ${log.target_bedtime || '未设定'}-${log.target_wake_time || '未设定'}，实际 ${log.actual_bedtime || '未记录'}-${log.actual_wake_time || '未记录'}，质量 ${log.sleep_quality || '未评价'}`;
            } else {
              result = '今天还没有睡眠记录。建议设定早睡计划（目标22:00就寝）。';
            }
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
