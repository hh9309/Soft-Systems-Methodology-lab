import React, { useState, useMemo } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import { Stakeholder, ConflictPair, ConflictTask } from '../../types/ssm';
import { StakeholderD3Network } from './StakeholderD3Network';
import { StakeholderConflictKanban } from './StakeholderConflictKanban';
import {
  Users,
  Swords,
  Plus,
  Trash2,
  Edit2,
  Shield,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Network,
  Grid,
  Layers,
  Kanban,
} from 'lucide-react';

export const Module3Stakeholders: React.FC = () => {
  const { activeCase, updateActiveCase } = useSSMLab();
  const { stakeholders, conflictPairs } = activeCase;

  const [selectedShId, setSelectedShId] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'d3-network' | 'power-interest' | 'kanban' | 'both'>('d3-network');
  const [showAddShModal, setShowAddShModal] = useState<boolean>(false);
  const [showAddConflictModal, setShowAddConflictModal] = useState<boolean>(false);
  const [convertingConflict, setConvertingConflict] = useState<ConflictPair | null>(null);

  // Derived conflict tasks
  const currentConflictTasks: ConflictTask[] = useMemo(() => {
    if (activeCase.conflictTasks && activeCase.conflictTasks.length > 0) {
      return activeCase.conflictTasks;
    }
    return conflictPairs.map((cp, idx) => {
      const shA = stakeholders.find((s) => s.id === cp.sourceId);
      const shB = stakeholders.find((s) => s.id === cp.targetId);
      const primaryAssignee =
        stakeholders.find((s) => s.power >= 7) || stakeholders[0];

      return {
        id: `task-init-${activeCase.id}-${cp.id}`,
        conflictId: cp.id,
        title: `【调解】推进${shA?.name || '主体A'}与${shB?.name || '主体B'}的${cp.conflictType}协商`,
        description: `【诉求分歧协调】：\n${shA?.name || '一方'}诉求：${cp.sourceDemand}\n${shB?.name || '对立方'}诉求：${cp.targetDemand}`,
        assigneeName: primaryAssignee?.name || '联合协调专班',
        assigneeRole: primaryAssignee?.role || '组织协调责任人',
        sourceSubject: shA?.name || '主体A',
        targetSubject: shB?.name || '主体B',
        priority: cp.intensity === '激烈' ? '紧急' : cp.intensity === '中度' ? '高' : '中',
        status: idx === 0 ? 'in_progress' : idx === 1 ? 'negotiating' : 'backlog',
        dueDate: new Date(Date.now() + (7 + idx * 5) * 86400000).toISOString().split('T')[0],
        resolutionStrategy: cp.resolutionStrategy,
        progressPercent: idx === 0 ? 45 : idx === 1 ? 70 : 15,
        tags: [cp.conflictType, '制度协调'],
        logs: [
          {
            id: `log-init-${idx}-1`,
            timestamp: new Date().toLocaleDateString('zh-CN'),
            content: '识别出该项深层利益博弈冲突，已设立协调专班并启动前期事实求证。',
            author: '专班秘书处',
          },
        ],
        createdAt: new Date().toISOString().split('T')[0],
      };
    });
  }, [activeCase.conflictTasks, activeCase.id, conflictPairs, stakeholders]);

  const handleUpdateTasks = (tasks: ConflictTask[]) => {
    updateActiveCase((prev) => ({
      ...prev,
      conflictTasks: tasks,
    }));
  };

  // New Stakeholder State
  const [newShName, setNewShName] = useState('');
  const [newShRole, setNewShRole] = useState('');
  const [newShPower, setNewShPower] = useState(5);
  const [newShInterest, setNewShInterest] = useState(5);
  const [newShWorldview, setNewShWorldview] = useState('');
  const [newShDemands, setNewShDemands] = useState('');

  // New Conflict Pair State
  const [newSourceId, setNewSourceId] = useState('');
  const [newTargetId, setNewTargetId] = useState('');
  const [newSourceDemand, setNewSourceDemand] = useState('');
  const [newTargetDemand, setNewTargetDemand] = useState('');
  const [newConflictType, setNewConflictType] = useState<ConflictPair['conflictType']>('价值世界观对立');
  const [newIntensity, setNewIntensity] = useState<ConflictPair['intensity']>('中度');
  const [newStrategy, setNewStrategy] = useState('');

  const handleAddStakeholder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShName) return;
    const newSh: Stakeholder = {
      id: `sh-${Date.now()}`,
      name: newShName,
      role: newShRole || '参与方',
      power: newShPower,
      interest: newShInterest,
      worldview: newShWorldview || '秉持自身利益最大化与风险最小化假设。',
      coreDemands: newShDemands.split(/[,，\n]/).filter(Boolean),
      color: '#6366F1',
    };

    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.stakeholders.push(newSh);
      // also add to algebra vectors
      cloned.algebraModel.stakeholderVectors.push({
        stakeholderId: newSh.id,
        name: newSh.name,
        weights: [5, 5, 5, 5],
      });
      return cloned;
    });

    setNewShName('');
    setNewShRole('');
    setNewShWorldview('');
    setNewShDemands('');
    setShowAddShModal(false);
  };

  const handleAddConflict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceId || !newTargetId) return;

    const newCp: ConflictPair = {
      id: `cp-${Date.now()}`,
      sourceId: newSourceId,
      targetId: newTargetId,
      sourceDemand: newSourceDemand,
      targetDemand: newTargetDemand,
      conflictType: newConflictType,
      intensity: newIntensity,
      resolutionStrategy: newStrategy,
    };

    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.conflictPairs.push(newCp);
      return cloned;
    });

    setShowAddConflictModal(false);
  };

  const handleDeleteStakeholder = (id: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.stakeholders = cloned.stakeholders.filter((s: any) => s.id !== id);
      cloned.conflictPairs = cloned.conflictPairs.filter(
        (c: any) => c.sourceId !== id && c.targetId !== id
      );
      cloned.algebraModel.stakeholderVectors = cloned.algebraModel.stakeholderVectors.filter(
        (v: any) => v.stakeholderId !== id
      );
      return cloned;
    });
  };

  const handleDeleteConflict = (id: string) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.conflictPairs = cloned.conflictPairs.filter((c: any) => c.id !== id);
      return cloned;
    });
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                利益博弈
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                利益相关者识别与目标冲突分析 (Stakeholder Conflict Dynamics)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              多方诉求提取、权力-利益九宫格矩阵交叉对比，识别深层世界观分歧与制度权力博弈点。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Toggle */}
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-100 p-0.5 text-xs">
              <button
                onClick={() => setActiveViewMode('d3-network')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeViewMode === 'd3-network'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>D3.js 动力网络</span>
              </button>
              <button
                onClick={() => setActiveViewMode('power-interest')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeViewMode === 'power-interest'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Grid className="w-3.5 h-3.5" />
                <span>四象限矩阵</span>
              </button>
              <button
                onClick={() => setActiveViewMode('kanban')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeViewMode === 'kanban'
                    ? 'bg-white text-emerald-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5 text-emerald-600" />
                <span>协作任务看板</span>
              </button>
              <button
                onClick={() => setActiveViewMode('both')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md transition-colors ${
                  activeViewMode === 'both'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>全景全显</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddShModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>新增主体</span>
            </button>
            <button
              onClick={() => setShowAddConflictModal(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <Swords className="w-3.5 h-3.5 text-rose-600" />
              <span>标记博弈冲突对</span>
            </button>
          </div>
        </div>
      </div>

      {/* D3.js Interactive Stakeholder Collaboration & Influence Network Panel */}
      {(activeViewMode === 'd3-network' || activeViewMode === 'both') && (
        <StakeholderD3Network
          stakeholders={stakeholders}
          conflictPairs={conflictPairs}
          selectedShId={selectedShId}
          onSelectStakeholder={(id) => setSelectedShId(id)}
        />
      )}

      {/* Grid: Left Power-Interest Matrix, Right Stakeholder Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 2x2 Power-Interest Grid Quadrant (Shown in power-interest or both mode) */}
        {(activeViewMode === 'power-interest' || activeViewMode === 'both') && (
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-800">
                权力-利益四象限博弈分布 (Power-Interest Grid)
              </h3>
              <span className="text-[11px] text-slate-400">点击主体高亮</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-4">
              纵轴代表政治或行政强制权力（1~10），横轴代表对变革诉求的关切度（1~10）。
            </p>
          </div>

          {/* Quadrant Visual Graph */}
          <div className="relative w-full aspect-square max-h-[380px] bg-stone-50 rounded-xl border border-stone-200 p-4 select-none">
            {/* Axis Labels */}
            <div className="absolute top-2 left-2 text-[10px] font-semibold text-slate-400">
              ↑ 权力 (Power)
            </div>
            <div className="absolute bottom-2 right-2 text-[10px] font-semibold text-slate-400">
              利益关切 (Interest) →
            </div>

            {/* Quadrant dividing cross lines */}
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-stone-300 border-dashed" />
            <div className="absolute left-0 right-0 top-1/2 h-px bg-stone-300 border-dashed" />

            {/* Quadrant Background Annotations */}
            <div className="absolute top-3 left-4 text-[10px] text-slate-400 font-medium">
              重点安抚 (Keep Satisfied)
            </div>
            <div className="absolute top-3 right-4 text-[10px] text-indigo-500 font-semibold">
              核心参与 (Key Players)
            </div>
            <div className="absolute bottom-4 left-4 text-[10px] text-slate-400">
              常态监督 (Minimal Effort)
            </div>
            <div className="absolute bottom-4 right-4 text-[10px] text-slate-500 font-medium">
              及时沟通 (Keep Informed)
            </div>

            {/* Stakeholder scatter dots */}
            {stakeholders.map((sh) => {
              // x % = interest * 9% + 5%
              const left = `${Math.min(92, Math.max(8, sh.interest * 9))}%`;
              const bottom = `${Math.min(92, Math.max(8, sh.power * 9))}%`;
              const isSelected = sh.id === selectedShId;

              return (
                <div
                  key={sh.id}
                  onClick={() => setSelectedShId(sh.id)}
                  style={{ left, bottom }}
                  className="absolute transform -translate-x-1/2 translate-y-1/2 cursor-pointer group"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md transition-transform group-hover:scale-125 ${
                      isSelected ? 'ring-3 ring-indigo-400 scale-110' : ''
                    }`}
                    style={{ backgroundColor: sh.color || '#3B82F6' }}
                  >
                    {sh.name.slice(0, 1)}
                  </div>
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg">
                    {sh.name} (权:{sh.power}, 益:{sh.interest})
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-stone-100 flex justify-between">
            <span>右上角：具有实质裁决权且高度敏感的核心方</span>
            <span>右下角：承受改革成本但缺乏权力的弱势基层</span>
          </div>
        </div>
        )}

        {/* Stakeholder Profile Cards */}
        <div className={`${activeViewMode === 'd3-network' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-3`}>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-800">
              主体世界观 (Weltanschauung) 与诉求清单
            </h3>
            <span className="text-xs text-slate-500">共 {stakeholders.length} 个核心主体</span>
          </div>

          <div className={`space-y-3 max-h-[500px] overflow-y-auto pr-1 ${activeViewMode === 'd3-network' ? 'grid grid-cols-1 md:grid-cols-2 gap-3 space-y-0' : ''}`}>
            {stakeholders.map((sh) => {
              const isSelected = sh.id === selectedShId;
              return (
                <div
                  key={sh.id}
                  onClick={() => setSelectedShId(sh.id)}
                  className={`bg-white rounded-xl border p-4 transition-all cursor-pointer shadow-xs ${
                    isSelected
                      ? 'border-indigo-500 ring-1 ring-indigo-300 bg-indigo-50/20'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: sh.color || '#3B82F6' }}
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                          <span>{sh.name}</span>
                          <span className="text-[11px] font-normal text-slate-500">
                            ({sh.role})
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 text-xs">
                      <span className="font-mono text-[11px] bg-stone-100 px-2 py-0.5 rounded text-slate-700">
                        权力: {sh.power} | 利益: {sh.interest}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteStakeholder(sh.id);
                        }}
                        className="text-slate-400 hover:text-rose-600"
                        title="删除主体"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Weltanschauung Box */}
                  <div className="mt-2.5 bg-stone-50 rounded-lg p-2.5 border border-stone-200">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block mb-0.5">
                      ★ 核心世界观 (Weltanschauung)
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      “{sh.worldview}”
                    </p>
                  </div>

                  {/* Demands & Agendas */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-400">公开诉求:</span>
                    {sh.coreDemands.map((demand, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] bg-white text-slate-700 border border-stone-200 px-2 py-0.5 rounded-full"
                      >
                        {demand}
                      </span>
                    ))}
                    {sh.hiddenAgendas && (
                      <span className="text-[11px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                        隐性防御: {sh.hiddenAgendas}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Conflict Pairs Matrix & Mediation Strategies */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Swords className="w-4 h-4 text-rose-600" />
            <h3 className="text-sm font-semibold text-slate-800">
              利益冲突对阵表与观念协调对策 (Conflict Pairs & Accommodation)
            </h3>
          </div>
          <span className="text-xs text-slate-400">已识别 {conflictPairs.length} 处深层博弈死结</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {conflictPairs.map((cp) => {
            const shA = stakeholders.find((s) => s.id === cp.sourceId);
            const shB = stakeholders.find((s) => s.id === cp.targetId);

            return (
              <div
                key={cp.id}
                className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-800">
                      {shA?.name || '主体A'}
                    </span>
                    <span className="text-xs font-mono text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      VS ⚔️
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {shB?.name || '主体B'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                        cp.intensity === '激烈'
                          ? 'bg-rose-100 text-rose-700 border-rose-200'
                          : cp.intensity === '中度'
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {cp.intensity} · {cp.conflictType}
                    </span>
                    <button
                      onClick={() => handleDeleteConflict(cp.id)}
                      className="text-slate-400 hover:text-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-stone-200">
                  <div>
                    <span className="text-slate-400 block mb-0.5">{shA?.name || '一方'}诉求:</span>
                    <span className="text-slate-700 font-medium">{cp.sourceDemand}</span>
                  </div>
                  <div className="border-l border-stone-100 pl-2">
                    <span className="text-slate-400 block mb-0.5">{shB?.name || '对立方'}诉求:</span>
                    <span className="text-slate-700 font-medium">{cp.targetDemand}</span>
                  </div>
                </div>

                {/* Resolution Strategy */}
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-2.5">
                  <span className="text-[10px] font-bold text-emerald-800 flex items-center space-x-1 mb-1">
                    <Lightbulb className="w-3 h-3 text-emerald-600" />
                    <span>观念协调破局突破口 (Accommodation Strategy)</span>
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {cp.resolutionStrategy}
                  </p>
                </div>

                {/* Convert to Action Item Bar */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-200/70">
                  {(() => {
                    const linkedTasks = currentConflictTasks.filter(
                      (t) => t.conflictId === cp.id
                    );
                    if (linkedTasks.length > 0) {
                      return (
                        <span className="inline-flex items-center space-x-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>已纳入协作待办 ({linkedTasks.length} 项)</span>
                        </span>
                      );
                    }
                    return (
                      <span className="text-[11px] text-slate-400">尚未转入行动待办</span>
                    );
                  })()}

                  <button
                    onClick={() => setConvertingConflict(cp)}
                    className="inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                    title="将该博弈冲突直接转换为待办事项并指定责任人"
                  >
                    <Kanban className="w-3.5 h-3.5 text-indigo-600" />
                    <span>⚡ 转化为协作任务</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Collaborative Task Kanban Board */}
      <StakeholderConflictKanban
        stakeholders={stakeholders}
        conflictPairs={conflictPairs}
        conflictTasks={currentConflictTasks}
        onUpdateTasks={handleUpdateTasks}
        convertingConflict={convertingConflict}
        onCloseConvertModal={() => setConvertingConflict(null)}
      />

      {/* Add Stakeholder Modal */}
      {showAddShModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-serif">
              新增利益相关者角色
            </h3>
            <form onSubmit={handleAddStakeholder} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  主体名称 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：市卫健委基层医疗处"
                  value={newShName}
                  onChange={(e) => setNewShName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  组织角色与定位
                </label>
                <input
                  type="text"
                  placeholder="例如：政策监管与审批兜底方"
                  value={newShRole}
                  onChange={(e) => setNewShRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    行政/制度权力 ({newShPower}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newShPower}
                    onChange={(e) => setNewShPower(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    利益关切度 ({newShInterest}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={newShInterest}
                    onChange={(e) => setNewShInterest(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  世界观 (Weltanschauung 核心深层假设)
                </label>
                <textarea
                  rows={2}
                  placeholder="他们坚信什么？为何持有该立场？"
                  value={newShWorldview}
                  onChange={(e) => setNewShWorldview(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  核心利益诉求 (逗号分隔)
                </label>
                <input
                  type="text"
                  placeholder="诉求1, 诉求2, 诉求3"
                  value={newShDemands}
                  onChange={(e) => setNewShDemands(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddShModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-xs"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Conflict Modal */}
      {showAddConflictModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-800 font-serif">
              新增对立博弈冲突对
            </h3>
            <form onSubmit={handleAddConflict} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    博弈方 A *
                  </label>
                  <select
                    required
                    value={newSourceId}
                    onChange={(e) => setNewSourceId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  >
                    <option value="">选择主体...</option>
                    {stakeholders.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">
                    对立方 B *
                  </label>
                  <select
                    required
                    value={newTargetId}
                    onChange={(e) => setNewTargetId(e.target.value)}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  >
                    <option value="">选择对立方...</option>
                    {stakeholders.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  冲突类型与激烈程度
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={newConflictType}
                    onChange={(e) => setNewConflictType(e.target.value as any)}
                    className="text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  >
                    <option value="价值世界观对立">价值世界观对立</option>
                    <option value="权力边界模糊">权力边界模糊</option>
                    <option value="资源争夺">资源争夺</option>
                    <option value="绩效考核冲突">绩效考核冲突</option>
                    <option value="信息孤岛">信息孤岛</option>
                  </select>

                  <select
                    value={newIntensity}
                    onChange={(e) => setNewIntensity(e.target.value as any)}
                    className="text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  >
                    <option value="轻微">轻微</option>
                    <option value="中度">中度</option>
                    <option value="激烈">激烈</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  方 A 诉求
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：要求所有数据必须强制上云"
                  value={newSourceDemand}
                  onChange={(e) => setNewSourceDemand(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  方 B 诉求
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：坚持涉密合规与责任自负，拒绝上云"
                  value={newTargetDemand}
                  onChange={(e) => setNewTargetDemand(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  建议协调对策 (Accommodation Strategy)
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="如何通过机制创新达成各方都能接受的务实妥协？"
                  value={newStrategy}
                  onChange={(e) => setNewStrategy(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddConflictModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg font-medium shadow-xs"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
