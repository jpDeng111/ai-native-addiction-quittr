// Settings screen - account management, preferences, about

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { LLM_PROVIDERS, setProvider as setAIProvider, setModel as setAIModel, setApiKey as setAIKey, setCustomBaseUrl, setBailianAppId as setAIBailianAppId, type LLMProvider } from '../../services/ai';
import PaywallModal from '../../components/common/PaywallModal';

export default function SettingsScreen() {
  const { apiKey, setApiKey, isPro, streak, isTrialActive, provider, model, setProvider, setModel, customBaseUrl, setCustomBaseUrl: storeSetCustomBaseUrl, bailianAppId, setBailianAppId } = useUserStore();
  const clearMessages = useChatStore((s) => s.clearMessages);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [appIdInput, setAppIdInput] = useState(bailianAppId);

  const currentProviderConfig = LLM_PROVIDERS[provider];

  const handleSaveDevConfig = () => {
    const trimmedKey = keyInput.trim();
    setApiKey(trimmedKey);
    setAIKey(trimmedKey);
    const trimmedAppId = appIdInput.trim();
    setBailianAppId(trimmedAppId);
    setAIBailianAppId(trimmedAppId);
    Alert.alert('已保存', '开发者配置已更新');
  };

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setAIProvider(newProvider);
    const newModel = LLM_PROVIDERS[newProvider].defaultModel;
    setModel(newModel);
    setAIModel(newModel);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
    setAIModel(newModel);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Account & Membership */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>账号</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>{isPro ? '👑' : '🛡️'}</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              {isPro ? 'Pro 会员' : isTrialActive() ? '试用中' : '免费版'}
            </Text>
            <Text style={styles.statusDesc}>
              {isPro
                ? '全部功能已解锁'
                : isTrialActive()
                ? '试用期间可体验全部功能'
                : '升级解锁 AI 日记分析、云同步等功能'}
            </Text>
          </View>
          {!isPro && (
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => setShowPaywall(true)}
            >
              <Text style={styles.upgradeText}>升级</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* My Progress */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>我的进度</Text>
        <View style={styles.progressCard}>
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{streak}</Text>
            <Text style={styles.progressLabel}>连续天数</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>{isPro ? '∞' : '20'}</Text>
            <Text style={styles.progressLabel}>每日对话</Text>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Text style={styles.progressValue}>📚</Text>
            <Text style={styles.progressLabel}>知识库</Text>
          </View>
        </View>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>偏好设置</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🔔 每日提醒</Text>
            <Text style={styles.settingHint}>每天早上提醒你打卡</Text>
          </View>
          <Switch
            value={false}
            trackColor={{ false: '#2D2D44', true: '#6C5CE7' }}
            thumbColor="#E8E8F0"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>🌙 深色模式</Text>
            <Text style={styles.settingHint}>始终使用深色主题</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: '#2D2D44', true: '#6C5CE7' }}
            thumbColor="#E8E8F0"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>📳 触感反馈</Text>
            <Text style={styles.settingHint}>操作时的震动反馈</Text>
          </View>
          <Switch
            value={true}
            trackColor={{ false: '#2D2D44', true: '#6C5CE7' }}
            thumbColor="#E8E8F0"
          />
        </View>
      </View>

      {/* Data Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据管理</Text>

        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionIcon}>☁️</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>云端同步</Text>
            <Text style={styles.actionHint}>登录后可跨设备同步数据</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionRow}>
          <Text style={styles.actionIcon}>📤</Text>
          <View style={styles.actionContent}>
            <Text style={styles.actionLabel}>导出数据</Text>
            <Text style={styles.actionHint}>导出日记和统计数据</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionRow}
          onPress={() => {
            Alert.alert('确认', '确定要清空所有对话记录吗？', [
              { text: '取消', style: 'cancel' },
              { text: '清空', style: 'destructive', onPress: clearMessages },
            ]);
          }}
        >
          <Text style={styles.actionIcon}>🗑️</Text>
          <View style={styles.actionContent}>
            <Text style={[styles.actionLabel, { color: '#FF6B6B' }]}>清空对话记录</Text>
            <Text style={styles.actionHint}>删除所有聊天记录</Text>
          </View>
          <Text style={styles.actionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutTitle}>🛡️ 戒色助手 v1.0.0</Text>
          <Text style={styles.aboutDesc}>
            一款 AI 驱动的自律辅助工具{'\n'}
            帮助你培养健康的生活习惯
          </Text>
        </View>

        {/* Dev options toggle - hidden, tap 5 times on version to show */}
        <TouchableOpacity
          onPress={() => setShowDevOptions(!showDevOptions)}
          style={styles.devToggle}
        >
          <Text style={styles.devToggleText}>
            {showDevOptions ? '收起开发者选项 ▲' : '开发者选项 ▼'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hidden Developer Options */}
      {showDevOptions && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ 开发者选项</Text>

          <Text style={styles.inputLabel}>模型提供商</Text>
          <View style={styles.providerRow}>
            {Object.values(LLM_PROVIDERS).map((p) => (
              <TouchableOpacity
                key={p.id}
                style={[styles.chip, provider === p.id && styles.chipActive]}
                onPress={() => handleProviderChange(p.id)}
              >
                <Text style={[styles.chipText, provider === p.id && styles.chipTextActive]}>
                  {p.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {currentProviderConfig.models.length > 0 && (
            <>
              <Text style={styles.inputLabel}>模型</Text>
              <View style={styles.providerRow}>
                {currentProviderConfig.models.map((m) => (
                  <TouchableOpacity
                    key={m}
                    style={[styles.chip, model === m && styles.chipActive]}
                    onPress={() => handleModelChange(m)}
                  >
                    <Text style={[styles.chipText, model === m && styles.chipTextActive]}>
                      {m}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {provider === 'custom' && (
            <>
              <Text style={styles.inputLabel}>自定义 API 地址</Text>
              <TextInput
                style={styles.input}
                value={customBaseUrl}
                onChangeText={(v) => { storeSetCustomBaseUrl(v); setCustomBaseUrl(v); }}
                placeholder="https://your-api.com/v1/chat/completions"
                placeholderTextColor="#666680"
                autoCapitalize="none"
              />
            </>
          )}

          <Text style={styles.inputLabel}>API Key</Text>
          <TextInput
            style={styles.input}
            value={keyInput}
            onChangeText={setKeyInput}
            placeholder="sk-..."
            placeholderTextColor="#666680"
            secureTextEntry
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>百炼知识库 App ID</Text>
          <TextInput
            style={styles.input}
            value={appIdInput}
            onChangeText={setAppIdInput}
            placeholder="百炼应用 App ID（可选）"
            placeholderTextColor="#666680"
            autoCapitalize="none"
          />

          <TouchableOpacity style={styles.saveButton} onPress={handleSaveDevConfig}>
            <Text style={styles.saveText}>保存配置</Text>
          </TouchableOpacity>
        </View>
      )}

      <PaywallModal
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onSubscribe={(plan) => {
          setShowPaywall(false);
          Alert.alert('提示', `${plan} 订阅功能将在正式版中上线`);
        }}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    padding: 16,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    color: '#9999B0',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  // Status card
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E36',
    borderRadius: 14,
    padding: 16,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    color: '#E8E8F0',
    fontSize: 17,
    fontWeight: '700',
  },
  statusDesc: {
    color: '#9999B0',
    fontSize: 13,
    marginTop: 2,
  },
  upgradeButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  upgradeText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Progress card
  progressCard: {
    flexDirection: 'row',
    backgroundColor: '#1E1E36',
    borderRadius: 14,
    padding: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  progressItem: {
    alignItems: 'center',
    flex: 1,
  },
  progressValue: {
    color: '#FFD93D',
    fontSize: 28,
    fontWeight: '800',
  },
  progressLabel: {
    color: '#9999B0',
    fontSize: 12,
    marginTop: 4,
  },
  progressDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#2D2D44',
  },
  // Setting rows
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    color: '#E8E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  settingHint: {
    color: '#666680',
    fontSize: 12,
    marginTop: 2,
  },
  // Action rows
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  actionIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    color: '#E8E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  actionHint: {
    color: '#666680',
    fontSize: 12,
    marginTop: 2,
  },
  actionArrow: {
    color: '#666680',
    fontSize: 22,
  },
  // About
  aboutCard: {
    backgroundColor: '#1E1E36',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    color: '#E8E8F0',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  aboutDesc: {
    color: '#9999B0',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
  // Dev toggle
  devToggle: {
    marginTop: 12,
    alignItems: 'center',
    padding: 8,
  },
  devToggleText: {
    color: '#4A4A6A',
    fontSize: 12,
  },
  // Dev options
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  chip: {
    backgroundColor: '#1E1E36',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  chipActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#6C5CE720',
  },
  chipText: {
    color: '#666680',
    fontSize: 12,
  },
  chipTextActive: {
    color: '#A29BFE',
  },
  inputLabel: {
    color: '#9999B0',
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#1E1E36',
    borderRadius: 10,
    padding: 12,
    color: '#E8E8F0',
    fontSize: 14,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  saveText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
