// Stats tab screen

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View, RefreshControl } from 'react-native';
import StatCharts from '../../components/stats/StatCharts';
import { getDailyStats, getMantraCountForDate, getFocusMinutesForDate, getCurrentStreak, getTodayDate } from '../../services/database';

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

  const loadStats = async () => {
    try {
      const today = getTodayDate();
      const [mantraCount, focusMins, streak, dailyStats] = await Promise.all([
        getMantraCountForDate(today),
        getFocusMinutesForDate(today),
        getCurrentStreak(),
        getDailyStats(today),
      ]);

      setData((prev) => ({
        ...prev,
        streak,
        todayMantraCount: mantraCount,
        todayFocusMinutes: focusMins,
        todayUrgeCount: dailyStats?.urge_count || 0,
      }));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

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
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#666680',
    fontSize: 13,
  },
});
