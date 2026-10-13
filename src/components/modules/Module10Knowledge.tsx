import React, { useState } from 'react';
import { KNOWLEDGE_SLICES, KnowledgeSlice } from '../../data/knowledge';
import {
  BookMarked,
  Sparkles,
  Layers,
  AlertTriangle,
  Compass,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  Lightbulb,
} from 'lucide-react';
import { KatexText, KatexFormula } from '../common/KatexFormula';

export const Module10Knowledge: React.FC = () => {
  const [activeSliceId, setActiveSliceId] = useState<string>(KNOWLEDGE_SLICES[0].id);

  const activeSlice =
    KNOWLEDGE_SLICES.find((s) => s.id === activeSliceId) || KNOWLEDGE_SLICES[0];

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                知识导引
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                软系统方法与机制知识导引 (SSM Theoretical Slices & Traps)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              系统哲学重构、认识论转变、数学空间投影表示与三大致命反噬陷阱切片深度导读。
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Checkland Paradigm Architecture
          </div>
        </div>
      </div>

      {/* Slices Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {KNOWLEDGE_SLICES.map((slice) => {
          const isActive = slice.id === activeSliceId;
          return (
            <button
              key={slice.id}
              onClick={() => setActiveSliceId(slice.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                isActive
                  ? 'bg-white border-indigo-500 ring-2 ring-indigo-200 shadow-xs'
                  : 'bg-stone-50/70 border-stone-200 hover:bg-white hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isActive
                      ? 'bg-slate-900 text-white'
                      : 'bg-stone-200 text-slate-600'
                  }`}
                >
                  {slice.sliceNumber}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Checkland</span>
              </div>
              <h3 className="text-xs font-bold text-slate-800">{slice.title}</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1 mt-1">
                {slice.tagline}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Slice Detailed Presentation Card */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
        {/* Slice Header */}
        <div className="border-b border-stone-200 pb-5">
          <div className="flex items-center space-x-2 text-xs font-mono font-semibold text-indigo-600 mb-1">
            <span>{activeSlice.sliceNumber} 深度切片</span>
            <span>·</span>
            <span>SSM 哲学机制</span>
          </div>
          <h2 className="text-xl font-bold font-serif text-slate-900">
            {activeSlice.title}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{activeSlice.tagline}</p>

          {/* Core Thesis Card */}
          <div className="mt-4 bg-stone-50 border-l-4 border-indigo-600 p-4 rounded-r-xl">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block mb-1">
              CORE THESIS (核心命题)
            </span>
            <p className="text-xs text-slate-800 leading-relaxed font-serif">
              <KatexText text={activeSlice.coreThesis} />
            </p>
          </div>
        </div>

        {/* Slice 1: Hard vs Soft Comparison Matrix */}
        {activeSlice.comparisonItems && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider font-mono">
              硬系统思维 VS 软系统思维 全方位对照矩阵
            </h3>
            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="bg-stone-100 text-slate-700 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3 w-28">维度</th>
                    <th className="py-2.5 px-3 bg-stone-100/60">
                      硬系统方法 (Hard Systems Engineering)
                    </th>
                    <th className="py-2.5 px-3 bg-indigo-50/50 text-indigo-900 font-bold">
                      软系统方法 (Soft Systems Methodology)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {activeSlice.comparisonItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-stone-50/50">
                      <td className="py-3 px-3 font-medium text-slate-700">
                        {item.dimension}
                      </td>
                      <td className="py-3 px-3 text-slate-600 leading-relaxed">
                        {item.hardSystem}
                      </td>
                      <td className="py-3 px-3 text-indigo-900 bg-indigo-50/20 font-medium leading-relaxed">
                        {item.softSystem}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Slice 3: Fatal Traps Checklist */}
        {activeSlice.trapChecklist && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider font-mono flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>三大致命应用陷阱与破局药方 (Checklist)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {activeSlice.trapChecklist.map((trap, idx) => (
                <div
                  key={idx}
                  className="bg-rose-50/40 rounded-xl border border-rose-200 p-4 space-y-2.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                      TRAP 0{idx + 1}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900">{trap.trapName}</h4>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong>典型表征:</strong> {trap.manifestation}
                    </p>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      <strong>致命后果:</strong> {trap.fatalConsequence}
                    </p>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-rose-200 text-[11px] text-emerald-800">
                    <strong className="text-emerald-700">破局药方:</strong> {trap.remedy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Narrative Sections */}
        <div className="space-y-4 pt-2">
          {activeSlice.detailedSections.map((sec, idx) => (
            <div key={idx} className="bg-stone-50 rounded-xl p-5 border border-stone-200 space-y-2.5">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                <span>{sec.heading}</span>
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed">
                <KatexText text={sec.content} />
              </p>

              {sec.quotes && (
                <blockquote className="border-l-2 border-indigo-400 pl-3 py-1 text-xs text-slate-600 italic">
                  {sec.quotes}
                </blockquote>
              )}

              {sec.bulletPoints && (
                <ul className="space-y-1 text-xs text-slate-600 pl-2">
                  {sec.bulletPoints.map((pt, i) => (
                    <li key={i} className="flex items-start space-x-1.5">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>
                        <KatexText text={pt} />
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {sec.warningNote && (
                <div className="mt-2 bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-800 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{sec.warningNote}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
