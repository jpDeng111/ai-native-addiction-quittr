// AI service with multi-provider support (Qwen, DeepSeek, OpenAI compatible)

import { SYSTEM_PROMPT, TOOL_DEFINITIONS } from '../utils/prompts';

// ---- Provider Configuration ----

export type LLMProvider = 'qwen' | 'coding_plan' | 'deepseek' | 'openai' | 'custom';

export interface ProviderConfig {
  id: LLMProvider;
  name: string;
  baseUrl: string;
  defaultModel: string;
  models: string[];
}

export const LLM_PROVIDERS: Record<LLMProvider, ProviderConfig> = {
  qwen: {
    id: 'qwen',
    name: '通义千问 (Qwen)',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
    defaultModel: 'qwen3.6-plus',
    models: ['qwen3.6-plus', 'qwen3.5-plus', 'qwen-plus', 'qwen-turbo', 'qwen-max', 'qwen-long'],
  },
  coding_plan: {
    id: 'coding_plan',
    name: 'Coding Plan (多模型)',
    baseUrl: 'https://coding.dashscope.aliyuncs.com/v1/chat/completions',
    defaultModel: 'qwen3.5-plus',
    models: [
      'qwen3.5-plus',
      'qwen3-max-2026-01-23',
      'qwen3-coder-next',
      'qwen3-coder-plus',
      'glm-5',
      'glm-4.7',
      'kimi-k2.5',
      'MiniMax-M2.5',
    ],
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/chat/completions',
    defaultModel: 'deepseek-chat',
    models: ['deepseek-chat', 'deepseek-reasoner'],
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  },
  custom: {
    id: 'custom',
    name: '自定义 (OpenAI 兼容)',
    baseUrl: '',
    defaultModel: '',
    models: [],
  },
};

// ---- Runtime State ----

let _currentProvider: LLMProvider = 'qwen';
let _currentModel: string = LLM_PROVIDERS.qwen.defaultModel;
let _apiKey: string = 'sk-2f6cef85183643afbaccbd881a0e1c71';
let _customBaseUrl: string = '';
let _bailianAppId: string = '';

export function setProvider(provider: LLMProvider) {
  _currentProvider = provider;
  _currentModel = LLM_PROVIDERS[provider].defaultModel;
}

export function getProvider(): LLMProvider {
  return _currentProvider;
}

export function setModel(model: string) {
  _currentModel = model;
}

export function getModel(): string {
  return _currentModel;
}

export function setApiKey(key: string) {
  _apiKey = key;
}

export function getApiKey(): string {
  return _apiKey;
}

export function setCustomBaseUrl(url: string) {
  _customBaseUrl = url;
}

export function setBailianAppId(appId: string) {
  _bailianAppId = appId;
}

export function getBailianAppId(): string {
  return _bailianAppId;
}

function getBaseUrl(): string {
  if (_currentProvider === 'custom' && _customBaseUrl) {
    return _customBaseUrl;
  }
  return LLM_PROVIDERS[_currentProvider].baseUrl;
}

// ---- Types ----

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface AIResponse {
  content: string | null;
  tool_calls?: ToolCall[];
  finish_reason: string;
}

// ---- Core API Call ----

export async function sendChatMessage(
  messages: ChatMessage[],
  useTools: boolean = true,
  systemPrompt?: string
): Promise<AIResponse> {
  const apiUrl = getBaseUrl();
  const apiKey = _apiKey;

  if (!apiUrl || !apiKey) {
    throw new Error('请先在设置中配置 API Key');
  }

  const requestMessages: ChatMessage[] = [
    { role: 'system', content: systemPrompt || SYSTEM_PROMPT },
    ...messages,
  ];

  const body: Record<string, unknown> = {
    model: _currentModel,
    messages: requestMessages,
    temperature: 0.7,
    max_tokens: 1024,
    stream: false,
  };

  // Disable deep thinking for qwen3.x models to enable tool calling
  if (_currentModel.startsWith('qwen3')) {
    body.enable_thinking = false;
  }

  if (useTools) {
    body.tools = TOOL_DEFINITIONS;
    body.tool_choice = 'auto';
  }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`${LLM_PROVIDERS[_currentProvider].name} API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice) {
      throw new Error(`No response from ${LLM_PROVIDERS[_currentProvider].name}`);
    }

    return {
      content: choice.message.content,
      tool_calls: choice.message.tool_calls,
      finish_reason: choice.finish_reason,
    };
  } catch (error) {
    console.error('AI service error:', error);
    throw error;
  }
}

export function parseToolArguments(argsString: string): Record<string, unknown> {
  try {
    return JSON.parse(argsString);
  } catch {
    console.error('Failed to parse tool arguments:', argsString);
    return {};
  }
}

// ---- Bailian RAG Knowledge Base Search ----

export async function searchBailianKnowledge(query: string): Promise<string> {
  if (!_bailianAppId || !_apiKey) {
    throw new Error('请先在设置中配置百炼 App ID 和 API Key');
  }

  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${_bailianAppId}/completion`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${_apiKey}`,
      },
      body: JSON.stringify({
        input: {
          prompt: query,
        },
        parameters: {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`百炼 API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const text = data?.output?.text;
    if (!text) {
      return '未找到相关知识库内容。';
    }
    return text;
  } catch (error) {
    console.error('Bailian knowledge search error:', error);
    throw error;
  }
}
