// Chat bubble component

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { DisplayMessage } from '../../stores/chatStore';

interface Props {
  message: DisplayMessage;
}

export default function ChatBubble({ message }: Props) {
  const isUser = message.role === 'user';
  const isToolResult = message.role === 'tool_result';

  if (isToolResult) {
    return (
      <View style={styles.toolContainer}>
        <View style={styles.toolBubble}>
          <Text style={styles.toolIcon}>⚡</Text>
          <View style={styles.toolContent}>
            <Text style={styles.toolName}>{getToolDisplayName(message.toolName)}</Text>
            <Text style={styles.toolText}>{message.content}</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

function getToolDisplayName(toolName?: string): string {
  const nameMap: Record<string, string> = {
    schedule_event: '📅 日程安排',
    start_pomodoro: '🍅 番茄钟',
    stop_pomodoro: '⏹ 停止番茄钟',
    start_mantra: '🙏 念口诀',
    write_diary: '📝 写日记',
    get_stats: '📊 查看统计',
    content_alert: '⚠️ 内容提醒',
    search_knowledge: '📚 搜索知识库',
  };
  return nameMap[toolName || ''] || `🔧 ${toolName}`;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: '#6C5CE7',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#2D2D44',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#FFFFFF',
  },
  assistantText: {
    color: '#E8E8F0',
  },
  toolContainer: {
    marginVertical: 4,
    marginHorizontal: 12,
    alignItems: 'center',
  },
  toolBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#3D3D5C',
  },
  toolIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  toolContent: {
    flex: 1,
  },
  toolName: {
    color: '#A29BFE',
    fontSize: 13,
    fontWeight: '600',
  },
  toolText: {
    color: '#9999B0',
    fontSize: 13,
    marginTop: 2,
  },
});
