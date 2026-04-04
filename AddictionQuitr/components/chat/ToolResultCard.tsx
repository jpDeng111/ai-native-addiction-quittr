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
