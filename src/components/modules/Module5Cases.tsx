import React, { useState } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import { SSM_CASES } from '../../data/cases';
import { SSMCase } from '../../types/ssm';
import {
  FolderGit2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Building2,
  HeartPulse,
  GraduationCap,
  ShieldAlert,
  Cpu,
  Users,
  Compass,
} from 'lucide-react';

export const Module5Cases: React.FC = () => {
  const { activeCase, setActiveCaseById, setActiveTab } = useSSMLab();
  const [previewCaseId, setPreviewCaseId] = useState<string>(activeCase.id);

  const previewCase = SSM_CASES.find((c) => c.id === previewCaseId) || SSM_CASES[0];

  const caseIcons: Record<string, React.ElementType> = {
    'case-gov-collab': Building2,
    'case-healthcare': HeartPulse,
    'case-higher-ed': GraduationCap,
    'case-emergency': ShieldAlert,
    'case-digital-trans': Cpu,
    'case-community-aging': Users,
  };

  const handleLoadCase = (caseId: string) => {
    setActiveCaseById(caseId);
    setPreviewCaseId(caseId);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                实战案例
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                六大软系统实战案例库 (Six Empirical SSM Case Studies)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              覆盖数字政务、医疗体制、高校改革、应急韧性、企业转型与社区养老，一键加载至实验台即刻演练。
            </p>
          </div>

          <div className="text-xs text-slate-500">
            当前运行案例：<span className="font-semibold text-slate-800">{activeCase.title}</span>
          </div>
        </div>
      </div>

      {/* Six Cases Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SSM_CASES.map((c, index) => {
          const Icon = caseIcons[c.id] || Compass;
          const isActive = activeCase.id === c.id;
          const isPreview = previewCaseId === c.id;

          return (
            <div
              key={c.id}
              onClick={() => setPreviewCaseId(c.id)}
              className={`bg-white rounded-xl border p-4 transition-all cursor-pointer shadow-xs relative flex flex-col justify-between ${
                isPreview
                  ? 'border-indigo-500 ring-2 ring-indigo-200 bg-indigo-50/20'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-slate-700">
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">
                        案例 0{index + 1} · {c.domain}
                      </span>
                      <h3 className="text-xs font-bold text-slate-800">{c.title}</h3>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-medium flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>运行中</span>
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                  {c.summary}
                </p>

                {/* Methodology mapping badge */}
                <div className="mt-3 bg-stone-50 rounded-lg p-2 border border-stone-200 text-[11px] text-slate-700">
                  <span className="font-semibold text-indigo-700">方法论映射：</span>
                  {c.subtitle}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  {c.stakeholders.length} 主体 · {c.conflictPairs.length} 冲突
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLoadCase(c.id);
                  }}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    isActive
                      ? 'bg-stone-100 text-slate-500 cursor-default'
                      : 'bg-slate-800 text-white hover:bg-slate-900 shadow-xs'
                  }`}
                >
                  {isActive ? '当前实验案例' : '一键载入工作台'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Case Deep Dive Preview Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-200 gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-stone-200">
                案例深度透视 · {previewCase.domain}
              </span>
              <h3 className="text-base font-bold text-slate-900 font-serif">
                {previewCase.title}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">{previewCase.subtitle}</p>
          </div>

          <button
            onClick={() => handleLoadCase(previewCase.id)}
            className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs"
          >
            <span>加载并跳转至 CATWOE / 全流程</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Unstructured Situation */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            非结构化问题情境 (Unstructured Problem Situation)
          </h4>
          <p className="text-xs text-slate-700 leading-relaxed bg-stone-50 p-4 rounded-xl border border-stone-200">
            {previewCase.unstructuredSituation}
          </p>
        </div>

        {/* Stakeholders & CATWOE Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">
              主要利益主体与世界观 (Stakeholders & Worldviews)
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {previewCase.stakeholders.map((sh) => (
                <div key={sh.id} className="text-xs bg-white p-2.5 rounded-lg border border-stone-200">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{sh.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">权{sh.power} · 益{sh.interest}</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 italic">
                    “{sh.worldview}”
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <h4 className="text-xs font-bold text-slate-800">
              CATWOE 根定义与转化 (Root Definition)
            </h4>
            <div className="text-xs bg-slate-900 text-stone-100 p-3.5 rounded-lg border border-slate-800 space-y-2">
              <span className="text-[10px] font-mono text-indigo-300 block">
                ROOT DEFINITION (P-Q-R)
              </span>
              <p className="font-serif leading-relaxed text-[11px]">
                {previewCase.catwoe.rootDefinition}
              </p>
            </div>
            <div className="text-[11px] text-slate-600 bg-white p-2 rounded-lg border border-stone-200 space-y-1">
              <div><strong className="text-indigo-700">T 转化:</strong> {previewCase.catwoe.T}</div>
              <div><strong className="text-purple-700">W 世界观:</strong> {previewCase.catwoe.W}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
