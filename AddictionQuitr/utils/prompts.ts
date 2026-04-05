// System prompts and tool definitions for DeepSeek function calling

export const SYSTEM_PROMPT = `你是"戒色助手"，一位融合戒色十规、七步法的智能自律教练。你温暖、有同理心、不评判，用简洁有力的中文回复。

你可以使用以下工具帮助用户：
1. schedule_event - 创建日程提醒
2. start_pomodoro - 启动番茄钟专注
3. stop_pomodoro - 停止番茄钟
4. start_mantra - 念断念口诀（念起即断、念起不随、念起即觉、觉之即无）
5. write_diary - 写日记记录感悟
6. get_stats - 查看统计数据和七步法进度
7. content_alert - 内容警告干预
8. search_knowledge - 搜索戒色知识库
9. track_checklist - 记录七步法每日修行（早睡、健身、读书、行善、反省、养生）
10. track_emotion - 记录情绪状态、独处风险、视线诱惑
11. manage_goals - 设定人生目标、记录德行修炼
12. sleep_schedule - 设定和追踪早睡早起计划

[工具调用策略]
根据用户状态智能建议：
- 用户表达性冲动或欲望时 → 立即调用 start_mantra + track_emotion(type: urge)
- 用户表达独处、无聊、深夜 → 触发 track_emotion(type: solitude_checkin)
- 用户分享做了好事 → 调用 track_checklist(category: good_deed)
- 用户提到锻炼/运动 → 调用 track_checklist(category: exercise)
- 用户提到读书/学习 → 调用 track_checklist(category: reading)
- 用户想睡觉/提到睡眠 → 调用 sleep_schedule
- 用户设定目标/谈论人生规划 → 调用 manage_goals(type: set_goal)
- 用户展示美德/帮助他人 → 调用 manage_goals(type: log_virtue)
- 用户提出知识性问题 → 调用 search_knowledge

[基于戒色天数的策略]
- 0-30天(新手期): 重点使用断念口诀(mantra) + 远离黄源(content_alert) + 情绪管理(track_emotion)
- 30-90天(进阶期): 加入七步法全面修行(track_checklist) + 健身养生 + 早睡计划(sleep_schedule)
- 90天+(稳定期): 侧重德行修炼(manage_goals log_virtue) + 人生目标(manage_goals set_goal) + 圣贤学习

[回复规则]
- 用中文回复，简洁有力
- 当用户完成里程碑时，给予真诚的鼓励
- 每天第一次对话时，温和地询问今天的状态
- 不评判，保持理解和同理心`;

export interface UserDailyContext {
  streak: number;
  currentHour: number;
  checklistCompleted: string[];
  checklistTotal: number;
  lastEmotion: { emotion: string; intensity: number } | null;
  weeklyUrgeCount: number;
  sleepLogged: boolean;
  activeGoalsCount: number;
  virtueLogsToday: number;
}

export function buildDynamicSystemPrompt(context?: UserDailyContext): string {
  let contextBlock = '';
  if (context) {
    const timeLabel = context.currentHour >= 22 ? '(晚间高危时段)' : 
                      context.currentHour >= 18 ? '(傍晚)' :
                      context.currentHour < 6 ? '(深夜高危时段)' : '';
    const completedStr = context.checklistCompleted.length > 0 
      ? context.checklistCompleted.join(', ') : '无';
    const emotionStr = context.lastEmotion 
      ? `${context.lastEmotion.emotion}(强度${context.lastEmotion.intensity}/10)` : '未记录';
    
    contextBlock = `\n\n[当前用户状态]
- 戒色天数: ${context.streak}天
- 当前时间: ${context.currentHour}:00 ${timeLabel}
- 今日七步法进度: ${context.checklistCompleted.length}/${context.checklistTotal} 已完成 (${completedStr})
- 最近情绪: ${emotionStr}
- 本周冲动次数: ${context.weeklyUrgeCount}次
- 今日睡眠记录: ${context.sleepLogged ? '已记录' : '未记录'}
- 活跃目标数: ${context.activeGoalsCount}个
- 今日德行记录: ${context.virtueLogsToday}条`;
  }
  return SYSTEM_PROMPT + contextBlock;
}

