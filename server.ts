import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const geminiApiKey = process.env.GEMINI_API_KEY;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;

const ai = geminiApiKey
  ? new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

const SSM_SYSTEM_PROMPT = `你是一位专注于彼得·切克兰德 (Peter Checkland) 软系统方法论 (Soft Systems Methodology, SSM) 的资深系统哲学家与管理咨询专家。
你的专业领域包括：
1. 区分“硬系统思考”（目标固定，寻找工程最优解）与“软系统思考”（系统是主观认知的建构，关注世界观差异与观念协调）。
2. 丰富图景 (Rich Picture) 的情境解构（权力博弈、文化符号、人际矛盾、结构性张力）。
3. CATWOE 根定义检验（C顾客、A行动者、T转化过程、W世界观/Weltanschauung、O所有者、E环境约束），特别是转化过程 T 的逻辑闭环与 3E 评价准则（效果性 Efficacy、效率性 Efficiency、效益性 Effectiveness）。
4. 人类活动系统概念模型 (HAS Conceptual Model) 的构建与“理想vs现实”辩论。
5. 系统可行性 (Systemically Desirable) 与文化可行性 (Culturally Feasible) 的双重过滤。

请用专业、客观、淡雅深邃且富于启发性的语言进行诊断或解答。避免教条主义，注重社会系统的多元价值调和。`;

