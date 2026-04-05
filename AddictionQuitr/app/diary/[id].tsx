// Diary editor screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { saveDiaryEntry, getDiaryEntry } from '../../services/database';
import { analyzeDiary, type DiaryAnalysis } from '../../utils/diaryAnalyzer';
import { useUserStore } from '../../stores/userStore';

export default function DiaryEditorScreen() {
  const router = useRouter();
  const { id: date } = useLocalSearchParams<{ id: string }>();
  const apiKey = useUserStore((s) => s.apiKey);

  const [content, setContent] = useState('');
  const [analysis, setAnalysis] = useState<DiaryAnalysis | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (date) {
      getDiaryEntry(date).then((entry) => {
        if (entry) {
          setContent(entry.content);
          if (entry.analysis_json) {
            try {
              setAnalysis(JSON.parse(entry.analysis_json));
            } catch {}
          }
        }
      });
    }
  }, [date]);

  const handleSave = async () => {
    if (isSaving) return;
    if (!content.trim()) {
      Alert.alert('提示', '请先写些内容');
      return;
    }

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const entryId = `diary_${date}`;
      await saveDiaryEntry({
        id: entryId,
        date: date || new Date().toISOString().split('T')[0],
        content: content.trim(),
        analysis_json: analysis ? JSON.stringify(analysis) : undefined,
      });
      setSaveStatus('saved');
      // Reset after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (e) {
      setSaveStatus('error');
      Alert.alert('保存失败', '请稍后重试');
      // Reset after 2 seconds
      setTimeout(() => setSaveStatus('idle'), 2000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) {
      Alert.alert('提示', '请先写些内容再分析');
      return;
    }
    if (!apiKey) {
      Alert.alert('提示', '请先在设置中配置 DeepSeek API Key');
      return;
    }

    setIsAnalyzing(true);
    const result = await analyzeDiary(content, apiKey);
    if (result) {
      setAnalysis(result);
      // Auto-save with analysis
      const entryId = `diary_${date}`;
      await saveDiaryEntry({
        id: entryId,
        date: date || new Date().toISOString().split('T')[0],
        content: content.trim(),
        analysis_json: JSON.stringify(result),
      });
    } else {
      Alert.alert('分析失败', '请检查网络和 API Key');
    }
    setIsAnalyzing(false);
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.dateLabel}>{date}</Text>

      <TextInput
        style={styles.editor}
        value={content}
        onChangeText={setContent}
        placeholder="今天发生了什么？心情如何？有没有遇到诱惑？做了哪些善事？..."
        placeholderTextColor="#666680"
        multiline
        textAlignVertical="top"
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.saveButton,
            saveStatus === 'saved' && styles.saveButtonSaved,
            saveStatus === 'error' && styles.saveButtonError,
            isSaving && styles.saveButtonDisabled,
          ]}
          onPress={handleSave}
          disabled={isSaving}
          activeOpacity={0.7}
        >
          {isSaving ? (
            <View style={styles.buttonContent}>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={[styles.saveText, { marginLeft: 8 }]}>保存中...</Text>
            </View>
          ) : saveStatus === 'saved' ? (
            <Text style={styles.saveTextSaved}>已保存 ✓</Text>
          ) : saveStatus === 'error' ? (
            <Text style={styles.saveTextError}>保存失败</Text>
          ) : (
            <Text style={styles.saveText}>保存</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="#6C5CE7" />
          ) : (
            <Text style={styles.analyzeText}>AI 分析</Text>
          )}
        </TouchableOpacity>
      </View>

      {analysis && (
        <View style={styles.analysisSection}>
          <Text style={styles.analysisTitle}>AI 分析结果</Text>

          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>心情评分</Text>
            <Text style={styles.analysisValue}>{analysis.mood_score}/10</Text>
          </View>

          <View style={styles.analysisRow}>
            <Text style={styles.analysisLabel}>性冲动次数</Text>
            <Text style={[styles.analysisValue, { color: '#FF6B6B' }]}>{analysis.urge_count}</Text>
          </View>

          {analysis.urge_triggers.length > 0 && (
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisLabel}>诱因分析</Text>
              {analysis.urge_triggers.map((t, i) => (
                <Text key={i} style={styles.analysisItem}>• {t}</Text>
              ))}
            </View>
          )}

          {analysis.good_deeds.length > 0 && (
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisLabel}>善行记录</Text>
              {analysis.good_deeds.map((d, i) => (
                <Text key={i} style={[styles.analysisItem, { color: '#4ECDC4' }]}>• {d}</Text>
              ))}
            </View>
          )}

          {analysis.key_insights && (
            <View style={styles.analysisBlock}>
              <Text style={styles.analysisLabel}>关键洞察</Text>
              <Text style={styles.insightText}>{analysis.key_insights}</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
    padding: 16,
  },
  dateLabel: {
    color: '#A29BFE',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  editor: {
    backgroundColor: '#1E1E36',
    borderRadius: 14,
    padding: 16,
    color: '#E8E8F0',
    fontSize: 16,
    lineHeight: 24,
    minHeight: 200,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#6C5CE7',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonSaved: {
    backgroundColor: '#4CAF50',
  },
  saveButtonError: {
    backgroundColor: '#FF6B6B',
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  saveText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  saveTextSaved: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveTextError: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: '#1E1E36',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#6C5CE7',
  },
  analyzeText: {
    color: '#6C5CE7',
    fontSize: 16,
    fontWeight: '600',
  },
  analysisSection: {
    marginTop: 24,
    backgroundColor: '#1E1E36',
    borderRadius: 14,
    padding: 16,
    marginBottom: 40,
  },
  analysisTitle: {
    color: '#E8E8F0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D44',
  },
  analysisLabel: {
    color: '#9999B0',
    fontSize: 14,
  },
  analysisValue: {
    color: '#FFD93D',
    fontSize: 16,
    fontWeight: '700',
  },
  analysisBlock: {
    marginTop: 12,
  },
  analysisItem: {
    color: '#C8C8D8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 4,
  },
  insightText: {
    color: '#C8C8D8',
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
    fontStyle: 'italic',
  },
});
