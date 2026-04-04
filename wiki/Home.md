# 🛡️ AddictionQuitr — AI-Native 戒色助手

> **An AI-powered self-discipline coach** that helps users quit unhealthy habits through empathetic conversations, structured tools, and a curated knowledge base.

---

## 🎯 What is AddictionQuitr?

AddictionQuitr (戒色助手) is a mobile app built for the **AI-Native Application Hackathon**. It combines a warm, non-judgmental AI coach with practical productivity tools and a rich knowledge base to support users on their self-discipline journey.

The agent doesn't just chat — it **takes action**: scheduling events, starting focus timers, guiding mantras, writing diary entries, and searching a professional knowledge base — all through natural conversation.

---

## ✨ Key Highlights

| Feature | Description |
|---|---|
| 🤖 **AI Agent with Tool Calling** | LLM-powered coach that can invoke 7 tools through natural conversation |
| 📚 **RAG Knowledge Base** | 百炼 (Bailian) powered retrieval from 50+ books, papers, and classics |
| 🍅 **Pomodoro Timer** | Focus mode with haptic feedback and notifications |
| 🙏 **Mantra Recitation** | Full-screen guided mantra tool for calming urges |
| 📝 **AI Diary Analysis** | Write daily journals, get AI-powered mood & behavior analysis |
| 📅 **Calendar Integration** | Agent schedules self-discipline events directly to your calendar |
| 📊 **Progress Tracking** | Streak counter, daily stats, and milestone celebrations |
| 🚨 **Content Intervention** | Proactive alerts when risky behavior is detected |
| 🔄 **Multi-LLM Support** | Qwen, DeepSeek, OpenAI, or any OpenAI-compatible provider |

---

## 🛠️ Tech Stack

- **Framework**: React Native + Expo (managed workflow)
- **Routing**: expo-router (file-based)
- **State Management**: Zustand
- **Database**: expo-sqlite (local)
- **LLM Integration**: OpenAI-compatible API (Qwen default, multi-provider)
- **RAG**: Alibaba Cloud 百炼 (Bailian) Application API
- **Language**: TypeScript
- **Platform**: iOS & Android via Expo Go

---

## 📖 Wiki Pages

- [[Architecture]] — System design, file structure, data flow
- [[Features]] — Detailed feature descriptions with screenshots
- [[Setup-Guide]] — How to install, configure, and run
- [[Knowledge-Base]] — Curated resource library overview
- [[RAG-Integration]] — How the 百炼 RAG knowledge base works

---

## 🚀 Quick Start

```bash
cd AddictionQuitr
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone. See [[Setup-Guide]] for full details.
