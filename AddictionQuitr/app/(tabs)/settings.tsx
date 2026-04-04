// Settings screen - API key, subscription, preferences

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useUserStore } from '../../stores/userStore';
import { useChatStore } from '../../stores/chatStore';
import { LLM_PROVIDERS, setProvider as setAIProvider, setModel as setAIModel, setApiKey as setAIKey, setCustomBaseUrl, setBailianAppId as setAIBailianAppId, type LLMProvider } from '../../services/ai';
import PaywallModal from '../../components/common/PaywallModal';

export default function SettingsScreen() {
  const { apiKey, setApiKey, isPro, streak, isTrialActive, provider, model, setProvider, setModel, customBaseUrl, setCustomBaseUrl: storeSetCustomBaseUrl, bailianAppId, setBailianAppId } = useUserStore();
  const clearMessages = useChatStore((s) => s.clearMessages);
  const [keyInput, setKeyInput] = useState(apiKey);
  const [appIdInput, setAppIdInput] = useState(bailianAppId);
  const [showPaywall, setShowPaywall] = useState(false);

  const providerOptions = Object.values(LLM_PROVIDERS);
  const currentProviderConfig = LLM_PROVIDERS[provider];

  const handleSaveKey = () => {
    const trimmedKey = keyInput.trim();
    setApiKey(trimmedKey);
    setAIKey(trimmedKey);
    // Also sync Bailian App ID
    const trimmedAppId = appIdInput.trim();
    setBailianAppId(trimmedAppId);
    setAIBailianAppId(trimmedAppId);
    Alert.alert('已保存', `${currentProviderConfig.name} API Key 已更新`);
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
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>会员状态</Text>
        <View style={styles.statusCard}>
          <Text style={styles.statusIcon}>{isPro ? '👑' : '🆓'}</Text>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>
              {isPro ? 'Pro 会员' : isTrialActive() ? '试用中' : '免费版'}
            </Text>
            <Text style={styles.statusDesc}>
              {isPro
                ? '全部功能已解锁'
                : isTrialActive()
                ? '试用期间可体验全部功能'
                : '升级解锁更多功能'}
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>AI 配置</Text>

        <Text style={styles.inputLabel}>模型提供商</Text>
        <View style={styles.providerRow}>
          {providerOptions.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.providerChip,
                provider === p.id && styles.providerChipActive,
              ]}
              onPress={() => handleProviderChange(p.id)}
            >
              <Text
                style={[
                  styles.providerChipText,
                  provider === p.id && styles.providerChipTextActive,
                ]}
              >
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
                  style={[
                    styles.modelChip,
                    model === m && styles.modelChipActive,
                  ]}
                  onPress={() => handleModelChange(m)}
                >
                  <Text
                    style={[
                      styles.modelChipText,
                      model === m && styles.modelChipTextActive,
                    ]}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {provider === 'custom' && (
          <>
            <Text style={styles.inputLabel}>自定义 API 地址 (OpenAI 兼容)</Text>
            <TextInput
              style={styles.input}
              value={customBaseUrl}
              onChangeText={(v) => { storeSetCustomBaseUrl(v); setCustomBaseUrl(v); }}
              placeholder="https://your-api.com/v1/chat/completions"
              placeholderTextColor="#666680"
              autoCapitalize="none"
              keyboardType="url"
            />
          </>
        )}

        <Text style={styles.inputLabel}>{currentProviderConfig.name} API Key</Text>
        <TextInput
          style={styles.input}
          value={keyInput}
          onChangeText={setKeyInput}
          placeholder="sk-..."
          placeholderTextColor="#666680"
          secureTextEntry
          autoCapitalize="none"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveKey}>
          <Text style={styles.saveText}>保存 Key</Text>
        </TouchableOpacity>

        <Text style={[styles.inputLabel, { marginTop: 16 }]}>📚 百炼知识库 App ID（可选）</Text>
        <TextInput
          style={styles.input}
          value={appIdInput}
          onChangeText={setAppIdInput}
          placeholder="填入百炼应用 App ID 开启 RAG 知识库"
          placeholderTextColor="#666680"
          autoCapitalize="none"
        />
        <Text style={styles.hintText}>
          在百炼控制台上传文件→创建知识库→创建应用，将 App ID 填入此处
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>数据</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>连续自律天数</Text>
          <Text style={styles.infoValue}>{streak} 天</Text>
        </View>
        <TouchableOpacity
          style={styles.dangerButton}
          onPress={() => {
            Alert.alert('确认', '确定要清空对话记录吗？', [
              { text: '取消', style: 'cancel' },
              { text: '清空', style: 'destructive', onPress: clearMessages },
            ]);
          }}
        >
          <Text style={styles.dangerText}>清空对话记录</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>关于</Text>
        <Text style={styles.aboutText}>戒色助手 v1.0.0</Text>
        <Text style={styles.aboutDesc}>
          一款 AI 驱动的自律辅助工具。{'\n'}
          帮助你培养健康的生活习惯。
        </Text>
      </View>

      <PaywallModal
        visible={showPaywall}
        onDismiss={() => setShowPaywall(false)}
        onSubscribe={(plan) => {
          setShowPaywall(false);
          Alert.alert('提示', `${plan} 订阅功能将在正式版中上线`);
        }}
      />
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
  inputLabel: {
    color: '#9999B0',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1E1E36',
    borderRadius: 10,
    padding: 14,
    color: '#E8E8F0',
    fontSize: 15,
    marginBottom: 10,
  },
  saveButton: {
    backgroundColor: '#6C5CE7',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1E1E36',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  infoLabel: {
    color: '#E8E8F0',
    fontSize: 15,
  },
  infoValue: {
    color: '#FFD93D',
    fontSize: 15,
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#2D1A1A',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FF6B6B30',
  },
  dangerText: {
    color: '#FF6B6B',
    fontSize: 15,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  providerChip: {
    backgroundColor: '#1E1E36',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  providerChipActive: {
    borderColor: '#6C5CE7',
    backgroundColor: '#6C5CE720',
  },
  providerChipText: {
    color: '#9999B0',
    fontSize: 13,
    fontWeight: '600',
  },
  providerChipTextActive: {
    color: '#A29BFE',
  },
  modelChip: {
    backgroundColor: '#1E1E36',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  modelChipActive: {
    borderColor: '#4ECDC4',
    backgroundColor: '#4ECDC420',
  },
  modelChipText: {
    color: '#666680',
    fontSize: 12,
  },
  modelChipTextActive: {
    color: '#4ECDC4',
  },
  aboutText: {
    color: '#E8E8F0',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  aboutDesc: {
    color: '#9999B0',
    fontSize: 14,
    lineHeight: 22,
  },
  hintText: {
    color: '#666680',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    lineHeight: 18,
  },
});
