// Diary route - diary analysis endpoint

import { Router } from 'express';

const router = Router();

const DEEPSEEK_API_URL = 'https://api.deepseek.com/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'YOUR_DEEPSEEK_API_KEY';

const ANALYSIS_PROMPT = `分析以下日记内容，提取结构化数据。以JSON格式返回，不要包含其他文字：

{
  "good_deeds": ["具体的善行列表"],
  "urge_count": 性冲动次数,
  "urge_triggers": ["诱因列表"],
  "mantra_mentioned": 是否提到念口诀,
  "browsing_behavior": "上网行为总结",
  "mood_score": 情绪评分1-10,
  "key_insights": "关键洞察总结"
}

日记内容：
`;

// Analyze diary content
router.post('/analyze', async (req: any, res: any) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: ANALYSIS_PROMPT + content }],
        temperature: 0.3,
        max_tokens: 512,
      }),
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Analysis failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: 'Failed to parse analysis' });
    }

    const analysis = JSON.parse(jsonMatch[0]);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
