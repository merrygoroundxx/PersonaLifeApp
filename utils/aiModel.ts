import { PersonaStats } from "./types";

// 【注意】这是一个模拟的深度学习模型接口。
// 在生产环境中，你应该在这里调用 OpenAI/Gemini 的 API，或者加载 TensorFlow.js/ONNX 模型。
// 提示词示例: "Analyze this text and assign points (0-3) to [Knowledge, Guts, Proficiency, Kindness, Charm]..."

export const analyzeActivityWithAI = async (
  activity: string,
  feeling: string,
): Promise<PersonaStats> => {
  // 模拟网络延迟
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // 简单的关键词启发式算法作为 "本地兜底模型"
  // 如果你接入真实AI，请删除以下逻辑，替换为 fetch() 调用
  const text = (activity + feeling).toLowerCase();

  const stats: PersonaStats = {
    knowledge: 0,
    guts: 0,
    proficiency: 0,
    kindness: 0,
    charm: 0,
  };

  // 简单的伪随机逻辑，模拟AI判断
  // 真实场景下，这里是通过训练好的模型输出向量
  if (text.match(/book|study|read|class|learn|学习|看书|上课/))
    stats.knowledge += 2;
  if (text.match(/scary|horror|challenge|speech|恐怖|演讲|挑战/))
    stats.guts += 2;
  if (text.match(/craft|fix|code|build|draw|制作|修|代码|画/))
    stats.proficiency += 2;
  if (text.match(/plant|help|listen|cat|flower|帮|听|花|猫/))
    stats.kindness += 2;
  if (text.match(/bath|coffee|date|talk|party|澡|咖啡|约会/)) stats.charm += 2;

  // 如果什么都没匹配到，给予随机属性 (Persona风格的随机性)
  if (Object.values(stats).every((v) => v === 0)) {
    const keys = Object.keys(stats) as (keyof PersonaStats)[];
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    stats[randomKey] += 1;
  }

  return stats;
};
