// Root layout - app-wide providers and navigation structure

import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { getDatabase } from '../services/database';
import { useChatStore } from '../stores/chatStore';

export default function RootLayout() {
  useEffect(() => {
    // Initialize database and load today's chat session
    const initApp = async () => {
      await getDatabase();
      // Load today's chat session after database is ready
      await useChatStore.getState().loadTodaySession();
    };
    initApp().catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0A1A' },
          headerTintColor: '#E8E8F0',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0A0A1A' },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="mantra"
          options={{
            title: '念口诀',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="pomodoro"
          options={{
            title: '番茄钟',
            presentation: 'fullScreenModal',
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="diary/index"
          options={{ title: '日记' }}
        />
        <Stack.Screen
          name="diary/[id]"
          options={{ title: '写日记' }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
});
