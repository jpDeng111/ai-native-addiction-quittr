// Mantra screen - full screen chanting experience

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import MantraScroller from '../components/mantra/MantraScroller';
import CelebrationOverlay from '../components/mantra/CelebrationOverlay';
import { saveMantraRecord, saveDailyStats, getTodayDate, getMantraCountForDate } from '../services/database';
import { useChatStore } from '../stores/chatStore';

export default function MantraScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ target?: string }>();
  const targetCount = parseInt(params.target || '10', 10);

  const [currentRound, setCurrentRound] = useState(1);
  const [isActive, setIsActive] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);

  const handleMantraComplete = useCallback(() => {
    if (currentRound >= targetCount) {
      // All rounds complete!
      setIsActive(false);
      setShowCelebration(true);

      // Save record
      const today = getTodayDate();
      saveMantraRecord({
        id: uuidv4(),
        date: today,
        count: targetCount,
        target_count: targetCount,
        completed: true,
      }).catch(() => {});

      // Update daily stats
      getMantraCountForDate(today).then((total) => {
        saveDailyStats({ date: today, mantra_count: total + targetCount }).catch(() => {});
      });
    } else {
      // Next round
      setCurrentRound((c) => c + 1);
    }
  }, [currentRound, targetCount]);

  const handleClose = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {showCelebration ? (
        <CelebrationOverlay visible={true} completedCount={targetCount} />
      ) : (
        <MantraScroller
          currentRound={currentRound}
          isActive={isActive}
          onMantraComplete={handleMantraComplete}
        />
      )}

      <View style={styles.bottomBar}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {currentRound} / {targetCount}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${(currentRound / targetCount) * 100}%` },
              ]}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
          <Text style={styles.closeText}>
            {showCelebration ? '完成' : '退出'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 50,
    paddingTop: 16,
    backgroundColor: '#0A0A1A80',
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  progressText: {
    color: '#A29BFE',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#2D2D44',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6C5CE7',
    borderRadius: 2,
  },
  closeButton: {
    backgroundColor: '#2D2D44',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  closeText: {
    color: '#E8E8F0',
    fontSize: 16,
    fontWeight: '600',
  },
});
