// Pomodoro screen - full screen focus timer

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, AppState } from 'react-native';
import { useRouter } from 'expo-router';
import { useTimerStore } from '../stores/timerStore';
import TimerCircle from '../components/pomodoro/TimerCircle';

export default function PomodoroScreen() {
  const router = useRouter();
  const {
    isRunning,
    isPaused,
    remainingSeconds,
    totalSeconds,
    label,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    tick,
  } = useTimerStore();

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer if not running
  useEffect(() => {
    if (!isRunning) {
      startTimer(25, '专注');
    }
  }, []);

  // Tick every second
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, tick]);

  // Check if timer completed
  useEffect(() => {
    if (!isRunning && totalSeconds > 0 && remainingSeconds <= 0) {
      // Timer completed - could show completion UI
    }
  }, [isRunning, remainingSeconds, totalSeconds]);

  const handlePauseResume = () => {
    if (isPaused) {
      resumeTimer();
    } else {
      pauseTimer();
    }
  };

  const handleStop = () => {
    stopTimer(false);
    router.back();
  };

  const handleComplete = () => {
    stopTimer(true);
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🍅 番茄钟</Text>
        <Text style={styles.subtitle}>{label}</Text>
      </View>

      <View style={styles.timerArea}>
        <TimerCircle
          remainingSeconds={remainingSeconds}
          totalSeconds={totalSeconds}
          label={label}
          isPaused={isPaused}
        />
      </View>

      <View style={styles.motivationArea}>
        <Text style={styles.motivationText}>
          {isPaused
            ? '休息一下，准备好了继续'
            : remainingSeconds > totalSeconds * 0.5
            ? '保持专注，你做得很好！'
            : '快要完成了，坚持住！'}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleStop}>
          <Text style={styles.secondaryText}>放弃</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handlePauseResume}>
          <Text style={styles.primaryText}>{isPaused ? '继续' : '暂停'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleComplete}>
          <Text style={styles.secondaryText}>完成</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    justifyContent: 'space-between',
    paddingTop: 80,
    paddingBottom: 60,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E8E8F0',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#A29BFE',
  },
  timerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  motivationArea: {
    alignItems: 'center',
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  motivationText: {
    color: '#9999B0',
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 20,
  },
  primaryButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryButton: {
    backgroundColor: '#2D2D44',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#9999B0',
    fontSize: 16,
    fontWeight: '600',
  },
});
