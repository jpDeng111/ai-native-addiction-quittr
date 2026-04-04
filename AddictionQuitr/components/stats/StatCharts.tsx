// StatCharts - simple stats visualization for dashboard

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatData {
  streak: number;
  todayMantraCount: number;
  todayFocusMinutes: number;
  todayUrgeCount: number;
  weeklyMood: number[];
  weeklyUrges: number[];
}

interface Props {
  data: StatData;
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function MiniBarChart({ data, color, label }: { data: number[]; color: string; label: string }) {
  const max = Math.max(...data, 1);
  return (
    <View style={styles.chartContainer}>
      <Text style={styles.chartLabel}>{label}</Text>
      <View style={styles.barRow}>
        {data.map((val, i) => (
          <View key={i} style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max((val / max) * 60, 4),
                  backgroundColor: color,
                },
              ]}
            />
            <Text style={styles.barDay}>{['一', '二', '三', '四', '五', '六', '日'][i]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function StatCharts({ data }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.streakBanner}>
        <Text style={styles.streakEmoji}>🔥</Text>
        <Text style={styles.streakNumber}>{data.streak}</Text>
        <Text style={styles.streakLabel}>天连续自律</Text>
      </View>

      <View style={styles.cardRow}>
        <StatCard icon="🙏" label="今日口诀" value={`${data.todayMantraCount}轮`} color="#A29BFE" />
        <StatCard icon="🍅" label="今日专注" value={`${data.todayFocusMinutes}分`} color="#E17055" />
        <StatCard icon="⚡" label="今日冲动" value={`${data.todayUrgeCount}次`} color="#FF6B6B" />
      </View>

      <MiniBarChart data={data.weeklyMood} color="#4ECDC4" label="本周心情趋势" />
      <MiniBarChart data={data.weeklyUrges} color="#FF6B6B" label="本周冲动次数" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  streakBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E36',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  streakEmoji: {
    fontSize: 32,
    marginRight: 8,
  },
  streakNumber: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFD93D',
    marginRight: 4,
  },
  streakLabel: {
    fontSize: 16,
    color: '#9999B0',
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    color: '#9999B0',
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  chartLabel: {
    color: '#9999B0',
    fontSize: 14,
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 4,
    minHeight: 4,
  },
  barDay: {
    color: '#666680',
    fontSize: 11,
    marginTop: 6,
  },
});
