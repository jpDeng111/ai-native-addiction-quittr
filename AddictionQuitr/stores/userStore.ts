// User store - preferences, streak, subscription status

import { create } from 'zustand';
import type { LLMProvider } from '../services/ai';

interface UserState {
  streak: number;
  trialEndDate: string | null;
  isPro: boolean;
  dailyMessageCount: number;
  maxFreeMessages: number;
  apiKey: string;
  provider: LLMProvider;
  model: string;
  customBaseUrl: string;
  bailianAppId: string;

  setStreak: (streak: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  setIsPro: (isPro: boolean) => void;
  incrementMessageCount: () => void;
  resetDailyMessageCount: () => void;
  canSendMessage: () => boolean;
  setApiKey: (key: string) => void;
  setProvider: (provider: LLMProvider) => void;
  setModel: (model: string) => void;
  setCustomBaseUrl: (url: string) => void;
  setBailianAppId: (appId: string) => void;
  initializeTrial: () => void;
  isTrialActive: () => boolean;
}

export const useUserStore = create<UserState>((set, get) => ({
  streak: 0,
  trialEndDate: null,
  isPro: false,
  dailyMessageCount: 0,
  maxFreeMessages: 20,
  apiKey: '',
  provider: 'qwen' as LLMProvider,
  model: 'qwen-plus',
  customBaseUrl: '',
  bailianAppId: '',

  setStreak: (streak: number) => set({ streak }),
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
  resetStreak: () => set({ streak: 0 }),
  setIsPro: (isPro: boolean) => set({ isPro }),
  incrementMessageCount: () =>
    set((state) => ({ dailyMessageCount: state.dailyMessageCount + 1 })),
  resetDailyMessageCount: () => set({ dailyMessageCount: 0 }),

  canSendMessage: () => {
    const state = get();
    if (state.isPro) return true;
    if (state.isTrialActive()) return true;
    return state.dailyMessageCount < state.maxFreeMessages;
  },

  setApiKey: (key: string) => set({ apiKey: key }),
  setProvider: (provider: LLMProvider) => set({ provider }),
  setModel: (model: string) => set({ model }),
  setCustomBaseUrl: (url: string) => set({ customBaseUrl: url }),
  setBailianAppId: (appId: string) => set({ bailianAppId: appId }),

  initializeTrial: () => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    set({ trialEndDate: endDate.toISOString() });
  },

  isTrialActive: () => {
    const state = get();
    if (!state.trialEndDate) return false;
    return new Date() < new Date(state.trialEndDate);
  },
}));
