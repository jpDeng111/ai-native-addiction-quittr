// Tool result card - renders inline tool call results in chat

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface Props {
  toolName: string;
  args: Record<string, unknown>;
  onPress?: () => void;
}

export default function ToolResultCard({ toolName, args, onPress }: Props) {
  const config = getToolConfig(toolName);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.icon}>{config.icon}</Text>
      <View style={styles.content}>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.getDescription(args)}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

function getToolConfig(toolName: string) {
  const configs: Record<string, { icon: string; title: string; getDescription: (args: any) => string }> = {
    schedule_event: {
      icon: '📅',
      title: '日程安排',
      getDescription: (args) => `${args.title || '新事件'} - ${args.date || ''} ${args.time || ''}`,
    },
    start_pomodoro: {
      icon: '🍅',
      title: '番茄钟',
      getDescription: (args) => `${args.duration_minutes || 25}分钟专注 - ${args.label || '自律时间'}`,
    },
    stop_pomodoro: {
      icon: '⏹',
      title: '停止番茄钟',
      getDescription: () => '结束当前专注时间',
    },
    start_mantra: {
      icon: '🙏',
      title: '念口诀',
      getDescription: (args) => `目标: ${args.target_count || 10}轮`,
    },
    write_diary: {
      icon: '📝',
      title: '写日记',
      getDescription: (args) => args.prompt || '记录今天的感悟',
    },
    get_stats: {
      icon: '📊',
      title: '查看统计',
      getDescription: (args) => {
        const periodMap: Record<string, string> = { today: '今天', week: '本周', month: '本月', all: '全部' };
        return periodMap[args.period as string] || '今天';
      },
    },
    content_alert: {
      icon: '⚠️',
      title: '内容提醒',
      getDescription: (args) => args.message || '请注意你的浏览内容',
    },
    search_knowledge: {
      icon: '📚',
      title: '搜索知识库',
      getDescription: (args) => `搜索: ${args.query || '知识库查询'}`,
    },
    track_checklist: {
      icon: '✅',
      title: '七步法修行',
      getDescription: (args: Record<string, unknown>) => {
        if (args.action === 'check_progress') return '查看今日进度';
        const names: Record<string, string> = {
          early_sleep: '早睡早起', exercise: '健身运动', reading: '读书学习',
          good_deed: '日行一善', reflection: '每日反省', health_practice: '养生功法'
        };
        return `记录: ${names[args.category as string] || '修行'}`;
      },
    },
    track_emotion: {
      icon: '💭',
      title: '情绪管理',
      getDescription: (args: Record<string, unknown>) => {
        const types: Record<string, string> = {
          emotion_log: '情绪记录', solitude_checkin: '独处守护', visual_trigger: '视线管理'
        };
        const emotions: Record<string, string> = {
          peace: '平静', anxiety: '焦虑', boredom: '无聊', frustration: '挫败',
          urge: '冲动', excitement: '兴奋', sadness: '悲伤', gratitude: '感恩'
        };
        return `${types[args.type as string] || '记录'} - ${emotions[args.emotion as string] || ''}`;
      },
    },
    manage_goals: {
      icon: '🎯',
      title: '目标与德行',
      getDescription: (args: Record<string, unknown>) => {
        const types: Record<string, string> = {
          set_goal: '设定目标', review_goals: '查看目标', log_virtue: '德行修炼', learning_plan: '学习规划'
        };
        return types[args.type as string] || '管理目标';
      },
    },
    sleep_schedule: {
      icon: '🌙',
      title: '早睡计划',
      getDescription: (args: Record<string, unknown>) => {
        const actions: Record<string, string> = {
          set_schedule: '设定计划', log_actual: '记录睡眠', get_report: '查看报告'
        };
        if (args.action === 'set_schedule') return `目标: ${args.target_bedtime || '22:00'} 就寝`;
        return actions[args.action as string] || '睡眠管理';
      },
    },
  };
  return configs[toolName] || { icon: '🔧', title: toolName, getDescription: () => '执行中...' };
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A32',
    borderRadius: 14,
    padding: 14,
    marginVertical: 6,
    marginHorizontal: 12,
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  icon: {
    fontSize: 28,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    color: '#E8E8F0',
    fontSize: 15,
    fontWeight: '700',
  },
  description: {
    color: '#9999B0',
    fontSize: 13,
    marginTop: 2,
  },
  arrow: {
    color: '#6C5CE7',
    fontSize: 24,
    fontWeight: '300',
  },
});
