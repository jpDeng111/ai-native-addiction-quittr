# 📦 Setup Guide

## Prerequisites

- **Node.js** 18+ 
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- An **API Key** from one of:
  - [DashScope (Qwen)](https://dashscope.console.aliyun.com/) — recommended, free tier available
  - [DeepSeek](https://platform.deepseek.com/)
  - [OpenAI](https://platform.openai.com/)

---

## Installation

```bash
# Clone the repo
git clone https://github.com/jpDeng111/ai-native-addiction-quittr.git
cd ai-native-addiction-quittr/AddictionQuitr

# Install dependencies
npm install

# Start Expo dev server
npx expo start
```

A QR code will appear. Scan it with:
- **iOS**: Camera app → tap the Expo banner
- **Android**: Expo Go app → Scan QR Code

---

## Configuration

### 1. API Key Setup

1. Open the app → go to **Settings** tab (⚙️)
2. Select your **model provider** (默认: 通义千问 Qwen)
3. Select a **model** (默认: qwen-plus)
4. Paste your **API Key** and tap **保存 Key**

### 2. RAG Knowledge Base (Optional)

To enable the AI to search from the curated knowledge base:

1. Go to [百炼控制台](https://bailian.console.aliyun.com/)
2. Create a **知识库** (Knowledge Base) → upload the files from `knowledge_base/`
3. Create an **应用** (Application) → link it to your knowledge base
4. Copy the **App ID** → paste it in Settings → **百炼知识库 App ID**

The agent will now automatically search the knowledge base when you ask knowledge-related questions.

### Provider Configuration

| Provider | Base URL | Default Model |
|---|---|---|
| 通义千问 (Qwen) | `dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-plus` |
| DeepSeek | `api.deepseek.com` | `deepseek-chat` |
| OpenAI | `api.openai.com/v1` | `gpt-4o-mini` |
| Custom | User-defined | User-defined |

---

## Running on Different Platforms

### Physical Device (Recommended)
```bash
npx expo start
# Scan QR code with Expo Go
```

### iOS Simulator (requires Xcode)
```bash
npx expo start --ios
```

### Android Emulator (requires Android Studio)
```bash
npx expo start --android
```

### Web (limited functionality)
```bash
npx expo start --web
```

> Note: Some features (calendar, haptics, notifications) only work on physical devices.

---

## Environment Variables

No `.env` file is needed — all configuration is done through the in-app Settings screen. The API key is stored locally via Zustand state.

For production deployment, consider using a backend proxy (see `backend/routes/chat.ts`) to hide the API key.

---

## Troubleshooting

| Issue | Solution |
|---|---|
| `npm install` fails | Delete `node_modules` and `package-lock.json`, retry |
| QR code won't scan | Ensure phone and computer are on the same WiFi |
| API errors | Check your API key is correct and has credits |
| Calendar permission denied | Go to phone Settings → Apps → 戒色助手 → Permissions |
| Knowledge base not working | Verify 百炼 App ID is correct and app is published |
