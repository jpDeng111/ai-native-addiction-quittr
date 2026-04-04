# 🏗️ Architecture

## System Overview

AddictionQuitr follows a **client-side agent architecture** where the LLM acts as the brain, and the app provides tools the agent can invoke through function calling.

```
┌─────────────────────────────────────────────────┐
│                   User (Mobile)                  │
│                                                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Chat UI  │  │ Pomodoro │  │  Mantra Tool │  │
│  │ (Agent)   │  │  Timer   │  │  (Full-screen)│  │
│  └─────┬─────┘  └──────────┘  └──────────────┘  │
│        │                                         │
│  ┌─────▼──────────────────────────────────────┐  │
│  │           Zustand State Stores              │  │
│  │  chatStore · userStore · timerStore         │  │
│  └─────┬──────────────────────────────────────┘  │
│        │                                         │
│  ┌─────▼──────────────────────────────────────┐  │
│  │            Service Layer                    │  │
│  │  ai.ts · database.ts · calendar.ts          │  │
│  └─────┬──────────────────────────────────────┘  │
└────────┼─────────────────────────────────────────┘
         │
    ┌────▼────┐     ┌───────────────┐
    │ LLM API │     │  百炼 Bailian  │
    │ (Qwen/  │     │  RAG API      │
    │ DeepSeek│     │  (Knowledge   │
    │ /OpenAI)│     │   Base)       │
    └─────────┘     └───────────────┘
```

---

## File Structure

```
AddictionQuitr/
├── app/                          # Expo Router pages
│   ├── _layout.tsx               # Root layout (dark theme, tab navigator)
│   ├── (tabs)/
│   │   ├── _layout.tsx           # Tab bar configuration
│   │   ├── index.tsx             # 💬 Main Chat Screen (Agent)
│   │   ├── stats.tsx             # 📊 Statistics Dashboard
│   │   └── settings.tsx          # ⚙️ Settings (API key, provider, Bailian)
│   ├── diary/
│   │   ├── index.tsx             # 📝 Diary List
│   │   └── [id].tsx              # 📝 Diary Editor + AI Analysis
│   ├── mantra.tsx                # 🙏 Mantra Recitation (full-screen)
│   └── pomodoro.tsx              # 🍅 Pomodoro Timer (full-screen)
│
├── services/                     # Business logic & API calls
│   ├── ai.ts                     # Multi-provider LLM + Bailian RAG API
│   ├── database.ts               # SQLite (diary, stats, chat persistence)
│   ├── calendar.ts               # Native calendar integration
│   ├── subscription.ts           # Paywall logic
│   └── sync.ts                   # Cloud sync (future)
│
├── stores/                       # Zustand state management
│   ├── chatStore.ts              # Chat messages + tool call handling
│   ├── userStore.ts              # User prefs, streak, API config
│   └── timerStore.ts             # Pomodoro timer state
│
├── components/                   # Reusable UI components
│   ├── chat/
│   │   ├── ChatBubble.tsx        # Message bubble (user/assistant/tool)
│   │   ├── ChatInput.tsx         # Text input + send button
│   │   └── ToolResultCard.tsx    # Inline tool result cards
│   ├── common/
│   │   ├── InterventionModal.tsx # Content warning overlay
│   │   └── PaywallModal.tsx      # Subscription paywall
│   ├── mantra/                   # Mantra-specific components
│   ├── pomodoro/                 # Timer-specific components
│   └── stats/                    # Stats chart components
│
├── utils/
│   ├── prompts.ts                # System prompt + tool definitions (7 tools)
│   └── diaryAnalyzer.ts          # AI diary analysis logic
│
├── knowledge_base/               # Curated RAG resource library
│   ├── chinese_books/            # 戒色书籍 (戒为良药, 走向光明, etc.)
│   ├── chinese_classics/         # 中华经典 (了凡四训, 道德经, etc.)
│   ├── english_books/            # English recovery books
│   ├── foreign_classics/         # 外国名著 (穷查理宝典, 纳瓦尔, etc.)
│   ├── psychology/               # 心理学 (Jung, Freud, Stoic)
│   ├── papers/                   # Academic papers
│   └── posts/                    # 戒为良药 GitHub chapters (77 MDs)
│
├── assets/                       # Icons, splash screen
├── app.json                      # Expo configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript config
```

---

## Agent Tool Calling Flow

The core innovation is **LLM function calling** — the agent decides which tools to use based on the conversation:

```
User: "帮我设置明天早上7点跑步"
         │
         ▼
   ┌──────────┐
   │ sendChat  │  (chatStore.addUserMessage)
   │ Message   │
   └────┬──────┘
        │
        ▼
   ┌──────────┐
   │  LLM API  │  → Response: tool_call "schedule_event"
   │  (Qwen)   │     args: {title:"跑步", date:"2025-04-05", time:"07:00"}
   └────┬──────┘
        │
        ▼
   ┌──────────────┐
   │ executeToolCall│  (ChatScreen switch/case)
   │ → calendar.ts │  → Creates native calendar event
   └────┬──────────┘
        │
        ▼
   ┌──────────────┐
   │ handleToolResult│  → Sends result back to LLM
   └────┬──────────┘
        │
        ▼
   ┌──────────┐
   │  LLM API  │  → "已为你设置明天早上7点的跑步日程！💪"
   └──────────┘
```

### Available Tools (7)

| Tool | Trigger | Action |
|---|---|---|
| `schedule_event` | User wants to plan activities | Creates native calendar event |
| `start_pomodoro` | User needs focus time | Navigates to Pomodoro timer |
| `stop_pomodoro` | User wants to stop timer | Stops running timer |
| `start_mantra` | User faces urges | Opens full-screen mantra tool |
| `write_diary` | User wants to reflect | Opens diary editor |
| `get_stats` | User asks about progress | Returns today's stats |
| `content_alert` | Risky content detected | Shows intervention modal |
| `search_knowledge` | Knowledge questions | Queries 百炼 RAG knowledge base |

---

## Data Layer

### Local Database (SQLite)

| Table | Purpose |
|---|---|
| `diary_entries` | Daily journal entries + AI analysis JSON |
| `daily_stats` | Mantra count, focus minutes, mood per day |
| `chat_messages` | Persisted conversation history |

### State Management (Zustand)

| Store | Key State |
|---|---|
| `chatStore` | messages, apiMessages, pendingToolCalls, isLoading |
| `userStore` | streak, apiKey, provider, model, bailianAppId |
| `timerStore` | isRunning, timeLeft, label |

---

## Multi-Provider LLM Architecture

```
         ┌─────────────┐
         │  userStore   │  provider: 'qwen' | 'deepseek' | 'openai' | 'custom'
         │  model       │  model: 'qwen-plus' | 'deepseek-chat' | ...
         │  apiKey      │
         └──────┬───────┘
                │
                ▼
         ┌─────────────┐
         │   ai.ts      │  getBaseUrl() → routes to correct provider
         │              │  sendChatMessage() → OpenAI-compatible format
         └──────┬───────┘
                │
     ┌──────────┼──────────┐
     ▼          ▼          ▼
  DashScope   DeepSeek   OpenAI
  (Qwen)      API        API
```

All providers use the same **OpenAI-compatible chat completions** format, making switching seamless.
