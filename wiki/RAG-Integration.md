# 🔍 RAG Integration

## Overview

AddictionQuitr uses **Alibaba Cloud 百炼 (Bailian)** for Retrieval-Augmented Generation (RAG). This allows the AI agent to search a curated knowledge base of 50+ books, papers, and classics to provide evidence-based answers.

---

## Architecture

```
User asks: "了凡四训怎么改命？"
         │
         ▼
┌──────────────┐
│   LLM (Qwen)  │  Decides to call search_knowledge tool
│                │  args: {query: "了凡四训改命方法"}
└───────┬────────┘
        │
        ▼
┌──────────────┐
│  ai.ts        │  searchBailianKnowledge(query)
│               │  POST /api/v1/apps/{APP_ID}/completion
└───────┬────────┘
        │
        ▼
┌──────────────────────┐
│  百炼 Bailian Server   │
│  1. Vector search      │  → Finds relevant chunks from knowledge base
│  2. Re-ranking         │  → Ranks by relevance
│  3. LLM synthesis      │  → Generates answer with citations
└───────┬────────────────┘
        │
        ▼
┌──────────────┐
│  Tool Result   │  "了凡四训讲述了袁了凡通过'立命之学'..."
└───────┬────────┘
        │
        ▼
┌──────────────┐
│   LLM (Qwen)  │  Synthesizes final response for user
│                │  combining knowledge base content + agent personality
└──────────────┘
```

---

## Implementation Details

### 1. Tool Definition (`utils/prompts.ts`)

```typescript
{
  type: 'function',
  function: {
    name: 'search_knowledge',
    description: '搜索知识库，从戒色书籍、心理学著作、中华经典、斯多葛哲学等资料中检索相关内容',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: '搜索查询关键词，例如"戒色方法"、"如何克服心瘾"',
        },
      },
      required: ['query'],
    },
  },
}
```

### 2. System Prompt Trigger

The system prompt instructs the agent:
> "当用户提出关于戒色方法、心理学、自律等知识性问题时，主动调用搜索知识库工具来获取专业内容"

### 3. API Call (`services/ai.ts`)

```typescript
export async function searchBailianKnowledge(query: string): Promise<string> {
  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${_bailianAppId}/completion`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${_apiKey}`,  // Same DashScope API key
    },
    body: JSON.stringify({
      input: { prompt: query },
      parameters: {},
    }),
  });

  const data = await response.json();
  return data?.output?.text || '未找到相关知识库内容。';
}
```

### 4. Tool Execution (`app/(tabs)/index.tsx`)

```typescript
case 'search_knowledge': {
  const query = (args.query as string) || '';
  try {
    result = await searchBailianKnowledge(query);
  } catch (err) {
    result = `知识库搜索失败: ${err.message}`;
  }
  break;
}
```

### 5. State & Settings

- `userStore.bailianAppId` — persisted App ID
- Settings screen has a dedicated input field for the 百炼 App ID
- Uses the same DashScope API key as the Qwen provider

---

## 百炼 Setup Steps

### Step 1: Create Knowledge Base

1. Log in to [百炼控制台](https://bailian.console.aliyun.com/)
2. Go to **知识管理** → **新建知识库**
3. Upload files from `knowledge_base/` directory:
   - All `.pdf` files from each subdirectory
   - All `.md` files from `posts/戒为良药_GitHub/`
4. 百炼 will automatically:
   - Parse PDF/Markdown content
   - Split into text chunks
   - Generate vector embeddings
   - Build searchable index

### Step 2: Create Application

1. Go to **应用管理** → **新建应用**
2. Select **RAG 问答** application type
3. Link your knowledge base from Step 1
4. Configure:
   - Base model: Qwen-Plus (recommended)
   - Search top-k: 5
   - Temperature: 0.7
5. Publish the application
6. Copy the **App ID** from the application details page

### Step 3: Configure in App

1. Open the 戒色助手 app
2. Go to Settings → AI 配置
3. Paste the App ID into **百炼知识库 App ID** field
4. Tap **保存 Key** (saves both API key and App ID)

---

## Example Queries

| User Question | Knowledge Source | Agent Response |
|---|---|---|
| "戒为良药讲了哪些方法？" | posts/戒为良药_GitHub/ | Summarizes key methods from the 77-chapter series |
| "了凡四训如何改命？" | chinese_classics/了凡四训 | Explains 立命之学、改过之法、积善之方 |
| "色情成瘾的脑科学原理" | papers/ + english_books/ | Explains dopamine, prefrontal cortex, neural pathways |
| "荣格怎么看待欲望？" | psychology/Jung | References Jung's writings on shadow self and libido |
| "斯多葛主义如何帮助自律？" | psychology/Meditations | Quotes Marcus Aurelius on self-control |
| "曾国藩是怎么自律的？" | chinese_classics/挺经 | Describes 曾国藩's 12 daily rules (日课十二条) |

---

## Why 百炼 vs Local RAG?

| Aspect | 百炼 (Bailian) | Local RAG |
|---|---|---|
| PDF Parsing | Built-in, handles Chinese well | Requires pdf-parse, unreliable for CJK |
| Chunking | Automatic, smart boundaries | Manual implementation needed |
| Embeddings | Cloud-hosted, no mobile cost | Would need on-device model or API |
| Vector Search | Optimized, scalable | Limited by mobile device resources |
| Setup | Upload files + 3 clicks | Complex build script + JSON bundling |
| Maintenance | Update files in console | Rebuild and redeploy app |
| Cost | Free tier available | Free but complex |
