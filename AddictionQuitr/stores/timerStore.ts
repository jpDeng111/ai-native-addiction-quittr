// Timer store - manages pomodoro state

import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { savePomodoroSession, getTodayDate } from '../services/database';

interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  sessionId: string | null;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  startedAt: number | null;

  startTimer: (durationMinutes?: number, label?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: (completed?: boolean) => void;
  tick: () => void;
}

export const useTimerStore = create<TimerState>((set, get) => ({
  isRunning: false,
  isPaused: false,
  sessionId: null,
  label: '专注',
  totalSeconds: 25 * 60,
  remainingSeconds: 25 * 60,
  startedAt: null,

  startTimer: (durationMinutes = 25, label = '专注') => {
    const totalSeconds = durationMinutes * 60;
    set({
      isRunning: true,
      isPaused: false,
      sessionId: uuidv4(),
      label,
      totalSeconds,
      remainingSeconds: totalSeconds,
      startedAt: Date.now(),
    });
  },

  pauseTimer: () => {
    set({ isPaused: true });
  },

  resumeTimer: () => {
    set({ isPaused: false });
  },

  stopTimer: (completed = false) => {
    const state = get();
    if (state.sessionId && state.startedAt) {
      const elapsedMinutes = Math.round((state.totalSeconds - state.remainingSeconds) / 60);
      savePomodoroSession({
        id: state.sessionId,
        date: getTodayDate(),
        duration_minutes: elapsedMinutes,
        label: state.label,
        completed,
        started_at: state.startedAt,
        ended_at: Date.now(),
      }).catch(() => {});
    }
    set({
      isRunning: false,
      isPaused: false,
      sessionId: null,
      remainingSeconds: 25 * 60,
      totalSeconds: 25 * 60,
      startedAt: null,
    });
  },

  tick: () => {
    const state = get();
    if (!state.isRunning || state.isPaused) return;

    if (state.remainingSeconds <= 0) {
      // Timer complete
      state.stopTimer(true);
      return;
    }

    set({ remainingSeconds: state.remainingSeconds - 1 });
  },
}));
