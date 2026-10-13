import React from 'react';
import { useSSMLab } from '../context/SSMLabContext';
import { SSM_CASES } from '../data/cases';
import {
  Compass,
  RotateCcw,
  Sparkles,
  FileDown,
  BookOpen,
  Layers,
  HelpCircle,
  Share2,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeCase,
    setActiveCaseById,
    resetCaseToDefault,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    setActiveTab,
  } = useSSMLab();

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-stone-100 flex items-center justify-center shadow-sm">
              <Compass className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-slate-900 font-serif">
                  软系统方法实验室
                </h1>
                <span className="hidden md:inline-flex px-2 py-0.5 text-xs font-mono rounded bg-slate-100 text-slate-600 border border-slate-200">
                  SSM Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                问题情境 · 丰富图景 · CATWOE · 概念模型 · 观念协调
              </p>
            </div>
          </div>

          {/* Current Case Selector & Fast Tools */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Case Dropdown */}
            <div className="flex items-center space-x-1.5 bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 shadow-xs">
              <span className="text-xs text-slate-400 hidden lg:inline">当前案例:</span>
              <select
                aria-label="切换案例"
                value={activeCase.id}
                onChange={(e) => setActiveCaseById(e.target.value)}
                className="text-xs font-medium text-slate-700 bg-transparent focus:outline-hidden cursor-pointer max-w-[140px] sm:max-w-[200px] truncate"
              >
                {SSM_CASES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            <button
              onClick={resetCaseToDefault}
              title="重置当前案例数据"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-stone-100 rounded-lg transition-colors border border-transparent hover:border-stone-200"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Quick 7-Stage Flow */}
            <button
              onClick={() => setActiveTab(8)}
              className="hidden sm:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-slate-600" />
              <span>全流程导引</span>
            </button>

            {/* Export Report Tab */}
            <button
              onClick={() => setActiveTab(9)}
              className="hidden md:inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-stone-100 border border-stone-200 transition-colors"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" />
              <span>导出报告</span>
            </button>

            {/* AI Diagnosis Floating Trigger */}
            <button
              onClick={() => setIsAiDrawerOpen(!isAiDrawerOpen)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all shadow-xs ${
                isAiDrawerOpen
                  ? 'bg-indigo-600 text-white ring-2 ring-indigo-300'
                  : 'bg-slate-900 text-stone-100 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>AI随诊</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
