// CelebrationOverlay - confetti/celebration when mantra target reached

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  visible: boolean;
  completedCount: number;
}

// Simple particle-based celebration effect
function Particle({ delay, startX }: { delay: number; startX: number }) {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(startX)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(translateY, {
          toValue: SCREEN_HEIGHT * 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: startX + (Math.random() - 0.5) * 100,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, { toValue: 0, duration: 500, useNativeDriver: true }),
    ]);
    animation.start();
  }, []);

  const colors = ['#6C5CE7', '#A29BFE', '#FFD93D', '#FF6B6B', '#4ECDC4', '#45B7D1'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: color,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    />
  );
}

export default function CelebrationOverlay({ visible, completedCount }: Props) {
  if (!visible) return null;

  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    delay: Math.random() * 500,
    startX: Math.random() * SCREEN_WIDTH,
  }));

  return (
    <View style={styles.overlay}>
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} startX={p.startX} />
      ))}
      <View style={styles.messageContainer}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>恭喜完成！</Text>
        <Text style={styles.subtitle}>你已完成 {completedCount} 轮口诀</Text>
        <Text style={styles.encouragement}>内心越来越强大！</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 25, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  particle: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    top: 0,
  },
  messageContainer: {
    alignItems: 'center',
    padding: 30,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD93D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#A29BFE',
    marginBottom: 4,
  },
  encouragement: {
    fontSize: 16,
    color: '#9999B0',
    marginTop: 8,
  },
});
