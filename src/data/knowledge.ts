export interface KnowledgeSlice {
  id: string;
  sliceNumber: string;
  title: string;
  tagline: string;
  themeColor: string;
  coreThesis: string;
  comparisonItems?: {
    dimension: string;
    hardSystem: string;
    softSystem: string;
  }[];
  detailedSections: {
    heading: string;
    content: string;
    quotes?: string;
    bulletPoints?: string[];
    warningNote?: string;
  }[];
  trapChecklist?: {
    trapName: string;
    manifestation: string;
    fatalConsequence: string;
    remedy: string;
  }[];
}

export const KNOWLEDGE_SLICES: KnowledgeSlice[] = [
  {
    id: 'slice-1',
    sliceNumber: '切片一',
    title: '硬系统与软系统根本转换',
    tagline: '从“客观真理工程求解”到“观念协调持续学习”的范式革命',
    themeColor: '#2563EB',
    coreThesis: '硬系统方法论假定世界是由客观可度量的“系统”构成的（本体论立场），目标清晰无可争议，核心任务是寻找数学与工程最优解；而软系统方法论假定现实世界充满混乱多变的主观世界观（认识论立场），系统仅存在于观察者的认知心智中，核心任务是通过结构化辩论达成“各方可接受的妥协与观念协调 (Accommodation)”。',
    comparisonItems: [
      {
        dimension: '哲学立场',
        hardSystem: '本体论实在论（Ontology）：假定客观系统独立存在于外部世界中',
        softSystem: '认识论建构主义（Epistemology）：系统是观察者认知与探究世界的智力工具',
      },
      {
        dimension: '问题属性',
        hardSystem: '良构问题（Well-structured）：目标明确，约束边界清晰，可计算最优化',
        softSystem: '病构/非结构化问题（Ill-structured / Messy）：目标模糊，价值冲突，人在系统中',
      },
      {
        dimension: '研究导向',
        hardSystem: '目标导向（Goal-oriented）：如何以最小成本达成预设固定目标？',
        softSystem: '学习导向（Learning-oriented）：我们究竟在面对什么？各方对这件事情的理解是什么？',
      },
      {
        dimension: '终局成果',
        hardSystem: '交付一个经过数学优化的工程方案、软件架构或固定流程',
        softSystem: '达成各方愿意共同履行的“观念协调（Accommodation）”及系统可行与文化可行行动',
      },
      {
        dimension: '方法论代表',
        hardSystem: '运筹学、经典控制论、瀑布软件工程、传统管理信息系统（MIS）',
        softSystem: '彼得·切克兰德软系统方法论 (Checkland SSM)、批判系统思考 (CST)',
      },
    ],
    detailedSections: [
      {
        heading: '范式转换的核心动力：社会系统的不可计算性',
        content: '20世纪60-70年代，英国兰卡斯特大学的彼得·切克兰德（Peter Checkland）团队试图将经典系统工程（System Engineering）直接应用于复杂的英国企业管理、医院体制与政府改革，结果遭遇了接二连三的惨重挫败。工程团队设计出的“最优流程”遭到了企业基层和中层管理者的本能抗拒，最终被束之高阁。',
        quotes: '“世界是复杂的，但它并非是一个充满‘待修系统’的机器工厂；相反，混乱存在于我们感知世界、定义意义的世界观之中。” —— Peter Checkland',
      },
      {
        heading: '概念模型的作用：不是现实的镜像，而是辩论的支架',
        content: '在软系统中构建的概念模型（Conceptual Models），绝不能当作新现实的“施工图纸”直接强制实施。它的唯一作用是作为一套逻辑纯粹的“标尺”，带回真实世界与当事人进行对照与辩论，激发当事人意识到：“为什么现实没有像模型这样运转？是什么深层权力或文化阻碍了这一活动？”',
        bulletPoints: [
          '硬系统模型 = 目标蓝图（Must implement as designed）',
          '软系统模型 = 认知探针与辩论催化剂（Device to orchestrate debate）',
        ],
      },
    ],
  },

  {
    id: 'slice-2',
    sliceNumber: '切片二',
    title: '适用条件与空间表示',
    tagline: '将弥散主观感知空间投影至结构化辩论学习空间',
    themeColor: '#059669',
    coreThesis: 'SSM 最适用于“目标本身就是争议焦点、人的自由意志与利益纠葛交织”的深水区。它通过严格的符号化流程，将弥散在语言、情绪与微观政治中的主观感受，投影到清晰、可对比、可检验的辩论向量空间中。',
    detailedSections: [
      {
        heading: '三大黄金适用情境检验',
        content: '当面临以下三个特征中的两个以上时，必须坚决弃用硬系统优化，改用软系统方法论：',
        bulletPoints: [
          '【特征一：目标定义歧义】当被问及“这个系统的目标是什么”时，五个不同的领导或部门给出了五个完全互斥的答案。',
          '【特征二：软抵抗阻力显著】技术方案已在实验室或代码层面验证通过，但在推行时遭遇广泛的“拖延、虚假汇报、被动敷衍”。',
          '【特征三：权力格局隐蔽】非正式权威、个人职业声誉或部门利益防御，远远超越了法定制度流程的真实影响力。',
        ],
      },
      {
        heading: '从主观感知空间到辩论空间的数学与拓扑投影',
        content: '软系统方法论在数学拓扑上，实质是将高维非流形的主观情绪流，经由双重投影构建出有序子流形：',
        bulletPoints: [
          '第一重投影：无结构情境流 $\\mathcal{S}_{unstructured} \\xrightarrow{\\text{丰富图景}} \\mathcal{R}_{topology}$（保留人际张力、符号和权力网络）。',
          '第二重投影：丰富图景 $\\mathcal{R}_{topology} \\xrightarrow{\\text{CATWOE}} \\mathcal{V}_{Weltanschauung}$（形式化提取顾客、行动者、世界观及转化算子）。',
          '第三重投影：纯逻辑推导 $\\mathcal{V}_{W} \\xrightarrow{\\text{HAS模型}} \\mathcal{M}_{activities}$（构建纯粹人类活动依赖网络）。',
          '第四重辩论比对：$\\mathcal{M}_{activities} \\times \\mathcal{S}_{reality} \\xrightarrow{\\text{文化与系统过滤}} \\mathcal{A}_{agreed}$（求取交集共识解）。',
        ],
      },
    ],
  },

  {
    id: 'slice-3',
    sliceNumber: '切片三',
    title: '三大致命应用陷阱',
    tagline: '教条主义、忽视世界观与跳过文化可行性的反噬警示',
    themeColor: '#DC2626',
    coreThesis: '实践中最常见的失败，往往并非源于对方法论一无所知，而是源于披着 SSM 外衣的“假软实硬”。把软系统降级为填表走过场，必然遭遇现实的猛烈反噬。',
    trapChecklist: [
      {
        trapName: '陷阱一：将 SSM 简化为硬系统流程图生搬硬套',
        manifestation: '把丰富图景（Rich Picture）画成标准的 UML 活动图、流程图或数据流图；在 CATWOE 中机械套公式，直接把现状搬进概念模型。',
        fatalConsequence: '彻底丧失了捕捉“人际矛盾、权力猜忌、非正式联盟”的敏锐度，把充满活力的活系统当成了死机器。',
        remedy: '强行要求在丰富图景中必须包含“思想泡泡（当事人内心私语）”和“交叉剑（不可调和的利益冲突）”。',
      },
      {
        trapName: '陷阱二：忽视关键利益相关者的世界观导致对立加剧',
        manifestation: '仅依据项目发起人（高层领导）的单一意志书写唯一的 CATWOE，将反对者的世界观简单定性为“落后保守、不识大体”。',
        fatalConsequence: '改革方案被基层视为权力的单向掠夺，激化地下同盟结成防御性同盟，导致改革彻底流产。',
        remedy: '必须至少为对立的利益相关者分别撰写 2-3 个平行的 CATWOE 根定义，直面彼此世界观的不可通约性。',
      },
      {
        trapName: '陷阱三：缺乏文化可行性论证导致方案纸上谈兵',
        manifestation: '在第 5-6 阶段仅检验方案在“逻辑/系统上是否期望（Systemically Desirable）”，而轻率认定“大家都是理性人，自然会接受”。',
        fatalConsequence: '方案在理论上十全十美，但在既有组织政治文化中触碰了不可触碰的红线，出台之日即是废弃之时。',
        remedy: '引入严格的“文化可行性双盲测试”：追问该行动是否剥夺了任何关键人员的核心尊严与权力？如果剥夺了，拿什么做补偿？',
      },
    ],
    detailedSections: [
      {
        heading: '案例镜鉴：某跨国企业 ERP 上线的“滑铁卢”',
        content: '一家德国咨询公司为亚洲制造巨头导入数字化系统，耗费 18 个月构建了极其精密的硬系统流程，并宣称完全遵循了系统工程理论。然而上线第一天，由于忽略了亚洲车间重视“师徒情谊与非正式安全库存”的深层世界观，基层工人集体以“网络故障”为由回归纸质单据，导致咨询项目最终以数千万元索赔告终。这正是掉入陷阱二与陷阱三的典型写照。',
      },
    ],
  },

  {
    id: 'slice-4',
    sliceNumber: '切片四',
    title: '误区警示与诊断陷阱',
    tagline: '辨析真共识与假和谐：警惕“追求单一客观真理”的傲慢偏见',
    themeColor: '#7C3AED',
    coreThesis: '软系统的核心价值在于通过多方辩论达成包容性认知共识，而非强求思想统一。“观念协调 (Accommodation)”绝非和稀泥，而是建立在各方看清彼此深层假设基础上的清醒妥协。',
    detailedSections: [
      {
        heading: '误区警示：Consensus（完全共识） vs Accommodation（观念协调）',
        content: '在现代多元异质社会系统中，追求所有参与者在思想、价值观和哲学立场上达成 100% 的一致（Consensus）是完全不切实际的乌托邦，甚至会导致极权式压制。',
        bulletPoints: [
          '共识 (Consensus)：各方认同相同的世界观 W，拥护相同的终极价值观（极难达成且脆弱）。',
          '观念协调 (Accommodation)：各方保留各自原本互不相容的世界观 W，但承认并理解对方的立场，经过辩论找到一个“双方都能忍受、且在当下共同获益的务实行动方案”。',
        ],
        warningNote: '如果在 SSM 分析中你轻易得到了所有部门齐声鼓掌的“完美方案”，请务必拉响警报：这几乎必然是表面和谐、底下暗流汹涌的“伪共识”。',
      },
      {
        heading: '3E 准则的完整闭环防伪检验',
        content: '切克兰德提出的 3E 检验（Efficacy, Efficiency, Effectiveness）是检验转化 T 是否成立的试金石：',
        bulletPoints: [
          '效果性 Efficacy (Does it work?)：手段 Q 能否真正产出预期的转化结果 T？',
          '效率性 Efficiency (Amount of resources used?)：是否以最精简的成本与组织精力产出该结果？',
          '效益性 Effectiveness (Is it meeting the longer-term goal?)：该转化是否真正服务于更宏大的终极世界观 W？（如果方向错了，效率越高危害越大！）',
        ],
      },
    ],
  },
];
