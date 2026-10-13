import React from 'react';
import { useSSMLab } from '../context/SSMLabContext';
import {
  Binary,
  Palette,
  Users,
  Target,
  FolderGit2,
  Terminal,
  BotMessageSquare,
  Workflow,
  FileSpreadsheet,
  BookMarked,
} from 'lucide-react';

interface ModuleItem {
  id: number;
  label: string;
  shortDesc: string;
  icon: React.ElementType;
}

export const MODULE_LIST: ModuleItem[] = [
  { id: 1, label: '结构代数', shortDesc: '系统代数与不确定性映射', icon: Binary },
  { id: 2, label: '富图绘制', shortDesc: '丰富图景 Rich Picture 交互', icon: Palette },
  { id: 3, label: '利益冲突', shortDesc: '利益相关者与目标博弈矩阵', icon: Users },
  { id: 4, label: 'CATWOE分析', shortDesc: '根定义解构与3E准则检验', icon: Target },
  { id: 5, label: '六大案例', shortDesc: '公共治理/医疗/高校等典型库', icon: FolderGit2 },
  { id: 6, label: '代码引擎', shortDesc: 'Python / NetworkX 拓扑分析', icon: Terminal },
  { id: 7, label: 'AI对话窗口', shortDesc: '世界观/CATWOE逻辑智能随诊', icon: BotMessageSquare },
  { id: 8, label: '全流程导引', shortDesc: '7阶段学习循环与现实对比辩论', icon: Workflow },
  { id: 9, label: '报告导出', shortDesc: '完整辩论方案与多格式导出', icon: FileSpreadsheet },
  { id: 10, label: '知识导引', shortDesc: '四大核心切片与警示诊断', icon: BookMarked },
];

export const ModuleNav: React.FC = () => {
  const { activeTab, setActiveTab } = useSSMLab();

  return (
    <nav className="bg-stone-100/70 border-b border-stone-200/80 px-4 py-2 overflow-x-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 min-w-max">
        {MODULE_LIST.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium transition-all select-none ${
                isActive
                  ? 'bg-white text-slate-900 shadow-xs border border-stone-300 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-stone-200/60'
              }`}
            >
              <Icon
                className={`w-3.5 h-3.5 ${
                  isActive ? 'text-indigo-600' : 'text-slate-400'
                }`}
              />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
