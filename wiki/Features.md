# ✨ Features

## 1. 🤖 AI Agent Chat (Core)

The main screen is a conversational AI coach that understands context and takes action.

**How it works:**
- You chat naturally in Chinese (or English)
- The agent uses **LLM function calling** to decide when to invoke tools
- Tool results are fed back to the LLM for a contextual follow-up response

**Example conversations:**
| You say | Agent does |
|---|---|
| "我今天感觉很有冲动" | Suggests mantra tool or pomodoro, offers encouragement |
| "帮我安排明天7点晨跑" | Calls `schedule_event` → creates calendar event |
| "开始25分钟专注" | Calls `start_pomodoro` → navigates to timer screen |
| "我想念口诀" | Calls `start_mantra` → opens full-screen mantra |
| "戒为良药讲了什么方法？" | Calls `search_knowledge` → queries RAG knowledge base |
| "今天我做了什么？" | Calls `get_stats` → shows daily statistics |

**Agent personality:**
- Warm but firm, like a trusted friend
- Non-judgmental — understands the difficulty of quitting
- Uses positive language and encouragement
- Provides immediate psychological support during urges

---

## 2. 🍅 Pomodoro Timer

A distraction-free focus timer with:
- Customizable duration (default 25 min)
- Custom task labels (e.g., "学习", "锻炼", "冥想")
- Haptic feedback on completion
- Push notification when time is up
- Progress recorded to daily stats

The agent can start/stop the timer through conversation.

---

## 3. 🙏 Mantra Recitation

Full-screen guided mantra tool designed for moments of temptation:
- Large, centered text display
- Tap-to-advance interaction
- Configurable target rounds (default 10)
- Calming dark theme
- Count recorded to daily stats

When the user expresses urges, the agent immediately suggests this tool.

---

## 4. 📝 AI-Powered Diary

Daily journaling with intelligent analysis:

**Writing:**
- One diary entry per day (keyed by date)
- Rich text input with writing prompts from the agent
- Auto-save to SQLite

**AI Analysis** (triggered by "AI 分析" button):
- Extracts structured data from free-form text:
  - `good_deeds` — positive behaviors listed
  - `urge_count` — number of urge episodes
  - `urge_triggers` — identified triggers
  - `mood_score` — 1-10 mood rating
  - `browsing_behavior` — internet usage summary
  - `key_insights` — AI-generated reflection

---

## 5. 📅 Calendar Integration

Native calendar integration via `expo-calendar`:
- Agent creates events with title, date, time, duration
- Configurable reminder (default 10 min before)
- Works with iOS Calendar and Google Calendar
- Requires calendar permission on first use

---

## 6. 📊 Statistics Dashboard

Track progress over time:
- **Streak counter** — consecutive days of self-discipline
- **Daily stats** — mantra rounds, focus minutes, mood score
- **Milestone celebrations** — agent congratulates at 7, 30, 100 days

---

## 7. 🚨 Content Intervention

Proactive safety net:
- Three warning levels: gentle, moderate, urgent
- Agent detects risky language patterns and triggers alerts
- Full-screen intervention modal with encouraging messages
- Suggests alternative activities (mantra, exercise, meditation)

---

## 8. 📚 RAG Knowledge Base Search

Powered by Alibaba Cloud 百炼 (Bailian):
- Agent can search 50+ curated books, papers, and classics
- Triggered automatically when user asks knowledge questions
- Sources include: 戒为良药, 了凡四训, 道德经, Jung, Stoic philosophy, neuroscience papers
- See [[RAG-Integration]] for technical details

---

## 9. 🔄 Multi-LLM Provider Support

Switch between AI providers without changing code:
- **通义千问 (Qwen)** — default, recommended
- **DeepSeek** — good Chinese language support
- **OpenAI** — GPT-4o-mini, GPT-4o, GPT-4-turbo
- **Custom** — any OpenAI-compatible endpoint

Configured in Settings with chip-style selectors for provider and model.

---

## 10. 💳 Subscription System (Framework)

Paywall framework ready for monetization:
- Free tier: 20 messages/day
- Trial: 7-day full access
- Pro tier: unlimited (payment integration placeholder)
- PaywallModal component with plan selection UI
