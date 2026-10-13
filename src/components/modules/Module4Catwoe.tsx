import React, { useState } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import {
  Target,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';
import { KatexFormula } from '../common/KatexFormula';

export const Module4Catwoe: React.FC = () => {
  const { activeCase, updateActiveCase, setIsAiDrawerOpen } = useSSMLab();
  const { catwoe } = activeCase;

  const [activeElement, setActiveElement] = useState<'C' | 'A' | 'T' | 'W' | 'O' | 'E'>('T');

  // P-Q-R decomposed inputs for Root Definition
  const [pVal, setPVal] = useState(
    '一个由相关责任主体协同参与的组织支持系统'
  );
  const [qVal, setQVal] = useState(
    '通过建立信任共济机制、规范标准清单与多方利益补偿'
  );
  const [rVal, setRVal] = useState(
    '在防范系统性风险的前提下消除壁垒，实现各方共赢发展'
  );

  const handleUpdateCatwoeField = (field: keyof typeof catwoe, value: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.catwoe[field] = value;
      return cloned;
    });
  };

  const handleSynthesizeRootDef = () => {
    const fullDef = `${pVal}（P），${qVal}（Q），以达成${rVal}（R）。`;
    handleUpdateCatwoeField('rootDefinition', fullDef);
  };

  const elementsMeta = [
    {
      key: 'C',
      letter: 'C',
      name: 'Customers (顾客)',
      subtitle: '谁是转化的受益者或受害者？',
      color: 'border-amber-400 bg-amber-50/50 text-amber-800',
      badge: 'bg-amber-100 text-amber-800',
      desc: '系统活动的承受对象，既包括直接受益方，也必须包含因系统运转而承受代价的隐性受害者。',
    },
    {
      key: 'A',
      letter: 'A',
      name: 'Actors (行动者)',
      subtitle: '谁负责执行具体的转化活动？',
      color: 'border-emerald-400 bg-emerald-50/50 text-emerald-800',
      badge: 'bg-emerald-100 text-emerald-800',
      desc: '执行人类活动系统内各具体任务的当事人，他们决定了系统运行的微观质量。',
    },
    {
      key: 'T',
      letter: 'T',
      name: 'Transformation (转化过程)',
      subtitle: '核心输入如何转变为输出？(I → O)',
      color: 'border-indigo-400 bg-indigo-50/50 text-indigo-800',
      badge: 'bg-indigo-100 text-indigo-800',
      desc: '系统的核心引擎。必须保持“输入状态”与“输出状态”的逻辑同质性（如未协调信息 → 已协调信息）。',
    },
    {
      key: 'W',
      letter: 'W',
      name: 'Weltanschauung (世界观)',
      subtitle: '赋予该转化过程意义的深层信仰或视角',
      color: 'border-purple-400 bg-purple-50/50 text-purple-800',
      badge: 'bg-purple-100 text-purple-800',
      desc: 'SSM的灵魂！不同的世界观将推导出完全不同的CATWOE。没有 W，系统转化将失去存在的合法性。',
    },
    {
      key: 'O',
      letter: 'O',
      name: 'Owners (所有者)',
      subtitle: '谁有权终止、推翻或重建此系统？',
      color: 'border-blue-400 bg-blue-50/50 text-blue-800',
      badge: 'bg-blue-100 text-blue-800',
      desc: '系统终极法定裁判权拥有者，具备一票否决权或重大资源再分配支配权。',
    },
    {
      key: 'E',
      letter: 'E',
      name: 'Environment (环境约束)',
      subtitle: '外部世界有哪些不可逾越的刚性边界？',
      color: 'border-rose-400 bg-rose-50/50 text-rose-800',
      badge: 'bg-rose-100 text-rose-800',
      desc: '系统无法改变但必须服从的外在边界，包括刚性法律、物理现实、财政天花板及宏观政策。',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                CATWOE
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                CATWOE 核心要素深度剖析与根定义 (Root Definition)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Checkland 第 3 阶段核心：严密解构 C-A-T-W-O-E 六要素、P-Q-R 根定义生成器及 3E (效果/效率/效益) 评价准则。
            </p>
          </div>

          <button
            onClick={() => setIsAiDrawerOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI 逻辑断层排查</span>
          </button>
        </div>
      </div>

      {/* 6 Elements Interactive Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {elementsMeta.map((item) => {
          const isActive = activeElement === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setActiveElement(item.key as any)}
              className={`p-3.5 rounded-xl border text-left transition-all relative ${
                isActive
                  ? `${item.color} shadow-xs ring-2 ring-indigo-400 font-semibold`
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs ${item.badge}`}>
                  {item.letter}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Checkland</span>
              </div>
              <div className="text-xs font-bold text-slate-800 truncate">{item.name}</div>
              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                {item.subtitle}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Element Deep Edit & Input/Output Box */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white font-mono font-bold text-sm flex items-center justify-center">
              {activeElement}
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {elementsMeta.find((e) => e.key === activeElement)?.name}
              </h3>
              <p className="text-xs text-slate-500">
                {elementsMeta.find((e) => e.key === activeElement)?.desc}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            CATWOE 规范格式
          </span>
        </div>

        {/* Text Area for currently active element */}
        <div>
          <label className="text-xs font-medium text-slate-700 block mb-1.5">
            要素内容描述 (可直接在下方编辑优化)
          </label>
          <textarea
            rows={3}
            value={(catwoe as any)[activeElement] || ''}
            onChange={(e) =>
              handleUpdateCatwoeField(activeElement as any, e.target.value)
            }
            className="w-full text-xs p-3 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 font-sans leading-relaxed"
          />
        </div>

        {/* If T is active, show Input-State -> Output-State Homogeneity Checker */}
        {activeElement === 'T' && (
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-800">
              <ArrowRight className="w-4 h-4 text-indigo-600" />
              <span>转化过程状态解构 (输入同质性校验：输入态 I 与输出态 O 必须属同类范畴)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1">
                  输入状态 (Input State I)
                </span>
                <input
                  type="text"
                  value={catwoe.inputState || ''}
                  onChange={(e) => handleUpdateCatwoeField('inputState', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1">
                  输出状态 (Output State O)
                </span>
                <input
                  type="text"
                  value={catwoe.outputState || ''}
                  onChange={(e) => handleUpdateCatwoeField('outputState', e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-300"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Root Definition (P-Q-R) Interactive Constructor */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Award className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <span>根定义 (Root Definition) P-Q-R 准则生成器</span>
              <KatexFormula math="P \xrightarrow{Q} R" />
            </h3>
          </div>
          <button
            onClick={handleSynthesizeRootDef}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 font-medium"
          >
            <span>一键生成根定义</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-xs font-mono font-bold text-indigo-700 block mb-1">
              [P] 做什么 (What: 该系统核心做什么)
            </span>
            <textarea
              rows={2}
              value={pVal}
              onChange={(e) => setPVal(e.target.value)}
              className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
            />
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-xs font-mono font-bold text-emerald-700 block mb-1">
              [Q] 怎么做 (How: 经由何种机制与手段)
            </span>
            <textarea
              rows={2}
              value={qVal}
              onChange={(e) => setQVal(e.target.value)}
              className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
            />
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-xs font-mono font-bold text-purple-700 block mb-1">
              [R] 为何做 (Why: 达成何种长期意图)
            </span>
            <textarea
              rows={2}
              value={rVal}
              onChange={(e) => setRVal(e.target.value)}
              className="w-full text-xs p-2 rounded border border-stone-300 bg-white"
            />
          </div>
        </div>

        {/* Current Synthesized Root Definition */}
        <div className="bg-slate-900 text-stone-100 rounded-xl p-4 space-y-2">
          <span className="text-[10px] font-mono text-indigo-300 uppercase tracking-widest block">
            FORMAL ROOT DEFINITION (正式根定义)
          </span>
          <textarea
            rows={2}
            value={catwoe.rootDefinition}
            onChange={(e) => handleUpdateCatwoeField('rootDefinition', e.target.value)}
            className="w-full text-xs bg-slate-800 text-slate-100 p-2.5 rounded-lg border border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-400 font-serif leading-relaxed"
          />
        </div>
      </div>

      {/* 3E Evaluation System */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              切克兰德 3E 评价准则体系 (3E Criteria for Transformation)
            </h3>
          </div>
          <span className="text-xs text-slate-400">衡量转化过程 T 是否真实成功的衡量标尺</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800">
                E1 · 效果性 (Efficacy)
              </span>
              <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-medium">
                Does it work?
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              手段 Q 是否真的把输入转化为预期的输出？核心操作指标。
            </p>
            <textarea
              rows={2}
              value={catwoe.efficacy}
              onChange={(e) => handleUpdateCatwoeField('efficacy', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800">
                E2 · 效率性 (Efficiency)
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-medium">
                Resources used?
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              投入的时间、行政成本、资金是否达到最集约？
            </p>
            <textarea
              rows={2}
              value={catwoe.efficiency}
              onChange={(e) => handleUpdateCatwoeField('efficiency', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
            />
          </div>

          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-800">
                E3 · 效益性 (Effectiveness)
              </span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-medium">
                Meets long-term W?
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              该输出是否真正达成长远意图 R 与满足了世界观 W？
            </p>
            <textarea
              rows={2}
              value={catwoe.effectiveness}
              onChange={(e) => handleUpdateCatwoeField('effectiveness', e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