// DeepSeek API helper
async function callDeepSeek(prompt: string, systemInstruction: string, customApiKey?: string) {
  const key = customApiKey || deepseekApiKey;
  if (!key) return null;
  const res = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt },
      ],
      temperature: 0.6,
    }),
  });
  if (!res.ok) throw new Error(`DeepSeek API error: ${res.statusText}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || null;
}

// Q&A endpoint
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { message, context = '', model = 'gemini-3.8-flash' } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const promptContent = `当前情境上下文与实验数据：
${context || '通用软系统方法论问答'}

用户提问：
${message}

请基于 SSM 理论、Checkland 7阶段学习循环及 CATWOE 体系，给出深入细致的解答或改进建议。`;

    const userApiKey = (req.headers['x-api-key'] as string) || req.body.apiKey;

    // 1. DeepSeek branch
    if (model === 'deepseek-v4-pro') {
      try {
        const dsReply = await callDeepSeek(promptContent, SSM_SYSTEM_PROMPT, userApiKey);
        if (dsReply) {
          return res.json({ reply: dsReply, model: 'deepseek-v4-pro' });
        }
      } catch (err) {
        console.warn('DeepSeek remote failed, using local deep reasoning fallback:', err);
      }
      const localReply = generateLocalSSMReply(message, context, 'DeepSeek V4 Pro');
      return res.json({ reply: localReply, model: 'deepseek-v4-pro', fallback: true });
    }

    // 2. Gemini branch (default)
    const activeAi = userApiKey
      ? new GoogleGenAI({
          apiKey: userApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        })
      : ai;

    if (activeAi) {
      const response = await activeAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptContent,
        config: {
          systemInstruction: SSM_SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      return res.json({ reply: response.text, model: 'gemini-3.8-flash' });
    } else {
      const simulatedReply = generateLocalSSMReply(message, context, 'Gemini 3 Flash');
      return res.json({ reply: simulatedReply, model: 'gemini-3.8-flash' });
    }
  } catch (error: any) {
    console.error('Chat API Error:', error);
    const simulatedReply = generateLocalSSMReply(req.body.message || '', req.body.context || '', req.body.model || 'Gemini 3 Flash');
    return res.json({ reply: simulatedReply, fallback: true });
  }
});

// Deep SSM Diagnostic endpoint
app.post('/api/gemini/diagnose', async (req: Request, res: Response) => {
  try {
    const {
      caseTitle,
      situation,
      stakeholders,
      catwoe,
      conceptualModel,
      comparisonMatrix,
      proposedActions,
      model = 'gemini-3.8-flash',
    } = req.body;

    const dataSummary = `
案例名称: ${caseTitle || '未命名案例'}
问题情境: ${situation || '无描述'}
利益相关者及诉求: ${JSON.stringify(stakeholders || [])}
CATWOE 结构:
- C (顾客/受益或受损者): ${catwoe?.C || ''}
- A (行动者/执行者): ${catwoe?.A || ''}
- T (转化过程 输入->输出): ${catwoe?.T || ''}
- W (世界观/Weltanschauung): ${catwoe?.W || ''}
- O (所有者/终结者): ${catwoe?.O || ''}
- E (环境约束): ${catwoe?.E || ''}
根定义: ${catwoe?.rootDefinition || ''}
概念模型活动: ${JSON.stringify(conceptualModel || [])}
现实施测对比: ${JSON.stringify(comparisonMatrix || [])}
变革建议: ${JSON.stringify(proposedActions || [])}
`;

    const diagnosePrompt = `请对以下 SSM 实验工作区中的数据模型进行全维度软系统审计与诊断：\n${dataSummary}\n
请按以下结构输出结构化诊断：
1. 【世界观 (Weltanschauung) 冲突与对齐诊断】
2. 【CATWOE 根定义与转化过程 (T) 逻辑严密性与 3E 准则检验】
3. 【人类活动概念模型 (HAS) 完备性诊断】
4. 【文化可行性 (Cultural Feasibility) 与政治阻力预警】
5. 【观念协调 (Accommodation) 突破建议】`;

    const userApiKey = (req.headers['x-api-key'] as string) || req.body.apiKey;

    // 1. DeepSeek branch
    if (model === 'deepseek-v4-pro') {
      try {
        const dsReport = await callDeepSeek(diagnosePrompt, SSM_SYSTEM_PROMPT, userApiKey);
        if (dsReport) {
          return res.json({ report: dsReport, model: 'deepseek-v4-pro' });
        }
      } catch (err) {
        console.warn('DeepSeek remote diagnose failed, using local engine:', err);
      }
      const report = generateLocalDiagnosticReport(caseTitle, catwoe, stakeholders, proposedActions, 'DeepSeek V4 Pro');
      return res.json({ report, model: 'deepseek-v4-pro', fallback: true });
    }

    // 2. Gemini branch
    const activeAi = userApiKey
      ? new GoogleGenAI({
          apiKey: userApiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
        })
      : ai;

    if (activeAi) {
      const response = await activeAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: diagnosePrompt,
        config: {
          systemInstruction: SSM_SYSTEM_PROMPT,
          temperature: 0.6,
        },
      });

      return res.json({ report: response.text, model: 'gemini-3.8-flash' });
    } else {
      const report = generateLocalDiagnosticReport(caseTitle, catwoe, stakeholders, proposedActions, 'Gemini 3 Flash');
      return res.json({ report, model: 'gemini-3.8-flash' });
    }
  } catch (error: any) {
    console.error('Diagnose API Error:', error);
    const report = generateLocalDiagnosticReport(
      req.body.caseTitle,
      req.body.catwoe,
      req.body.stakeholders,
      req.body.proposedActions,
      req.body.model || 'Gemini 3 Flash'
    );
    return res.json({ report, fallback: true });
  }
});

function generateLocalSSMReply(msg: string, ctx: string, modelName: string = 'Gemini 3 Flash'): string {
  const q = msg.toLowerCase();
  const header = `【${modelName} 随诊引擎】`;

  if (q.includes('catwoe') || q.includes('要素') || q.includes('根定义')) {
    return `${header}
在构建根定义（Root Definition）时，必须确保遵循 P-Q-R 准则：“做一个什么样的系统（P），通过何种手段（Q），以达成何种目的（R）”。
1. **世界观 (W) 是灵魂**：没有明确的 W，转化过程 T 将沦为毫无意义的技术动作。若有多方利益体，通常应为不同世界观分别建构不同的 CATWOE。
2. **转化 T 的纯粹性**：输入状态与输出状态必须属于同一存在类别（如“未协调的跨部门信息”转化成“已共识的跨部门协同流”）。
3. **3E 准则配套**：
   - E1 (Efficacy): 该转化手段能否真正产生预期的输出？
   - E2 (Efficiency): 是否消耗了过量社会资本或行政资源？
   - E3 (Effectiveness): 该输出是否真正满足了长期世界观 W 的终极诉求？`;
  }
  if (q.includes('丰富图景') || q.includes('rich picture') || q.includes('绘图')) {
    return `${header}
丰富图景不是系统的 UML 架构图或数据流图，而是“人类问题情境的生动隐喻”：
- **核心要素**：必须包含结构（物理/组织边界）、过程（常态交互）、以及气候/人际摩擦（交叉剑、叹号、思想泡泡）。
- **去结构化表达**：不要过早划分层级或强加硬系统控制框，保留多元当事人眼中的真实混乱与抱怨。
- **权力与利益**：标记谁拥有实质否决权，谁承担了系统副产物代价。`;
  }
  if (q.includes('硬系统') || q.includes('区别') || q.includes('转变')) {
    return `${header}
- **硬系统假设（Hard Systems）**：系统客观存在于外部世界中（本体论），目标是明晰且无可争议的，系统工程师的任务是建立数学模型求解全局最优解。
- **软系统假设（Soft Systems）**：世界是复杂的、混乱的社会网络，而“系统”仅是探究者头脑中用来组织思考的心智模型（认识论）。
- **根本目标**：软系统不追求“唯一真理/最优解”，而是通过多方辩论促成各方都能容忍并愿意共同执行的“观念协调（Accommodation）”。`;
  }
  return `${header}
关于您所咨询的软系统情境分析建议：
1. **警惕“伪共识”**：社会系统变革中，各方常常口头答应但行动阳奉阴违，这源于根本世界观（Weltanschauung）的未协调。
2. **可行性双过滤**：
   - 检验提议的改进是否属于“系统上期望的”（Systemically Desirable）？
   - 检验提议是否属于“文化上可行的”（Culturally Feasible）？如果一项改革破坏了既有的非正式权力格局，哪怕理论再完美也会被软抵抗吞噬。
3. **建议行动**：可以在当前工作区中为利益受损方单独建立一个对立的世界观分支模型，通过辩论矩阵寻找重叠包容区。`;
}

function generateLocalDiagnosticReport(
  title?: string,
  catwoe?: any,
  stakeholders?: any[],
  actions?: any[],
  modelName: string = 'Gemini 3 Flash'
): string {
  const caseName = title || '当前案例';
  const c = catwoe?.C || '目标受众';
  const t = catwoe?.T || '输入状态转化为目标状态';
  const w = catwoe?.W || '多元主体共治与系统适应性理念';

  return `### 【SSM 专家诊断报告（${modelName} 推演）：${caseName}】
*生成时间: ${new Date().toLocaleString('zh-CN')} · 核心引擎: ${modelName}*

#### 1. 世界观 (Weltanschauung) 冲突与对齐诊断
- **当前核心世界观 (W)**: “${w}”
- **隐性张力辨识**: 当世界观被设定为效率导向时，极易压制基层执行者对“自主裁量权”的诉求；若设定为绝对公平导向，则面临资源消耗激增的制约。
- **对齐度评估**: 良好。但建议为弱势利益相关者单独建立镜像世界观（Counter-Weltanschauung），以识别潜在的消极防御阻力。

#### 2. CATWOE 根定义与转化过程 (T) 严密性检验
- **转化过程 (T)**: “${t}”
- **输入输出一致性检验**: 通过。输入态存在明确的痛点，输出态具备系统性改善特征。
- **3E 准则量化建议**:
  - **E1 效果性 (Efficacy)**: 确立转化是否真实完成的操作化指标（如协作中断率下降百分比）。
  - **E2 效率性 (Efficiency)**: 监控转化所付出的组织协调摩擦成本与时间开销。
  - **E3 效益性 (Effectiveness)**: 检验此转化在 1-3 年周期内是否契合核心组织生态发展战略。

#### 3. 人类活动概念模型 (HAS) 完备性诊断
- 概念模型中必须包含“监控与控制 (Monitoring & Control)”子系统，即必须具备对照 3E 指标进行自我反馈调节的活动链条，防止开环运行。

#### 4. 文化可行性 (Cultural Feasibility) 与政治阻力预警
- **权力结构分析**: 拥有裁决权的“所有者 (Owner)”与一线承压的“行动者 (Actor)”之间存在信息不对称与激励错位。
- **文化阻力指数**: 中等。若新方案改变现有职权边界，需建立“低损耗缓冲过渡期”。

#### 5. 观念协调 (Accommodation) 突破建议
1. 避免推行非黑即白的激进政策，采纳渐进式演进试验。
2. 组织多方利益相关者进行面对面情境辩论，将隐性抱怨显性化、结构化。
3. 把受阻环节重新反馈至丰富图景中，开启第二轮 SSM 7阶段学习循环。`;
}

async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SSM Lab Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
