# 📚 Knowledge Base

The knowledge base is a curated collection of 50+ resources across 7 categories, designed to be uploaded to 百炼 (Bailian) for RAG-powered retrieval.

---

## Directory Structure

```
knowledge_base/
├── chinese_books/        # 戒色书籍
├── chinese_classics/     # 中华文化经典
├── english_books/        # English recovery books
├── foreign_classics/     # 外国名著
├── psychology/           # 心理学 & 哲学
├── papers/               # 学术论文
├── posts/                # 戒色论坛精品帖
│   └── 戒为良药_GitHub/  # 77 chapters in Markdown
└── 资源清单_Knowledge_Base_Index.md
```

---

## 一、中文戒色书籍 (`chinese_books/`)

| File | Description |
|---|---|
| 走向光明_2019.pdf | 戒色七部曲实践指南 (2019版) |
| 走向光明_2020.pdf | 戒色七部曲实践指南 (2020版) |
| 走向光明_2022.pdf | 戒色七部曲实践指南 (2022版) |
| 戒色文集_走向光明.pdf | 综合戒色文集 |
| 以戒为师_Abstinence_Guide.pdf | 以戒为师指南 |
| 菩萨以戒为师_Bodhisattva.pdf | 佛学视角的戒色指导 |

---

## 二、中华文化经典 (`chinese_classics/`)

| File | Description |
|---|---|
| 了凡四训_原文.pdf | 袁了凡原著 — 命运改造指南 |
| 了凡四训_语译.pdf | 白话文翻译版 |
| 曾国藩_挺经.pdf | 曾国藩自律哲学 |
| 冰鉴_智慧.pdf | 曾国藩识人术 |
| 曾国藩家书_第六版.pdf | 经典家训（第六版） |
| 曾国藩家书_现代版.pdf | 现代白话版 |
| 传习录_译文.pdf | 王阳明心学 |

---

## 三、英文书籍 (`english_books/`)

| File | Description |
|---|---|
| Your_Brain_on_Porn_Gary_Wilson.pdf | Gary Wilson — 色情成瘾的神经科学 |
| Your_Brain_on_Porn_v2.pdf | 第二版 |
| EasyPeasy_Method.pdf | Easy Peasy 戒色法 |
| Sex_Addiction_Recovery_Kit.pdf | 性瘾恢复工具包 |
| Porn_Stats.pdf | 色情行业数据统计 |
| Porn_and_Your_Husband.pdf | 色情对婚姻关系的影响 |

---

## 四、外国名著 (`foreign_classics/`)

| File | Description |
|---|---|
| Naval_Ravikant_Almanack.pdf | 纳瓦尔宝典（英文原版） |
| Zero_to_One_Peter_Thiel.pdf | 从0到1（英文原版） |
| Poor_Charlies_Almanack_EN.pdf | 穷查理宝典（英文版） |
| 穷查理宝典_中文版.pdf | 穷查理宝典（中文版） |

---

## 五、心理学 & 哲学 (`psychology/`)

| File | Description |
|---|---|
| Jung_Aion_Collected_Works_Vol9.pdf | 荣格 — Aion: 自我研究 |
| Jung_Psychological_Types_Vol6.pdf | 荣格 — 心理类型学 |
| Jung_Psychology_and_Alchemy_Vol12.pdf | 荣格 — 心理学与炼金术 |
| 荣格_人物介绍.pdf | 荣格生平介绍 |

---

## 六、学术论文 (`papers/`)

| File | Topic |
|---|---|
| Pornography_Addiction_Neuroscience_Survey.pdf | 色情成瘾神经科学综述 |
| Neuroscience_of_Internet_Pornography_Addiction.pdf | 网络色情的脑科学研究 |
| Pornography_Consumption_Depression_Meta.pdf | 色情与抑郁的荟萃分析 |
| Porn_Use_Sexual_Dysfunction_Narrative.pdf | 色情使用与性功能障碍 |
| Problematic_Pornography_Use_Review.pdf | 问题性色情使用综述 |
| Online_Porn_Addiction_Review_2019.pdf | 2019年色情成瘾综述 |
| Cambridge_Brain_Study_2014.pdf | 剑桥大学脑研究2014 |
| Self_Perceived_Effects_of_Porn_2017.pdf | 色情自我感知效果2017 |
| Pornography_Sexual_Satisfaction.pdf | 色情与性满意度 |
| DSM5_Hypersexual_Disorder.pdf | DSM-5性欲过度障碍 |

---

## 七、戒为良药 77篇 (`posts/戒为良药_GitHub/`)

Complete 77-chapter Markdown series from the famous 戒色论坛 post "戒为良药" (Quit as Good Medicine):
- `000.md` through `076.md`
- Topics: 戒色方法论, 心理分析, 案例分享, 中医养生, 行善积德

---

## How to Use with 百炼 RAG

1. Upload all files to [百炼控制台](https://bailian.console.aliyun.com/) → 知识管理 → 新建知识库
2. 百炼 will automatically parse PDFs and MDs, chunk the text, and build vector embeddings
3. Create an Application (应用) linked to the knowledge base
4. Copy the App ID into the app's Settings screen
5. The agent will now search this knowledge base when answering knowledge questions

See [[RAG-Integration]] for the technical implementation details.
