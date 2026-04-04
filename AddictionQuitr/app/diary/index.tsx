// Diary list screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAllDiaryEntries, getTodayDate } from '../../services/database';

export default function DiaryListScreen() {
  const router = useRouter();
  const [entries, setEntries] = useState<any[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await getAllDiaryEntries();
    setEntries(data);
  };

  const renderEntry = ({ item }: { item: any }) => {
    const analysis = item.analysis_json ? JSON.parse(item.analysis_json) : null;
    return (
      <TouchableOpacity
        style={styles.entry}
        onPress={() => router.push({ pathname: '/diary/[id]', params: { id: item.date } })}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryDate}>{item.date}</Text>
          {analysis?.mood_score && (
            <Text style={styles.moodBadge}>
              {analysis.mood_score >= 7 ? '😊' : analysis.mood_score >= 4 ? '😐' : '😔'}{' '}
              {analysis.mood_score}/10
            </Text>
          )}
        </View>
        <Text style={styles.entryPreview} numberOfLines={2}>
          {item.content}
        </Text>
        {analysis && (
          <View style={styles.tags}>
            {analysis.urge_count > 0 && (
              <Text style={styles.tag}>冲动 ×{analysis.urge_count}</Text>
            )}
            {analysis.good_deeds?.length > 0 && (
              <Text style={[styles.tag, styles.tagGood]}>善行 ×{analysis.good_deeds.length}</Text>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.newButton}
        onPress={() => router.push({ pathname: '/diary/[id]', params: { id: getTodayDate() } })}
      >
        <Text style={styles.newButtonText}>📝 写今天的日记</Text>
      </TouchableOpacity>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>还没有日记记录</Text>
            <Text style={styles.emptyDesc}>开始记录你的每一天吧</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  newButton: {
    backgroundColor: '#6C5CE7',
    margin: 16,
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  newButtonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  list: {
    paddingHorizontal: 16,
  },
  entry: {
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  entryDate: {
    color: '#A29BFE',
    fontSize: 14,
    fontWeight: '600',
  },
  moodBadge: {
    color: '#FFD93D',
    fontSize: 13,
  },
  entryPreview: {
    color: '#C8C8D8',
    fontSize: 15,
    lineHeight: 22,
  },
  tags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  tag: {
    backgroundColor: '#FF6B6B20',
    color: '#FF6B6B',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  tagGood: {
    backgroundColor: '#4ECDC420',
    color: '#4ECDC4',
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    color: '#666680',
    fontSize: 16,
  },
  emptyDesc: {
    color: '#444460',
    fontSize: 14,
    marginTop: 4,
  },
});
