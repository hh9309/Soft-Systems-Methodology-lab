export interface Stakeholder {
  id: string;
  name: string;
  role: string;
  power: number; // 1-10
  interest: number; // 1-10
  worldview: string; // Weltanschauung
  coreDemands: string[];
  hiddenAgendas?: string;
  color?: string;
}

export interface ConflictPair {
  id: string;
  sourceId: string;
  targetId: string;
  sourceDemand: string;
  targetDemand: string;
  conflictType: '资源争夺' | '价值世界观对立' | '权力边界模糊' | '绩效考核冲突' | '信息孤岛';
  intensity: '轻微' | '中度' | '激烈'; // 1, 2, 3
  resolutionStrategy: string;
}

export interface CATWOEModel {
  C: string; // Customers (受影响者/受益者)
  A: string; // Actors (执行者)
  T: string; // Transformation (转化过程: 输入 -> 输出)
  inputState: string;
  outputState: string;
  W: string; // Weltanschauung (世界观/赋予转化意义的假设)
  O: string; // Owners (拥有者/有权终止系统的人)
  E: string; // Environmental constraints (环境约束)
  rootDefinition: string; // 根定义 (P-Q-R 格式: 做P, 经Q, 达R)
  efficacy: string; // E1 效果性: 转化是否发生？
  efficiency: string; // E2 效率性: 资源消耗是否合理？
  effectiveness: string; // E3 效益性: 是否达成长远目标？
}

export interface RichPictureNode {
  id: string;
  type: 'actor' | 'process' | 'bubble' | 'conflict' | 'org' | 'barrier' | 'structure';
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  color?: string;
}

export interface RichPictureEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  style: 'flow' | 'conflict' | 'tension' | 'control' | 'feedback';
}

export interface ConceptualActivity {
  id: string;
  title: string;
  description: string;
  category: 'operational' | 'monitoring' | 'control' | 'input' | 'output';
  dependsOn: string[]; // activity IDs
}

export interface ComparisonItem {
  id: string;
  modelActivityId: string;
  modelActivityTitle: string;
  realityState: string; // 现实中是否存在及表现
  gapDescription: string; // 差距与矛盾
  systemicallyDesirable: boolean; // 系统上是否期望
  culturallyFeasible: boolean; // 文化上是否可行
  agreedAction: string; // 辩论后商定的改善行动
}

export interface SystemAlgebraState {
  worldviewDimensions: string[]; // e.g., ['效率导向', '人文关怀', '合规风控', '创新自由']
  stakeholderVectors: {
    stakeholderId: string;
    name: string;
    weights: number[]; // 各维度权重 0-10
  }[];
  tensionMatrix: number[][]; // 利益方两两主观张力距离
  tensionEntropy: number; // 混乱度/熵
}

export interface ConflictTaskLog {
  id: string;
  timestamp: string;
  content: string;
  author: string;
}

export interface ConflictTask {
  id: string;
  conflictId?: string; // 关联的冲突对 ID
  title: string;
  description: string;
  assigneeName: string; // 责任主体名称或牵头人
  assigneeRole?: string;
  sourceSubject?: string; // 冲突方A
  targetSubject?: string; // 冲突方B
  priority: '紧急' | '高' | '中' | '低';
  status: 'backlog' | 'in_progress' | 'negotiating' | 'resolved'; // 待介入排期 | 调解推进中 | 方案协商中 | 已化解达成共识
  dueDate?: string;
  resolutionStrategy?: string; // 破局协调策略
  progressPercent: number; // 0 - 100
  tags?: string[];
  logs?: ConflictTaskLog[];
  createdAt: string;
}

export interface SSMCase {
  id: string;
  title: string;
  subtitle: string;
  domain: string;
  summary: string;
  unstructuredSituation: string;
  stakeholders: Stakeholder[];
  conflictPairs: ConflictPair[];
  conflictTasks?: ConflictTask[];
  catwoe: CATWOEModel;
  richPicture: {
    nodes: RichPictureNode[];
    edges: RichPictureEdge[];
  };
  conceptualActivities: ConceptualActivity[];
  comparisonItems: ComparisonItem[];
  proposedActions: {
    title: string;
    owner: string;
    culturalFeasibilityNote: string;
    expectedOutcome: string;
  }[];
  algebraModel: SystemAlgebraState;
}
