// Diary analysis utility - sends diary text to LLM for structured extraction

import { DIARY_ANALYSIS_PROMPT } from './prompts';
import { getProvider, getModel, LLM_PROVIDERS, type LLMProvider } from '../services/ai';

export interface DiaryAnalysis {
  good_deeds: string[];
  urge_count: number;
  urge_triggers: string[];
  mantra_mentioned: boolean;
  browsing_behavior: string;
  mood_score: number;
  key_insights: string;
}

export async function analyzeDiary(
  content: string,
  apiKey: string
): Promise<DiaryAnalysis | null> {
  try {
    const provider: LLMProvider = getProvider();
    const apiUrl = LLM_PROVIDERS[provider].baseUrl;
    const model = getModel();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'user',
            content: DIARY_ANALYSIS_PROMPT + content,
          },
        ],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      good_deeds: parsed.good_deeds || [],
      urge_count: parsed.urge_count || 0,
      urge_triggers: parsed.urge_triggers || [],
      mantra_mentioned: parsed.mantra_mentioned || false,
      browsing_behavior: parsed.browsing_behavior || '',
      mood_score: parsed.mood_score || 5,
      key_insights: parsed.key_insights || '',
    };
  } catch (error) {
    console.error('Diary analysis failed:', error);
    return null;
  }
}
