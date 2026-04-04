// TimerCircle - circular countdown for pomodoro

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  remainingSeconds: number;
  totalSeconds: number;
  label: string;
  isPaused: boolean;
}

export default function TimerCircle({ remainingSeconds, totalSeconds, label, isPaused }: Props) {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progress = totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0;

  return (
    <View style={styles.container}>
      <View style={styles.outerRing}>
        <View style={[styles.progressRing, { opacity: progress }]} />
        <View style={styles.innerCircle}>
          <Text style={styles.timeText}>
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Text>
          <Text style={styles.labelText}>{label}</Text>
          {isPaused && <Text style={styles.pausedText}>已暂停</Text>}
        </View>
      </View>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 4,
    borderColor: '#6C5CE7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A32',
  },
  progressRing: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 125,
    backgroundColor: '#6C5CE720',
  },
  innerCircle: {
    alignItems: 'center',
  },
  timeText: {
    fontSize: 56,
    fontWeight: '200',
    color: '#E8E8F0',
    fontVariant: ['tabular-nums'],
  },
  labelText: {
    fontSize: 16,
    color: '#A29BFE',
    marginTop: 4,
  },
  pausedText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 8,
  },
  progressBar: {
    width: 200,
    height: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 2,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
});
