import React, { useState } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import { ConceptualActivity, ComparisonItem } from '../../types/ssm';
import {
  Workflow,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Sparkles,
  Layers,
  HelpCircle,
  AlertCircle,
  RotateCcw,
  Check,
  X,
  FileText,
} from 'lucide-react';
import { KatexFormula } from '../common/KatexFormula';

export const Module8Workflow: React.FC = () => {
  const { activeCase, updateActiveCase, setActiveTab } = useSSMLab();
  const [currentStage, setCurrentStage] = useState<number>(5); // default to Stage 5 Comparison which is the core pivot

  const stagesMeta = [
    { num: 1, title: '非结构化情境', subtitle: '进入真实问题' },
    { num: 2, title: '表达情境/富图', subtitle: '丰富图景绘制' },
    { num: 3, title: 'CATWOE根定义', subtitle: 'P-Q-R系统命名' },
    { num: 4, title: 'HAS概念模型', subtitle: '纯逻辑活动网络' },
    { num: 5, title: '模型与现实对比', subtitle: '结构化辩论对比' },
    { num: 6, title: '可行变革过滤', subtitle: '系统期望与文化可行' },
    { num: 7, title: '采取改善行动', subtitle: '实施与下一轮循环' },
  ];

  const handleToggleDesirable = (itemId: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.comparisonItems.find((c: any) => c.id === itemId);
      if (target) target.systemicallyDesirable = !target.systemicallyDesirable;
      return cloned;
    });
  };

  const handleToggleFeasible = (itemId: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.comparisonItems.find((c: any) => c.id === itemId);
      if (target) target.culturallyFeasible = !target.culturallyFeasible;
      return cloned;
    });
  };

  const handleUpdateAction = (itemId: string, text: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.comparisonItems.find((c: any) => c.id === itemId);
      if (target) target.agreedAction = text;
      return cloned;
    });
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                全流程导引
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                SSM 七阶段学习循环全流程导引 (Seven-Stage Inquiry Cycle)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              从非结构化情境到概念模型，再通过“模型 vs 现实”对比辩论，过滤出系统期望且文化可行的改善行动。
            </p>
          </div>

          <div className="text-xs font-mono bg-stone-100 text-slate-600 px-3 py-1.5 rounded-lg border border-stone-200">
            Checkland 7-Stage Iteration
          </div>
        </div>

        {/* 7-Stage Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 pt-3 border-t border-stone-100">
          {stagesMeta.map((s) => {
            const isCurrent = currentStage === s.num;
            const isPassed = currentStage > s.num;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStage(s.num)}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                    : isPassed
                    ? 'bg-stone-50 text-slate-700 border-stone-300 hover:bg-stone-100'
                    : 'bg-white text-slate-400 border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`font-mono text-[10px] px-1 py-0.2 rounded ${
                      isCurrent
                        ? 'bg-indigo-400 text-slate-950 font-bold'
                        : 'bg-stone-200 text-slate-600'
                    }`}
                  >
                    S{s.num}
                  </span>
                  {isPassed && <Check className="w-3 h-3 text-emerald-600" />}
                </div>
                <div className="text-xs font-bold truncate">{s.title}</div>
                <div className="text-[10px] opacity-75 truncate">{s.subtitle}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Panels */}
      {/* STAGE 1 & 2 */}
      {(currentStage === 1 || currentStage === 2) && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-slate-800">
              阶段 {currentStage}：{currentStage === 1 ? '非结构化问题情境感知' : '表达情境与丰富图景'}
            </h3>
            <button
              onClick={() => setActiveTab(currentStage === 1 ? 3 : 2)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
            >
              <span>前往对应独立模块操作</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 text-xs text-slate-700 leading-relaxed">
            <h4 className="font-bold text-slate-900 mb-2">情境事实摘要：</h4>
            {activeCase.unstructuredSituation}
          </div>
        </div>
      )}

      {/* STAGE 3 */}
      {currentStage === 3 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-sm font-bold text-slate-800">
              阶段 3：构建相关目的性系统的根定义 (CATWOE)
            </h3>
            <button
              onClick={() => setActiveTab(4)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center space-x-1"
            >
              <span>前往 CATWOE 模块编辑</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 text-stone-100 p-4 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-indigo-300">
              <span>根定义 P-Q-R 形式化表述</span>
              <KatexFormula math="P \xrightarrow{Q} R" />
            </div>
            <p className="font-serif text-xs leading-relaxed">
              {activeCase.catwoe.rootDefinition}
            </p>
          </div>
        </div>
      )}

      {/* STAGE 4: Conceptual Model */}
      {currentStage === 4 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                阶段 4：人类活动系统概念模型 (HAS Conceptual Model)
              </h3>
              <p className="text-xs text-slate-500">
                严格基于根定义中的动词逻辑推导出的“纯理论活动链”，包含操作子系统与监控控制子系统。
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 bg-stone-100 px-2 py-1 rounded">
              共 {activeCase.conceptualActivities.length} 项核心活动
            </span>
          </div>

          <div className="space-y-3">
            {activeCase.conceptualActivities.map((act, idx) => (
              <div
                key={act.id}
                className="flex items-start space-x-3 p-3.5 rounded-xl border border-stone-200 bg-stone-50/70"
              >
                <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        act.category === 'control'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : act.category === 'monitoring'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      {act.category === 'control'
                        ? '控制反馈 (Control)'
                        : act.category === 'monitoring'
                        ? '监控评估 (Monitoring)'
                        : '核心操作 (Operational)'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STAGE 5: Comparison Matrix (Core SSM Pivot) */}
      {currentStage === 5 && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                阶段 5：将概念模型与现实问题情境进行结构化对比 (Comparison Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                SSM 辩论的核心支架：追问“为什么现实中没有像概念模型那样运转？差距在哪里？”
              </p>
            </div>
            <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200 font-semibold">
              辩论催化剂
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-slate-600 font-medium">
                  <th className="py-2.5 px-3">概念模型活动</th>
                  <th className="py-2.5 px-3">现实中表现</th>
                  <th className="py-2.5 px-3">差距与深层矛盾</th>
                  <th className="py-2.5 px-2 text-center">系统期望?</th>
                  <th className="py-2.5 px-2 text-center">文化可行?</th>
                  <th className="py-2.5 px-3">辩论商定改善行动</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {activeCase.comparisonItems.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-800 max-w-[140px]">
                      {item.modelActivityTitle}
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[180px]">
                      {item.realityState}
                    </td>
                    <td className="py-3 px-3 text-rose-700 max-w-[180px]">
                      {item.gapDescription}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleToggleDesirable(item.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                          item.systemicallyDesirable
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-stone-100 text-slate-400'
                        }`}
                        title="点击切换：系统上是否期望"
                      >
                        {item.systemicallyDesirable ? '✓' : '✕'}
                      </button>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <button
                        onClick={() => handleToggleFeasible(item.id)}
                        className={`w-6 h-6 rounded flex items-center justify-center mx-auto transition-colors ${
                          item.culturallyFeasible
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                        title="点击切换：文化上是否可行"
                      >
                        {item.culturallyFeasible ? '✓' : '✕'}
                      </button>
                    </td>
                    <td className="py-3 px-3">
                      <input
                        type="text"
                        value={item.agreedAction}
                        onChange={(e) => handleUpdateAction(item.id, e.target.value)}
                        className="w-full text-xs px-2 py-1 rounded border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 bg-white"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* STAGE 6 & 7: Actions */}
      {(currentStage === 6 || currentStage === 7) && (
        <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                阶段 {currentStage}：{currentStage === 6 ? '系统期望与文化可行变革过滤' : '采取落地行动与开启下一轮学习循环'}
              </h3>
              <p className="text-xs text-slate-500">
                任何行动方案必须同时通过两道滤网：1. 系统逻辑期望 (Systemically Desirable) 2. 现实文化容忍 (Culturally Feasible)。
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCase.proposedActions.map((act, idx) => (
              <div
                key={idx}
                className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{act.title}</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-stone-200">
                    牵头人: {act.owner}
                  </span>
                </div>

                <div className="text-[11px] bg-white p-2.5 rounded-lg border border-stone-200 space-y-1">
                  <div className="text-indigo-800">
                    <strong>文化可行性论证:</strong> {act.culturalFeasibilityNote}
                  </div>
                  <div className="text-slate-600">
                    <strong>预期成效:</strong> {act.expectedOutcome}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