export const TOOL_DEFINITIONS = [
  {
    type: 'function' as const,
    function: {
      name: 'schedule_event',
      description: '在用户的日历中创建一个新的日程事件，帮助用户安排自律活动',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: '事件标题，例如"晨跑"、"冥想"、"读书"',
          },
          date: {
            type: 'string',
            description: '事件日期，格式 YYYY-MM-DD',
          },
          time: {
            type: 'string',
            description: '事件时间，格式 HH:mm',
          },
          duration_minutes: {
            type: 'number',
            description: '事件持续时间（分钟），默认30',
          },
          reminder_minutes: {
            type: 'number',
            description: '提前提醒时间（分钟），默认10',
          },
        },
        required: ['title', 'date', 'time'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'start_pomodoro',
      description: '启动番茄钟，帮助用户进入专注的自律状态',
      parameters: {
        type: 'object',
        properties: {
          duration_minutes: {
            type: 'number',
            description: '专注时间（分钟），默认25',
          },
          label: {
            type: 'string',
            description: '专注任务标签，例如"学习"、"锻炼"、"冥想"',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'stop_pomodoro',
      description: '停止当前正在运行的番茄钟',
      parameters: {
        type: 'object',
        properties: {},
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'start_mantra',
      description: '启动念口诀工具，全屏显示戒色口诀，帮助用户平静内心、抵抗诱惑',
      parameters: {
        type: 'object',
        properties: {
          target_count: {
            type: 'number',
            description: '目标念诵轮数，默认10轮',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'write_diary',
      description: '打开日记工具，帮助用户记录今天的感悟、行为和心理状态',
      parameters: {
        type: 'object',
        properties: {
          date: {
            type: 'string',
            description: '日记日期，格式 YYYY-MM-DD，默认今天',
          },
          prompt: {
            type: 'string',
            description: '给用户的写作引导语',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'get_stats',
      description: '获取用户的自律统计数据，包括连续天数、口诀次数、专注时间等',
      parameters: {
        type: 'object',
        properties: {
          period: {
            type: 'string',
            enum: ['today', 'week', 'month', 'all'],
            description: '统计时间范围',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'content_alert',
      description: '触发内容警告干预，当检测到用户可能在浏览不良内容时使用',
      parameters: {
        type: 'object',
        properties: {
          level: {
            type: 'string',
            enum: ['gentle', 'moderate', 'urgent'],
            description: '警告级别：gentle温和提醒，moderate中等干预，urgent紧急干预',
          },
          message: {
            type: 'string',
            description: '干预消息',
          },
        },
        required: ['level'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'search_knowledge',
      description: '搜索知识库，从戒色书籍（戒为良药、走向光明等）、心理学著作（荣格、弗洛伊德）、中华经典（了凡四训、道德经等）、斯多葛哲学等资料中检索相关内容来回答用户问题',
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: '搜索查询关键词，例如"戒色方法"、"如何克服心瘾"、"了凡四训改命"',
          },
        },
        required: ['query'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'track_checklist',
      description: '记录七步法/戒色十规的每日修行完成情况，或查看今日进度',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            enum: ['early_sleep', 'exercise', 'reading', 'good_deed', 'reflection', 'health_practice'],
            description: '修行类别: early_sleep=早睡早起, exercise=健身运动, reading=读书学习, good_deed=日行一善, reflection=每日反省, health_practice=养生功法(八段锦/站桩/静坐)',
          },
          action: {
            type: 'string',
            enum: ['log', 'check_progress'],
            description: 'log=记录完成, check_progress=查看今日进度',
          },
          details: {
            type: 'string',
            description: '具体细节，如运动类型和时长、读了什么书、做了什么好事等',
          },
          notes: {
            type: 'string',
            description: '附加备注或心得',
          },
        },
        required: ['action'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'track_emotion',
      description: '记录情绪状态、独处风险检查、视线诱惑应对，部署应对策略',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['emotion_log', 'solitude_checkin', 'visual_trigger'],
            description: 'emotion_log=情绪记录, solitude_checkin=独处守护检查, visual_trigger=视线诱惑应对',
          },
          emotion: {
            type: 'string',
            enum: ['peace', 'anxiety', 'boredom', 'frustration', 'urge', 'excitement', 'sadness', 'gratitude'],
            description: '当前情绪: peace=平静, anxiety=焦虑, boredom=无聊, frustration=挫败, urge=冲动, excitement=兴奋, sadness=悲伤, gratitude=感恩',
          },
          intensity: {
            type: 'number',
            description: '情绪强度 1-10',
          },
          context: {
            type: 'string',
            description: '触发情境描述（什么引发了这个情绪？在哪里？）',
          },
          need_intervention: {
            type: 'boolean',
            description: '是否需要干预措施',
          },
        },
        required: ['type', 'emotion', 'intensity'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'manage_goals',
      description: '设定人生目标、查看目标、记录德行修炼、规划学习路径',
      parameters: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['set_goal', 'review_goals', 'log_virtue', 'learning_plan'],
            description: 'set_goal=设定目标, review_goals=查看目标, log_virtue=记录德行, learning_plan=学习规划',
          },
          goal_text: {
            type: 'string',
            description: '目标描述（设定目标时使用）',
          },
          category: {
            type: 'string',
            enum: ['career', 'academics', 'relationships', 'spirituality', 'health'],
            description: '目标类别',
          },
          timeframe: {
            type: 'string',
            enum: ['short_1yr', 'medium_3yr', 'long_10yr'],
            description: '目标时间范围',
          },
          virtue_type: {
            type: 'string',
            description: '德行类型: 孝/悌/忠/信/礼/义/廉/耻/感恩/谦卑/恭敬/惭愧/忏悔',
          },
          situation: {
            type: 'string',
            description: '修行情境描述（记录德行时使用）',
          },
          action_taken: {
            type: 'string',
            description: '采取的行动（记录德行时使用）',
          },
          notes: {
            type: 'string',
            description: '附加备注',
          },
        },
        required: ['type'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'sleep_schedule',
      description: '设定早睡早起计划、记录实际睡眠、查看睡眠报告',
      parameters: {
        type: 'object',
        properties: {
          action: {
            type: 'string',
            enum: ['set_schedule', 'log_actual', 'get_report'],
            description: 'set_schedule=设定计划, log_actual=记录实际, get_report=查看报告',
          },
          target_bedtime: {
            type: 'string',
            description: '目标就寝时间 HH:mm格式，如 22:00',
          },
          target_wake_time: {
            type: 'string',
            description: '目标起床时间 HH:mm格式，如 06:00',
          },
          actual_bedtime: {
            type: 'string',
            description: '实际就寝时间',
          },
          actual_wake_time: {
            type: 'string',
            description: '实际起床时间',
          },
          sleep_quality: {
            type: 'string',
            enum: ['good', 'fair', 'poor'],
            description: '睡眠质量',
          },
          barriers: {
            type: 'string',
            description: '影响睡眠的障碍（手机？焦虑？游戏？）',
          },
        },
        required: ['action'],
      },
    },
  },
];

export type ToolName =
  | 'schedule_event'
  | 'start_pomodoro'
  | 'stop_pomodoro'
  | 'start_mantra'
  | 'write_diary'
  | 'get_stats'
  | 'content_alert'
  | 'search_knowledge'
  | 'track_checklist'
  | 'track_emotion'
  | 'manage_goals'
  | 'sleep_schedule';

export const DIARY_ANALYSIS_PROMPT = `分析以下日记内容，提取结构化数据。以JSON格式返回，不要包含其他文字：

{
  "good_deeds": ["具体的善行列表"],
  "urge_count": 性冲动次数（数字），
  "urge_triggers": ["诱因列表"],
  "mantra_mentioned": 是否提到念口诀（布尔值），
  "browsing_behavior": "上网行为总结",
  "mood_score": 情绪评分1-10,
  "key_insights": "关键洞察总结"
}

日记内容：
`;
