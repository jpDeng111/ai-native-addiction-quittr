// InterventionModal - content detection alert / breathing exercise

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';

interface Props {
  visible: boolean;
  level: 'gentle' | 'moderate' | 'urgent';
  message?: string;
  onDismiss: () => void;
  onStartMantra: () => void;
  onStartPomodoro: () => void;
}

export default function InterventionModal({
  visible,
  level,
  message,
  onDismiss,
  onStartMantra,
  onStartPomodoro,
}: Props) {
  const [breathCount, setBreathCount] = useState(0);

  const levelConfig = {
    gentle: {
      title: '温馨提醒',
      icon: '🌿',
      color: '#4ECDC4',
      bg: '#1A2E2B',
    },
    moderate: {
      title: '注意一下',
      icon: '⚡',
      color: '#FFD93D',
      bg: '#2E2A1A',
    },
    urgent: {
      title: '停下来！',
      icon: '🛑',
      color: '#FF6B6B',
      bg: '#2E1A1A',
    },
  };

  const config = levelConfig[level];

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent>
      <View style={[styles.overlay, { backgroundColor: config.bg + 'F0' }]}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[styles.title, { color: config.color }]}>{config.title}</Text>
        <Text style={styles.message}>
          {message || '深呼吸，你比诱惑更强大。\n让我们一起度过这个时刻。'}
        </Text>

        <View style={styles.breathSection}>
          <Text style={styles.breathLabel}>深呼吸 {breathCount}/3</Text>
          <TouchableOpacity
            style={[styles.breathButton, { borderColor: config.color }]}
            onPress={() => setBreathCount((c) => Math.min(c + 1, 3))}
          >
            <Text style={styles.breathButtonText}>
              {breathCount < 3 ? '按住深呼吸' : '很好！'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#6C5CE7' }]}
            onPress={onStartMantra}
          >
            <Text style={styles.actionText}>🙏 念口诀</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#E17055' }]}
            onPress={onStartPomodoro}
          >
            <Text style={styles.actionText}>🍅 番茄钟</Text>
          </TouchableOpacity>
        </View>

        {breathCount >= 3 && (
          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>我已经平静下来了</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    color: '#C8C8D8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  breathSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  breathLabel: {
    color: '#9999B0',
    fontSize: 14,
    marginBottom: 12,
  },
  breathButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E3620',
  },
  breathButtonText: {
    color: '#E8E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  dismissButton: {
    marginTop: 20,
    padding: 12,
  },
  dismissText: {
    color: '#666680',
    fontSize: 14,
  },
});
