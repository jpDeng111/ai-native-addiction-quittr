// MantraScroller - vertical scrolling mantras with animation

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const MANTRAS = ['念起即断', '念起不随', '念起即觉', '觉之即无'];

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MANTRA_HEIGHT = 100;

interface Props {
  currentRound: number;
  isActive: boolean;
  onMantraComplete: () => void;
}

export default function MantraScroller({ currentRound, isActive, onMantraComplete }: Props) {
  const scrollAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (!isActive) return;

    scrollAnim.setValue(SCREEN_HEIGHT);

    Animated.timing(scrollAnim, {
      toValue: -MANTRAS.length * MANTRA_HEIGHT,
      duration: 4000,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        onMantraComplete();
      }
    });

    return () => {
      scrollAnim.stopAnimation();
    };
  }, [currentRound, isActive]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.mantrasContainer,
          { transform: [{ translateY: scrollAnim }] },
        ]}
      >
        {MANTRAS.map((mantra, index) => (
          <View key={index} style={styles.mantraItem}>
            <Text style={styles.mantraText}>{mantra}</Text>
          </View>
        ))}
      </Animated.View>

      <View style={styles.centerLine} />

      <View style={styles.roundBadge}>
        <Text style={styles.roundText}>第 {currentRound} 轮</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mantrasContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  mantraItem: {
    height: MANTRA_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mantraText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#E8E8F0',
    letterSpacing: 8,
    textShadowColor: '#6C5CE7',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  centerLine: {
    position: 'absolute',
    width: '60%',
    height: 2,
    backgroundColor: '#6C5CE740',
    top: '50%',
  },
  roundBadge: {
    position: 'absolute',
    top: 60,
    backgroundColor: '#6C5CE730',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  roundText: {
    color: '#A29BFE',
    fontSize: 16,
    fontWeight: '600',
  },
});
