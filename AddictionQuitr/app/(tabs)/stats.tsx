// Stats tab screen

import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import { useFocusEffect } from 'expo-router';
import StatCharts from '../../components/stats/StatCharts';
import { getDailyStats, getMantraCountForDate, getFocusMinutesForDate, getCurrentStreak, getTodayDate, getChecklistForDate } from '../../services/database';

const categories = [
  { key: 'early_sleep', name: '早睡早起', icon: '🌙' },
  { key: 'exercise', name: '健身运动', icon: '💪' },
  { key: 'reading', name: '读书学习', icon: '📖' },
  { key: 'good_deed', name: '日行一善', icon: '🤝' },
  { key: 'reflection', name: '每日反省', icon: '🪞' },
  { key: 'health_practice', name: '养生功法', icon: '🧘' },
];

export default function StatsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    streak: 0,
    todayMantraCount: 0,
    todayFocusMinutes: 0,
    todayUrgeCount: 0,
    weeklyMood: [5, 6, 7, 5, 6, 8, 7],
    weeklyUrges: [2, 1, 3, 0, 1, 0, 1],
  });
  const [checklistItems, setChecklistItems] = useState<string[]>([]);

  const loadStats = async () => {
    try {
      const today = getTodayDate();
      const [mantraCount, focusMins, streak, dailyStats, checklist] = await Promise.all([
        getMantraCountForDate(today),
        getFocusMinutesForDate(today),
        getCurrentStreak(),
        getDailyStats(today),
        getChecklistForDate(today),
      ]);

      setData((prev) => ({
        ...prev,
        streak,
        todayMantraCount: mantraCount,
        todayFocusMinutes: focusMins,
        todayUrgeCount: dailyStats?.urge_count || 0,
      }));
      setChecklistItems(checklist.map((item: any) => item.category));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6C5CE7" />}
    >
      <StatCharts data={data} />

      {/* 七步法每日修行 Checklist Section */}
      <View style={styles.checklistSection}>
        <Text style={styles.checklistHeader}>七步法·每日修行</Text>
        <View style={styles.checklistGrid}>
          {categories.map((cat) => {
            const isCompleted = checklistItems.includes(cat.key);
            return (
              <View
                key={cat.key}
                style={[
                  styles.checklistCard,
                  isCompleted && styles.checklistCardCompleted,
                ]}
              >
                <Text style={styles.checklistIcon}>{cat.icon}</Text>
                <Text style={styles.checklistName}>{cat.name}</Text>
                <Text
                  style={[
                    styles.checklistStatus,
                    isCompleted ? styles.checklistStatusCompleted : styles.checklistStatusPending,
                  ]}
                >
                  {isCompleted ? '✓ 已完成' : '○ 未完成'}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>下拉刷新数据</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  checklistSection: {
    padding: 16,
    paddingTop: 8,
  },
  checklistHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#E8E8F0',
    marginBottom: 16,
    textAlign: 'center',
  },
  checklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  checklistCard: {
    width: '48%',
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  checklistCardCompleted: {
    borderColor: '#4CAF50',
    backgroundColor: '#1E2E2E',
  },
  checklistIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  checklistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E8E8F0',
    marginBottom: 6,
  },
  checklistStatus: {
    fontSize: 12,
    fontWeight: '500',
  },
  checklistStatusCompleted: {
    color: '#4CAF50',
  },
  checklistStatusPending: {
    color: '#666680',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#666680',
    fontSize: 13,
  },
});
