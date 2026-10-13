import React, { useState } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import { SSM_CASES } from '../../data/cases';
import { SSMCase } from '../../types/ssm';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Copy,
  Check,
  Upload,
  FileText,
  FileCode,
  Share2,
  CheckCircle2,
  Building2,
  HeartPulse,
  GraduationCap,
  ShieldAlert,
  Cpu,
  Users,
  Eye,
  Layers,
  ArrowRight,
  BookOpen,
  FolderArchive,
} from 'lucide-react';

export const Module9Export: React.FC = () => {
  const { activeCase, updateActiveCase, setActiveCaseById } = useSSMLab();
  const [copiedMd, setCopiedMd] = useState(false);
  const [previewCaseId, setPreviewCaseId] = useState<string>(activeCase.id);

  // The case currently selected for preview
  const currentPreviewCase: SSMCase =
    previewCaseId === activeCase.id
      ? activeCase
      : SSM_CASES.find((c) => c.id === previewCaseId) || activeCase;

  const caseIcons: Record<string, React.ElementType> = {
    'case-gov-collab': Building2,
    'case-healthcare': HeartPulse,
    'case-higher-ed': GraduationCap,
    'case-emergency': ShieldAlert,
    'case-digital-trans': Cpu,
    'case-community-aging': Users,
  };

  // Generate 7-Stage Structured Markdown Report for any given case
  const generate7StageMarkdownReport = (c: SSMCase) => {
    return `# 软系统方法论 (SSM) 综合审计与行动方案报告
*按照彼得·切克兰德 (Peter Checkland) 经典 7 阶段学习循环规范编撰*

---

### 【案例元信息】
- **案例名称**：${c.title}
- **应用领域**：${c.domain}
- **核心议题**：${c.subtitle}
- **分析报告生成时间**：${new Date().toLocaleString('zh-CN')}
- **方法论架构**：Soft Systems Methodology (Checkland 7-Stage Inquiry Cycle)

---

## 阶段 1：进入非结构化问题情境 (Problem Situation Unstructured)
### 1.1 背景叙事与痛点阐释
${c.unstructuredSituation}

---

## 阶段 2：表达问题情境与丰富图景 (Problem Situation Expressed & Rich Picture)
### 2.1 丰富图景核心图元拓扑要素清单
- **参与图元节点总数**：${c.richPicture.nodes.length} 个
- **组织结构与行动者交互关系边数**：${c.richPicture.edges.length} 条

${c.richPicture.nodes
  .map(
    (n, i) =>
      `${i + 1}. **[${n.type.toUpperCase()}] ${n.label}**\n   - 属性注解：${n.sublabel || '常规实体'}\n   - 类别定位：${
        n.type === 'actor'
          ? '一线行动者 (Actor)'
          : n.type === 'org'
          ? '组织机构 (Organization)'
          : n.type === 'bubble'
          ? '隐秘思想泡泡 (Thought Bubble)'
          : n.type === 'conflict'
          ? '博弈冲突交锋点 (⚔️ Conflict)'
          : '制度/文化壁垒 (Barrier)'
      }`
  )
  .join('\n\n')}

---

## 阶段 3：构建相关目的性系统根定义与 CATWOE (Root Definitions & CATWOE)
### 3.1 形式化根定义 (Root Definition P-Q-R 准则)
> **${c.catwoe.rootDefinition}**

### 3.2 CATWOE 核心要素全景解构
| 核心要素代码 | 术语全称 | 核心内涵与案例具象化映射 |
| :---: | :--- | :--- |
| **C** | **Customers (顾客)** | ${c.catwoe.C} |
| **A** | **Actors (行动者)** | ${c.catwoe.A} |
| **T** | **Transformation (转化过程)** | ${c.catwoe.T} |
| **W** | **Weltanschauung (世界观)** | ${c.catwoe.W} |
| **O** | **Owners (所有者)** | ${c.catwoe.O} |
| **E** | **Environmental Constraints (环境约束)** | ${c.catwoe.E} |

### 3.3 转化过程 (T) 输入-输出同质性解构
- **初始输入状态 (Input State $I$)**：${c.catwoe.inputState}
- **目标输出状态 (Output State $O$)**：${c.catwoe.outputState}

### 3.4 切克兰德 3E 评价准则体系 (3E Criteria for HAS)
1. **E1 效果性 (Efficacy - Does it work?)**：${c.catwoe.efficacy}
2. **E2 效率性 (Efficiency - Resources used?)**：${c.catwoe.efficiency}
3. **E3 效益性 (Effectiveness - Meets long-term W?)**：${c.catwoe.effectiveness}

---

## 阶段 4：建立人类活动系统概念模型 (HAS Conceptual Model)
概念模型完全基于根定义中的动词推导出逻辑自洽的活动网络，包含操作活动与监控控制闭环：

${c.conceptualActivities
  .map(
    (act, i) =>
      `### 4.${i + 1} 活动 [${act.category.toUpperCase()}]: ${act.title}
- **详细动作说明**：${act.description}
- **逻辑依赖前序活动**：${act.dependsOn.length > 0 ? act.dependsOn.join(', ') : '系统起始输入节点'}
- **活动类别**：${
        act.category === 'control'
          ? '控制反馈调节 (Control)'
          : act.category === 'monitoring'
          ? '3E 指标监测 (Monitoring)'
          : act.category === 'input'
          ? '环境信息输入 (Input)'
          : '核心转化操作 (Operational)'
      }`
  )
  .join('\n\n')}

---

## 阶段 5：概念模型与现实情境结构化对比辩论 (Comparison Matrix)
将概念模型的“纯理论理想”与当前真实组织运行进行逐项对比，激发深层制度性差距辩论：

| 概念模型理想活动 | 现实中运行表现 | 差距与深层制度/文化矛盾 | 系统期望 (Desirable)? | 文化可行 (Feasible)? | 辩论商定改善行动 |
| :--- | :--- | :--- | :---: | :---: | :--- |
${c.comparisonItems
  .map(
    (item) =>
      `| **${item.modelActivityTitle}** | ${item.realityState} | ${item.gapDescription} | ${
        item.systemicallyDesirable ? '✓ 是' : '✕ 否'
      } | ${item.culturallyFeasible ? '✓ 是' : '✕ 否'} | ${item.agreedAction} |`
  )
  .join('\n')}

---

## 阶段 6：辩论确定系统期望且文化可行的变革 (Systemically Desirable & Culturally Feasible Changes)
任何行动方案必须同时通过两道滤网（系统逻辑上期望 + 现实文化中包容）：

${c.proposedActions
  .map(
    (act, i) => `### 6.${i + 1} 变革提议：${act.title}
- **主导实施主体 (Owner)**：${act.owner}
- **文化可行性与非正式阻力论证**：${act.culturalFeasibilityNote}
- **系统预期达致成效**：${act.expectedOutcome}`
  )
  .join('\n\n')}

---

## 阶段 7：采取改善行动与开启持续学习循环 (Action to Improve the Situation)
### 7.1 行动组合与落地推进策略
1. **成立观念协调 (Accommodation) 专项联席小组**，由 ${c.stakeholders[0]?.name || '牵头部门'} 牵头建立定期情境反馈通道。
2. **设立 3E 评价监测仪表盘**，在 3-6 个月周期内跟踪成效指标演进。
3. **将执行中产生的新博弈摩擦重新回流至丰富图景中**，开启第 2 轮 SSM 7 阶段持续学习循环。

---

## 【附录】系统代数与利益博弈网络分析
- **观念冲突熵 (Tension Entropy $H$)**：${c.algebraModel.tensionEntropy}
- **世界观多维空间维度**：${c.algebraModel.worldviewDimensions.join('、')}
- **核心博弈冲突对数量**：${c.conflictPairs.length} 处
- **关键博弈对阵摘要**：
${c.conflictPairs
  .map(
    (cp, i) =>
      `  * [${cp.intensity} · ${cp.conflictType}] 一方诉求：“${cp.sourceDemand}” vs 对立方：“${cp.targetDemand}” -> **破局策略**：${cp.resolutionStrategy}`
  )
  .join('\n')}

*(本报告由软系统方法 WebApp 实验室自动生成 · 遵循 Checkland 7-Stage Inquiry Cycle)*
`;
  };

  // Download helpers
  const downloadSingleCaseJson = (targetCase: SSMCase) => {
    const jsonStr = JSON.stringify(targetCase, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSM_RawData_${targetCase.id}.json`;
    a.click();
  };

  const downloadSingleCaseMarkdown = (targetCase: SSMCase) => {
    const md = generate7StageMarkdownReport(targetCase);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSM_7Stage_Report_${targetCase.id}.md`;
    a.click();
  };

  const downloadAllCasesBundleJson = () => {
    const allData = {
      project: 'Soft Systems Methodology WebApp Lab',
      exportDate: new Date().toISOString(),
      totalCases: SSM_CASES.length,
      cases: SSM_CASES,
    };
    const jsonStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SSM_All_6_Cases_RawData_Bundle.json`;
    a.click();
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generate7StageMarkdownReport(currentPreviewCase));
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.id && parsed.catwoe) {
          updateActiveCase(() => parsed);
          setPreviewCaseId(parsed.id);
          alert('案例数据恢复导入成功！');
        } else {
          alert('无效的 SSM 案例数据格式。');
        }
      } catch (err) {
        alert('文件解析失败，请检查是否为合法 JSON 文件。');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                报告导出
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                数据集与分析报告导出引擎 (Export & Reporting Engine)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              六大案例原始数据独立下载、全流程 7 阶段标准报告组织、在线深度预览与出版级打印/PDF 保存。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors shadow-xs"
            >
              {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedMd ? '已复制报告' : '复制预览报告 MD'}</span>
            </button>

            <button
              onClick={() => downloadSingleCaseMarkdown(currentPreviewCase)}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载当前报告 (.md)</span>
            </button>

            <button
              onClick={downloadAllCasesBundleJson}
              className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
              title="打包导出全部 6 大实战案例完整原始数据"
            >
              <FolderArchive className="w-3.5 h-3.5" />
              <span>打包下载 6 大案例合辑 (.json)</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-slate-900 hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 存为 PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: Six Empirical Cases Raw Data Download Hub */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <FolderArchive className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800 font-serif">
                六大实战案例原始数据下载中心 (Empirical Cases Raw Data Downloads)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              各案例均提供独立标准结构化原始数据 JSON、全流程导引 7 阶段报告 Markdown 及一键在线预览。
            </p>
          </div>

          <label className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-300 transition-colors cursor-pointer self-start sm:self-auto">
            <Upload className="w-3 h-3" />
            <span>导入本地数据恢复工作区</span>
            <input type="file" accept=".json" onChange={handleImportJson} className="hidden" />
          </label>
        </div>

        {/* 6 Cases Download Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {SSM_CASES.map((c, idx) => {
            const Icon = caseIcons[c.id] || Building2;
            const isCurrentlyPreviewed = previewCaseId === c.id;
            const isCurrentActiveWorkspace = activeCase.id === c.id;

            return (
              <div
                key={c.id}
                className={`rounded-xl border p-4 transition-all relative flex flex-col justify-between ${
                  isCurrentlyPreviewed
                    ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 bg-stone-50/40'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-lg bg-white border border-stone-200 flex items-center justify-center text-slate-700 shadow-2xs">
                        <Icon className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          案例 0{idx + 1} · {c.domain}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                      </div>
                    </div>

                    {isCurrentActiveWorkspace && (
                      <span className="text-[9px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.2 rounded font-semibold">
                        当前工作台
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                    {c.summary}
                  </p>

                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex items-center space-x-2">
                    <span>{c.stakeholders.length} 主体</span>
                    <span>·</span>
                    <span>{c.conflictPairs.length} 博弈冲突</span>
                    <span>·</span>
                    <span>{c.conceptualActivities.length} HAS 活动</span>
                  </div>
                </div>

                {/* Download and Preview Action Buttons */}
                <div className="mt-3.5 pt-2.5 border-t border-stone-200/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => downloadSingleCaseJson(c)}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] rounded bg-white hover:bg-stone-100 text-slate-700 border border-stone-300 transition-colors shadow-2xs font-mono"
                      title="下载该案例原始 JSON 数据包"
                    >
                      <FileCode className="w-3 h-3 text-indigo-600" />
                      <span>.JSON</span>
                    </button>

                    <button
                      onClick={() => downloadSingleCaseMarkdown(c)}
                      className="inline-flex items-center space-x-1 px-2 py-1 text-[11px] rounded bg-white hover:bg-stone-100 text-slate-700 border border-stone-300 transition-colors shadow-2xs font-mono"
                      title="下载该案例 7 阶段 Markdown 报告"
                    >
                      <FileText className="w-3 h-3 text-emerald-600" />
                      <span>.MD</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setPreviewCaseId(c.id);
                    }}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors ${
                      isCurrentlyPreviewed
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-stone-200 hover:bg-stone-300 text-slate-700'
                    }`}
                  >
                    <Eye className="w-3 h-3" />
                    <span>{isCurrentlyPreviewed ? '正在预览' : '预览报告'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: 7-Stage Live Report Preview */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-8 print:shadow-none print:border-none print:p-0">
        {/* Report Top Meta Header */}
        <div className="border-b border-stone-200 pb-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
              CHECKLAND 7-STAGE INQUIRY CYCLE COMPREHENSIVE REPORT
            </span>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500">预览案例切换:</span>
              <select
                aria-label="选择预览案例"
                value={previewCaseId}
                onChange={(e) => setPreviewCaseId(e.target.value)}
                className="text-xs font-semibold text-slate-800 bg-stone-100 border border-stone-300 rounded px-2 py-1 focus:outline-hidden"
              >
                {SSM_CASES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <h1 className="text-xl font-bold font-serif text-slate-900 mt-1">
            《{currentPreviewCase.title}》软系统 7 阶段全流程诊断报告
          </h1>
          <p className="text-xs text-slate-500 mt-1">{currentPreviewCase.subtitle}</p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-3 pt-3 border-t border-stone-100 font-mono">
            <span>应用领域: {currentPreviewCase.domain}</span>
            <span>·</span>
            <span>报告组织: SSM 七阶段学习循环规范</span>
            <span>·</span>
            <span>状态: 逻辑闭环已检验</span>
          </div>
        </div>

        {/* 阶段 1 */}
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              01
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 1：进入非结构化问题情境 (Problem Situation Unstructured)
            </h3>
          </div>
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-slate-700 leading-relaxed font-serif">
            {currentPreviewCase.unstructuredSituation}
          </div>
        </div>

        {/* 阶段 2 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              02
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 2：表达问题情境与丰富图景 (Problem Situation Expressed & Rich Picture)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            非结构化情境多维表达：捕捉物理边界、行动者诉求、隐性文化阻力与交锋冲突点。
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentPreviewCase.richPicture.nodes.map((node, i) => (
              <div
                key={node.id}
                className="p-3 rounded-lg border border-stone-200 bg-stone-50/60 text-xs flex items-start space-x-2"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 mt-1"
                  style={{ backgroundColor: node.color || '#3B82F6' }}
                />
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-800">
                    {node.label}{' '}
                    <span className="font-normal text-[10px] text-slate-400 font-mono">
                      [{node.type.toUpperCase()}]
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{node.sublabel || '无属性注解'}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 阶段 3 */}
        <div className="space-y-3.5">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              03
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 3：构建目的性系统根定义与 CATWOE (Root Definitions & CATWOE)
            </h3>
          </div>

          {/* Root Definition P-Q-R */}
          <div className="bg-slate-950 text-stone-100 rounded-xl p-4 space-y-1.5 shadow-sm">
            <span className="text-[10px] font-mono text-indigo-300 block uppercase tracking-wider">
              FORMAL ROOT DEFINITION (P-Q-R 公式系统命名)
            </span>
            <p className="font-serif text-xs leading-relaxed text-slate-200">
              {currentPreviewCase.catwoe.rootDefinition}
            </p>
          </div>

          {/* CATWOE Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-amber-700 block">C · Customers (顾客)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.C}</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-emerald-700 block">A · Actors (行动者)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.A}</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-indigo-700 block">T · Transformation (转化)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.T}</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-purple-700 block">W · Weltanschauung (世界观)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.W}</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-blue-700 block">O · Owners (所有者)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.O}</p>
            </div>
            <div className="p-3 rounded-lg bg-stone-50 border border-stone-200 space-y-1">
              <span className="font-mono font-bold text-rose-700 block">E · Environment (环境约束)</span>
              <p className="text-[11px] text-slate-700">{currentPreviewCase.catwoe.E}</p>
            </div>
          </div>

          {/* 3E Evaluation Slices */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2 text-xs">
            <span className="font-bold text-slate-800 block text-[11px]">
              切克兰德 3E 评价准则体系 (3E Criteria for Transformation)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
              <div className="bg-white p-2.5 rounded border border-stone-200">
                <strong className="text-emerald-700">E1 效果性 (Efficacy):</strong>
                <p className="mt-0.5 text-slate-600">{currentPreviewCase.catwoe.efficacy}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-stone-200">
                <strong className="text-blue-700">E2 效率性 (Efficiency):</strong>
                <p className="mt-0.5 text-slate-600">{currentPreviewCase.catwoe.efficiency}</p>
              </div>
              <div className="bg-white p-2.5 rounded border border-stone-200">
                <strong className="text-purple-700">E3 效益性 (Effectiveness):</strong>
                <p className="mt-0.5 text-slate-600">{currentPreviewCase.catwoe.effectiveness}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 阶段 4 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              04
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 4：建立人类活动系统概念模型 (HAS Conceptual Model)
            </h3>
          </div>
          <p className="text-xs text-slate-500">
            完全基于根定义动词推导的纯逻辑活动集合，形成完整的前馈-反馈监控回路。
          </p>

          <div className="space-y-2">
            {currentPreviewCase.conceptualActivities.map((act, i) => (
              <div
                key={act.id}
                className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 text-xs flex items-start justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-slate-800">
                    活动 {i + 1}：{act.title}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{act.description}</div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${
                    act.category === 'control'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : act.category === 'monitoring'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  {act.category === 'control' ? '控制调节' : act.category === 'monitoring' ? '指标监测' : '核心操作'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 阶段 5 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              05
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 5：概念模型与现实情境结构化对比辩论 (Comparison Matrix)
            </h3>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-stone-100 text-slate-700 font-semibold border-b border-stone-200">
                <tr>
                  <th className="p-2.5">模型活动</th>
                  <th className="p-2.5">现实中运行表现</th>
                  <th className="p-2.5">差距与深层矛盾</th>
                  <th className="p-2 text-center">期望?</th>
                  <th className="p-2 text-center">可行?</th>
                  <th className="p-2.5">辩论商定改善行动</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {currentPreviewCase.comparisonItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50">
                    <td className="p-2.5 font-medium text-slate-800">{item.modelActivityTitle}</td>
                    <td className="p-2.5 text-slate-600">{item.realityState}</td>
                    <td className="p-2.5 text-rose-700">{item.gapDescription}</td>
                    <td className="p-2 text-center font-bold">
                      {item.systemicallyDesirable ? '✓' : '✕'}
                    </td>
                    <td className="p-2 text-center font-bold text-emerald-700">
                      {item.culturallyFeasible ? '✓' : '✕'}
                    </td>
                    <td className="p-2.5 text-indigo-700 font-medium">{item.agreedAction}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 阶段 6 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              06
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 6：辩论确定系统期望且文化可行的变革 (Systemically Desirable & Culturally Feasible)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentPreviewCase.proposedActions.map((act, i) => (
              <div key={i} className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 flex justify-between">
                  <span>变革提议：{act.title}</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">牵头: {act.owner}</span>
                </div>
                <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-stone-200">
                  <strong className="text-indigo-800">文化可行性论证:</strong> {act.culturalFeasibilityNote}
                </div>
                <div className="text-[11px] text-emerald-800">
                  <strong>预期达致成效:</strong> {act.expectedOutcome}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 阶段 7 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="w-5 h-5 rounded-md bg-slate-900 text-white font-mono text-[10px] flex items-center justify-center font-bold">
              07
            </span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono">
              阶段 7：采取改善行动与开启持续学习循环 (Action & Continuous Learning)
            </h3>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 text-xs text-slate-700 leading-relaxed space-y-2">
            <p>
              1. 成立由 <strong>{currentPreviewCase.stakeholders[0]?.name || '牵头机构'}</strong> 牵头的跨边界观念协调小组，建立定期社情反馈通道。
            </p>
            <p>
              2. 设立 3E 评价监测机制，对推行中的执行阻力进行敏捷纠偏，确保不违背当事人的主体尊严。
            </p>
            <p>
              3. 软系统方法的核心在于“没有永久的固定终局”，将本轮落地行动后诱发的新情境再次反馈至丰富图景，开启下一轮迭代学习。
            </p>
          </div>
        </div>

        {/* 附录 */}
        <div className="pt-4 border-t border-stone-200 space-y-2 text-xs text-slate-500 font-mono">
          <div className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
            附录：系统代数与张力熵指标 (Appendix: Algebra & Entropy)
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div className="p-2 bg-stone-50 rounded border border-stone-200">
              <span>张力熵 (Entropy):</span>
              <strong className="block text-slate-800 text-sm mt-0.5">{currentPreviewCase.algebraModel.tensionEntropy}</strong>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200">
              <span>主体数量:</span>
              <strong className="block text-slate-800 text-sm mt-0.5">{currentPreviewCase.stakeholders.length} 方</strong>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200">
              <span>博弈冲突对:</span>
              <strong className="block text-rose-700 text-sm mt-0.5">{currentPreviewCase.conflictPairs.length} 处</strong>
            </div>
            <div className="p-2 bg-stone-50 rounded border border-stone-200">
              <span>HAS 活动数:</span>
              <strong className="block text-indigo-700 text-sm mt-0.5">{currentPreviewCase.conceptualActivities.length} 项</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
