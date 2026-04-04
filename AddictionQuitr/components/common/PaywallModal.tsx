// PaywallModal - subscription paywall with trial info

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';

interface Props {
  visible: boolean;
  onDismiss: () => void;
  onSubscribe: (plan: 'monthly' | 'annual' | 'lifetime') => void;
  trialDaysLeft?: number;
}

const FEATURES = [
  { icon: '💬', name: '无限AI对话', desc: '随时与你的戒色教练交流' },
  { icon: '📝', name: '日记工具 + AI分析', desc: '深度洞察你的行为模式' },
  { icon: '📊', name: '完整统计面板', desc: '追踪每一个进步' },
  { icon: '📅', name: '日历整合', desc: '智能安排自律日程' },
  { icon: '🍅', name: '番茄钟专注', desc: '进入深度自律状态' },
  { icon: '☁️', name: '云端同步', desc: '数据永不丢失' },
  { icon: '🛡️', name: '内容检测', desc: '智能干预提醒' },
];

export default function PaywallModal({ visible, onDismiss, onSubscribe, trialDaysLeft }: Props) {
  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>

        <Text style={styles.badge}>PRO</Text>
        <Text style={styles.title}>解锁全部功能</Text>
        <Text style={styles.subtitle}>
          {trialDaysLeft !== undefined && trialDaysLeft > 0
            ? `试用还剩 ${trialDaysLeft} 天`
            : '升级为 Pro 会员'}
        </Text>

        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureContent}>
                <Text style={styles.featureName}>{f.name}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <TouchableOpacity
            style={[styles.planCard, styles.planRecommended]}
            onPress={() => onSubscribe('annual')}
          >
            <View style={styles.recommendBadge}>
              <Text style={styles.recommendText}>省40%</Text>
            </View>
            <Text style={styles.planName}>年度会员</Text>
            <Text style={styles.planPrice}>¥128/年</Text>
            <Text style={styles.planUnit}>约 ¥10.7/月</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.planCard} onPress={() => onSubscribe('monthly')}>
            <Text style={styles.planName}>月度会员</Text>
            <Text style={styles.planPrice}>¥18/月</Text>
            <Text style={styles.planUnit}>按月续费</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.planCard} onPress={() => onSubscribe('lifetime')}>
            <Text style={styles.planName}>终身会员</Text>
            <Text style={styles.planPrice}>¥298</Text>
            <Text style={styles.planUnit}>一次购买永久使用</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          订阅将通过您的 Apple/Google 账户收取费用。{'\n'}
          可随时在设置中取消订阅。
        </Text>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2D2D44',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: '#E8E8F0',
    fontSize: 22,
  },
  badge: {
    alignSelf: 'center',
    color: '#FFD93D',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 4,
    backgroundColor: '#FFD93D20',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#E8E8F0',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#A29BFE',
    textAlign: 'center',
    marginBottom: 24,
  },
  features: {
    marginBottom: 30,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E36',
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 14,
    width: 32,
    textAlign: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureName: {
    color: '#E8E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  featureDesc: {
    color: '#666680',
    fontSize: 13,
    marginTop: 2,
  },
  plans: {
    gap: 12,
    marginBottom: 20,
  },
  planCard: {
    backgroundColor: '#1E1E36',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D44',
  },
  planRecommended: {
    borderColor: '#6C5CE7',
    backgroundColor: '#1E1E40',
  },
  recommendBadge: {
    position: 'absolute',
    top: -12,
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
  },
  recommendText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: {
    color: '#E8E8F0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    color: '#FFD93D',
    fontSize: 24,
    fontWeight: '800',
  },
  planUnit: {
    color: '#9999B0',
    fontSize: 13,
    marginTop: 4,
  },
  terms: {
    color: '#666680',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingBottom: 40,
  },
});
