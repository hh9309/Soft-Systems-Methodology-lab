import React, { useState, useMemo } from 'react';
import {
  Swords,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Search,
  Filter,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Tag,
  Kanban,
  Check,
  Send,
} from 'lucide-react';
import { Stakeholder, ConflictPair, ConflictTask, ConflictTaskLog } from '../../types/ssm';

interface StakeholderConflictKanbanProps {
  stakeholders: Stakeholder[];
  conflictPairs: ConflictPair[];
  conflictTasks: ConflictTask[];
  onUpdateTasks: (tasks: ConflictTask[]) => void;
  // External trigger for converting a specific conflict
  convertingConflict?: ConflictPair | null;
  onCloseConvertModal?: () => void;
}

const COLUMNS: {
  id: ConflictTask['status'];
  label: string;
  enLabel: string;
  color: string;
  badgeBg: string;
  borderColor: string;
  headerBg: string;
}[] = [
  {
    id: 'backlog',
    label: '待介入排期',
    enLabel: 'Backlog',
    color: 'text-slate-700',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-300',
    borderColor: 'border-slate-200',
    headerBg: 'bg-slate-50',
  },
  {
    id: 'in_progress',
    label: '调解推进中',
    enLabel: 'In Progress',
    color: 'text-blue-700',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    borderColor: 'border-blue-200',
    headerBg: 'bg-blue-50/50',
  },
  {
    id: 'negotiating',
    label: '方案协商中',
    enLabel: 'Negotiating',
    color: 'text-amber-700',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    borderColor: 'border-amber-200',
    headerBg: 'bg-amber-50/50',
  },
  {
    id: 'resolved',
    label: '已化解共识',
    enLabel: 'Accommodated',
    color: 'text-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    borderColor: 'border-emerald-200',
    headerBg: 'bg-emerald-50/50',
  },
];

export const StakeholderConflictKanban: React.FC<StakeholderConflictKanbanProps> = ({
  stakeholders,
  conflictPairs,
  conflictTasks,
  onUpdateTasks,
  convertingConflict,
  onCloseConvertModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ConflictTask | null>(null);

  // New task form state
  const [formData, setFormData] = useState<{
    conflictId: string;
    title: string;
    description: string;
    assigneeName: string;
    assigneeRole: string;
    priority: ConflictTask['priority'];
    status: ConflictTask['status'];
    dueDate: string;
    resolutionStrategy: string;
    progressPercent: number;
    tags: string;
  }>({
    conflictId: '',
    title: '',
    description: '',
    assigneeName: '',
    assigneeRole: '',
    priority: '高',
    status: 'in_progress',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    resolutionStrategy: '',
    progressPercent: 30,
    tags: '跨部门协作, 观念调解',
  });

  // Log adding state
  const [newLogContent, setNewLogContent] = useState<string>('');
  const [newLogAuthor, setNewLogAuthor] = useState<string>('协调员');

  // Drag & drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // If external convertingConflict is provided, initialize modal
  const [internalConvertingConflict, setInternalConvertingConflict] = useState<ConflictPair | null>(null);

  const activeConvertConflict = convertingConflict || internalConvertingConflict;

  const handleOpenConvertModal = (cp: ConflictPair) => {
    const shA = stakeholders.find((s) => s.id === cp.sourceId);
    const shB = stakeholders.find((s) => s.id === cp.targetId);
    setInternalConvertingConflict(cp);

    const initialPriority: ConflictTask['priority'] =
      cp.intensity === '激烈' ? '紧急' : cp.intensity === '中度' ? '高' : '中';

    // pick default assignee from stakeholders (e.g. key player or first stakeholder)
    const suggestedAssignee =
      stakeholders.find((s) => s.power >= 7) || stakeholders[0];

    setFormData({
      conflictId: cp.id,
      title: `【调解】推进${shA?.name || '主体A'}与${shB?.name || '主体B'}的${cp.conflictType}协商`,
      description: `【双方诉求分歧】：\n${shA?.name || '一方'}：${cp.sourceDemand}\n${shB?.name || '对立方'}：${cp.targetDemand}`,
      assigneeName: suggestedAssignee?.name || '协调专班',
      assigneeRole: suggestedAssignee?.role || '跨部门仲裁责任人',
      priority: initialPriority,
      status: 'in_progress',
      dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
      resolutionStrategy: cp.resolutionStrategy,
      progressPercent: 20,
      tags: `${cp.conflictType}, 冲突化解`,
    });
  };

  const handleCloseConvert = () => {
    setInternalConvertingConflict(null);
    if (onCloseConvertModal) onCloseConvertModal();
  };

  // Convert submission
  const handleSaveConvertedTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    let sourceName = '';
    let targetName = '';
    if (activeConvertConflict) {
      const shA = stakeholders.find((s) => s.id === activeConvertConflict.sourceId);
      const shB = stakeholders.find((s) => s.id === activeConvertConflict.targetId);
      sourceName = shA?.name || '主体A';
      targetName = shB?.name || '主体B';
    }

    const newTask: ConflictTask = {
      id: `task-${Date.now()}`,
      conflictId: activeConvertConflict?.id,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assigneeName: formData.assigneeName.trim() || '协调专班',
      assigneeRole: formData.assigneeRole.trim() || '组织调解责任人',
      sourceSubject: sourceName,
      targetSubject: targetName,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      resolutionStrategy: formData.resolutionStrategy.trim(),
      progressPercent: formData.progressPercent,
      tags: formData.tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          content: '从博弈冲突对阵表一键初始化为组织协调待办，确立跟进专班。',
          author: '系统自动初始化',
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateTasks([newTask, ...conflictTasks]);
    handleCloseConvert();
  };

  // Create standalone or manual task
  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const matchedConflict = conflictPairs.find((c) => c.id === formData.conflictId);
    let sSub = '';
    let tSub = '';
    if (matchedConflict) {
      sSub = stakeholders.find((s) => s.id === matchedConflict.sourceId)?.name || '';
      tSub = stakeholders.find((s) => s.id === matchedConflict.targetId)?.name || '';
    }

    const newTask: ConflictTask = {
      id: `task-${Date.now()}`,
      conflictId: formData.conflictId || undefined,
      title: formData.title.trim(),
      description: formData.description.trim(),
      assigneeName: formData.assigneeName.trim() || '协调专班',
      assigneeRole: formData.assigneeRole.trim() || '组织责任人',
      sourceSubject: sSub,
      targetSubject: tSub,
      priority: formData.priority,
      status: formData.status,
      dueDate: formData.dueDate,
      resolutionStrategy: formData.resolutionStrategy.trim(),
      progressPercent: formData.progressPercent,
      tags: formData.tags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean),
      logs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          content: '创建新协作任务并分配责任人。',
          author: formData.assigneeName || '经办人',
        },
      ],
      createdAt: new Date().toISOString().split('T')[0],
    };

    onUpdateTasks([newTask, ...conflictTasks]);
    setShowAddModal(false);
  };

  // Edit task save
  const handleSaveEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTask) return;

    const updated = conflictTasks.map((t) => {
      if (t.id === editingTask.id) {
        return {
          ...editingTask,
          tags:
            typeof editingTask.tags === 'string'
              ? (editingTask.tags as string).split(/[,，]/).map((s: string) => s.trim()).filter(Boolean)
              : editingTask.tags,
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setEditingTask(null);
  };

  // Delete task
  const handleDeleteTask = (id: string) => {
    onUpdateTasks(conflictTasks.filter((t) => t.id !== id));
  };

  // Move task status
  const handleMoveStatus = (taskId: string, direction: 'prev' | 'next') => {
    const statusOrder: ConflictTask['status'][] = ['backlog', 'in_progress', 'negotiating', 'resolved'];
    const updated = conflictTasks.map((t) => {
      if (t.id === taskId) {
        const currentIndex = statusOrder.indexOf(t.status);
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= 0 && newIndex < statusOrder.length) {
          const nextStatus = statusOrder[newIndex];
          const newProgress =
            nextStatus === 'resolved'
              ? 100
              : nextStatus === 'negotiating'
              ? Math.max(t.progressPercent, 70)
              : nextStatus === 'in_progress'
              ? Math.max(t.progressPercent, 40)
              : Math.min(t.progressPercent, 20);

          return {
            ...t,
            status: nextStatus,
            progressPercent: newProgress,
            logs: [
              ...(t.logs || []),
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toLocaleString('zh-CN', {
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                }),
                content: `任务状态变更为「${
                  COLUMNS.find((c) => c.id === nextStatus)?.label || nextStatus
                }」`,
                author: t.assigneeName || '协调员',
              },
            ],
          };
        }
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Change status directly
  const handleChangeStatusDirect = (taskId: string, newStatus: ConflictTask['status']) => {
    const updated = conflictTasks.map((t) => {
      if (t.id === taskId) {
        const newProgress =
          newStatus === 'resolved'
            ? 100
            : newStatus === 'negotiating'
            ? Math.max(t.progressPercent, 70)
            : newStatus === 'in_progress'
            ? Math.max(t.progressPercent, 40)
            : Math.min(t.progressPercent, 20);

        return {
          ...t,
          status: newStatus,
          progressPercent: newProgress,
          logs: [
            ...(t.logs || []),
            {
              id: `log-${Date.now()}`,
              timestamp: new Date().toLocaleString('zh-CN', {
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              }),
              content: `状态调整为「${
                COLUMNS.find((c) => c.id === newStatus)?.label || newStatus
              }」`,
              author: t.assigneeName || '经办人',
            },
          ],
        };
      }
      return t;
    });
    onUpdateTasks(updated);
  };

  // Add Log Note
  const handleAddLog = (taskId: string) => {
    if (!newLogContent.trim()) return;

    const updated = conflictTasks.map((t) => {
      if (t.id === taskId) {
        const newLog: ConflictTaskLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleString('zh-CN', {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          content: newLogContent.trim(),
          author: newLogAuthor.trim() || '协调员',
        };
        return {
          ...t,
          logs: [...(t.logs || []), newLog],
        };
      }
      return t;
    });

    onUpdateTasks(updated);
    setNewLogContent('');
  };

  // One-click convert all unmanaged conflicts
  const handleBatchConvertAllConflicts = () => {
    const existingConflictIds = new Set(
      conflictTasks.map((t) => t.conflictId).filter(Boolean)
    );
    const unmanaged = conflictPairs.filter((c) => !existingConflictIds.has(c.id));

    if (unmanaged.length === 0) {
      alert('所有已识别的博弈冲突对均已转化为待办事项！');
      return;
    }

    const newTasks: ConflictTask[] = unmanaged.map((cp, idx) => {
      const shA = stakeholders.find((s) => s.id === cp.sourceId);
      const shB = stakeholders.find((s) => s.id === cp.targetId);
      const suggestedAssignee =
        stakeholders.find((s) => s.power >= 7) || stakeholders[0];

      return {
        id: `task-batch-${Date.now()}-${idx}`,
        conflictId: cp.id,
        title: `【调解】推进${shA?.name || '主体A'}与${shB?.name || '主体B'}的${cp.conflictType}`,
        description: `【诉求分歧】：\n${shA?.name || '主体A'}：${cp.sourceDemand}\n${shB?.name || '主体B'}：${cp.targetDemand}`,
        assigneeName: suggestedAssignee?.name || '联合协调专班',
        assigneeRole: suggestedAssignee?.role || '责任主体',
        sourceSubject: shA?.name || '主体A',
        targetSubject: shB?.name || '主体B',
        priority: cp.intensity === '激烈' ? '紧急' : cp.intensity === '中度' ? '高' : '中',
        status: 'backlog',
        dueDate: new Date(Date.now() + (7 + idx * 3) * 86400000)
          .toISOString()
          .split('T')[0],
        resolutionStrategy: cp.resolutionStrategy,
        progressPercent: 10,
        tags: [cp.conflictType, '批量建单'],
        logs: [
          {
            id: `log-b-${Date.now()}-${idx}`,
            timestamp: new Date().toLocaleString('zh-CN', {
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            content: '从博弈冲突对阵表一键批量纳入协同跟踪看板。',
            author: '系统自动纳入',
          },
        ],
        createdAt: new Date().toISOString().split('T')[0],
      };
    });

    onUpdateTasks([...newTasks, ...conflictTasks]);
  };

  // Drag and Drop handlers
  const handleDragStart = (taskId: string) => {
    setDraggedTaskId(taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnColumn = (targetStatus: ConflictTask['status']) => {
    if (!draggedTaskId) return;
    handleChangeStatusDirect(draggedTaskId, targetStatus);
    setDraggedTaskId(null);
  };

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return conflictTasks.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchAssignee = t.assigneeName.toLowerCase().includes(q);
        const matchSubjects =
          (t.sourceSubject || '').toLowerCase().includes(q) ||
          (t.targetSubject || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAssignee && !matchSubjects) {
          return false;
        }
      }
      if (filterPriority !== 'all' && t.priority !== filterPriority) {
        return false;
      }
      if (filterAssignee !== 'all' && t.assigneeName !== filterAssignee) {
        return false;
      }
      return true;
    });
  }, [conflictTasks, searchQuery, filterPriority, filterAssignee]);

  // Statistics
  const stats = useMemo(() => {
    const total = conflictTasks.length;
    const backlog = conflictTasks.filter((t) => t.status === 'backlog').length;
    const inProgress = conflictTasks.filter((t) => t.status === 'in_progress').length;
    const negotiating = conflictTasks.filter((t) => t.status === 'negotiating').length;
    const resolved = conflictTasks.filter((t) => t.status === 'resolved').length;

    // Managed conflicts count
    const managedConflictIds = new Set(
      conflictTasks.map((t) => t.conflictId).filter(Boolean)
    );
    const managedRate =
      conflictPairs.length > 0
        ? Math.round((managedConflictIds.size / conflictPairs.length) * 100)
        : 100;

    return {
      total,
      backlog,
      inProgress,
      negotiating,
      resolved,
      managedConflictsCount: managedConflictIds.size,
      totalConflicts: conflictPairs.length,
      managedRate,
    };
  }, [conflictTasks, conflictPairs]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-5">
      {/* Kanban Header & Intro */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center space-x-1">
              <Kanban className="w-3 h-3 text-emerald-600 inline mr-1" />
              协同治理看板
            </span>
            <h3 className="text-base font-serif font-bold text-slate-800">
              利益博弈协作任务看板 (Conflict Action & Collaboration Board)
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            支持将已识别的深层博弈冲突直接转化为待办调解任务，落实责任分配、推进方案协商、追踪共识达成闭环。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleBatchConvertAllConflicts}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-xs"
            title="将对阵表中所有未纳管的博弈冲突一键批量建单"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>一键转化全部冲突</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                conflictId: '',
                title: '',
                description: '',
                assigneeName: stakeholders[0]?.name || '',
                assigneeRole: stakeholders[0]?.role || '',
                priority: '高',
                status: 'in_progress',
                dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
                resolutionStrategy: '',
                progressPercent: 30,
                tags: '协调机制, 利益再平衡',
              });
              setShowAddModal(true);
            }}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新建协作待办</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-500 font-medium">待办总数</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-slate-800">{stats.total}</span>
            <span className="text-[10px] text-slate-400">项协作</span>
          </div>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-slate-600 font-medium flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-500 inline mr-0.5" />
            待介入排期
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-slate-700">{stats.backlog}</span>
            <span className="text-[10px] text-slate-400">未开工</span>
          </div>
        </div>

        <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-blue-800 font-medium flex items-center space-x-1">
            <ArrowRight className="w-3 h-3 text-blue-600 inline mr-0.5" />
            调解推进中
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-blue-700">{stats.inProgress}</span>
            <span className="text-[10px] text-blue-500">对齐中</span>
          </div>
        </div>

        <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-amber-800 font-medium flex items-center space-x-1">
            <Swords className="w-3 h-3 text-amber-600 inline mr-0.5" />
            方案协商中
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-amber-700">{stats.negotiating}</span>
            <span className="text-[10px] text-amber-500">拉锯审查</span>
          </div>
        </div>

        <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-emerald-800 font-medium flex items-center space-x-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 inline mr-0.5" />
            已化解共识
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-emerald-700">{stats.resolved}</span>
            <span className="text-[10px] text-emerald-600">闭环</span>
          </div>
        </div>

        <div className="bg-indigo-50/60 border border-indigo-200 rounded-lg p-2.5 flex flex-col justify-between">
          <span className="text-[11px] text-indigo-800 font-medium">冲突纳管转化率</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-xl font-bold font-serif text-indigo-700">
              {stats.managedRate}%
            </span>
            <span className="text-[10px] text-indigo-600">
              {stats.managedConflictsCount}/{stats.totalConflicts}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索协作待办标题、责任人、博弈主体..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {/* Priority filter */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-400">优先级:</span>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs px-2 py-1 rounded-md border border-stone-300 bg-white text-slate-700"
            >
              <option value="all">全部优先级</option>
              <option value="紧急">紧急</option>
              <option value="高">高</option>
              <option value="中">中</option>
              <option value="低">低</option>
            </select>
          </div>

          {/* Assignee filter */}
          <div className="flex items-center space-x-1">
            <span className="text-[11px] text-slate-400">责任人:</span>
            <select
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              className="text-xs px-2 py-1 rounded-md border border-stone-300 bg-white text-slate-700 max-w-[140px] truncate"
            >
              <option value="all">全部责任人</option>
              {Array.from(new Set(conflictTasks.map((t) => t.assigneeName))).map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {(searchQuery || filterPriority !== 'all' || filterAssignee !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterPriority('all');
                setFilterAssignee('all');
              }}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 underline px-1"
            >
              重置
            </button>
          )}
        </div>
      </div>

      {/* 4-Column Drag-and-Drop Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
        {COLUMNS.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={handleDragOver}
              onDrop={() => handleDropOnColumn(col.id)}
              className={`flex flex-col bg-stone-50/80 rounded-xl border ${col.borderColor} min-h-[460px] max-h-[750px] overflow-hidden`}
            >
              {/* Column Header */}
              <div
                className={`p-3 border-b ${col.borderColor} ${col.headerBg} flex items-center justify-between`}
              >
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-bold ${col.color}`}>{col.label}</span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ({col.enLabel})
                  </span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${col.badgeBg}`}
                >
                  {colTasks.length}
                </span>
              </div>

              {/* Column Cards Container */}
              <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-slate-400 p-3 text-center">
                    <span className="text-xs">暂无待办事项</span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      可将任务拖拽至此或在上方转化
                    </span>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const isExpanded = expandedCardId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => handleDragStart(task.id)}
                        className={`bg-white rounded-lg border ${
                          draggedTaskId === task.id
                            ? 'opacity-40 border-indigo-400'
                            : 'border-stone-200 hover:border-indigo-300'
                        } p-3 shadow-2xs hover:shadow-xs transition-all space-y-2.5 cursor-grab active:cursor-grabbing group`}
                      >
                        {/* Top: Priority + Linked Conflict + Actions */}
                        <div className="flex items-start justify-between gap-1.5">
                          <div className="flex flex-wrap items-center gap-1">
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                                task.priority === '紧急'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : task.priority === '高'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : task.priority === '中'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                                  : 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {task.priority}
                            </span>

                            {task.sourceSubject && task.targetSubject && (
                              <span
                                className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded truncate max-w-[150px]"
                                title={`${task.sourceSubject} ⚔️ ${task.targetSubject}`}
                              >
                                ⚔️ {task.sourceSubject} vs {task.targetSubject}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                            <button
                              onClick={() => setEditingTask(task)}
                              className="text-slate-400 hover:text-indigo-600 p-0.5"
                              title="编辑待办"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              className="text-slate-400 hover:text-rose-600 p-0.5"
                              title="删除待办"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-xs font-bold text-slate-800 leading-snug">
                          {task.title}
                        </h4>

                        {/* Description excerpt */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Assignee & Due Date */}
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-stone-100 text-slate-600">
                          <div
                            className="flex items-center space-x-1 truncate max-w-[130px]"
                            title={`${task.assigneeName} (${task.assigneeRole || '负责人'})`}
                          >
                            <div className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[9px] flex items-center justify-center shrink-0">
                              {task.assigneeName.slice(0, 1)}
                            </div>
                            <span className="font-medium text-slate-700 truncate">
                              {task.assigneeName}
                            </span>
                          </div>

                          {task.dueDate && (
                            <div className="flex items-center space-x-0.5 text-slate-400 font-mono text-[10px]">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{task.dueDate}</span>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                            <span>达成进度</span>
                            <span className="font-semibold text-slate-700">
                              {task.progressPercent}%
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                task.status === 'resolved'
                                  ? 'bg-emerald-500'
                                  : task.progressPercent > 60
                                  ? 'bg-indigo-500'
                                  : 'bg-amber-500'
                              }`}
                              style={{ width: `${task.progressPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* Expand Details Trigger */}
                        <div className="pt-1 flex items-center justify-between">
                          <button
                            onClick={() => setExpandedCardId(isExpanded ? null : task.id)}
                            className="text-[10px] text-indigo-600 hover:text-indigo-800 flex items-center space-x-0.5 font-medium"
                          >
                            <span>
                              {isExpanded ? '收起方案与记录' : '查看方案与调解日志'}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>

                          {/* Quick status transition buttons */}
                          <div className="flex items-center space-x-1">
                            {col.id !== 'backlog' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, 'prev')}
                                className="p-1 rounded hover:bg-stone-100 text-slate-400 hover:text-slate-700"
                                title="回退阶段"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            )}
                            {col.id !== 'resolved' && (
                              <button
                                onClick={() => handleMoveStatus(task.id, 'next')}
                                className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium text-[10px] flex items-center space-x-0.5"
                                title="推进到下一阶段"
                              >
                                <span>推进</span>
                                <ArrowRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Accordion Expansion: Strategy & Logs */}
                        {isExpanded && (
                          <div className="pt-2 border-t border-stone-100 space-y-2.5 text-[11px] animate-fadeIn">
                            {/* Strategy */}
                            {task.resolutionStrategy && (
                              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-md p-2">
                                <span className="text-[10px] font-bold text-emerald-800 block mb-0.5">
                                  💡 破局协调策略:
                                </span>
                                <p className="text-emerald-900 leading-relaxed text-[10px]">
                                  {task.resolutionStrategy}
                                </p>
                              </div>
                            )}

                            {/* Tags */}
                            {task.tags && task.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tg, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[9px] bg-stone-100 text-slate-600 px-1.5 py-0.5 rounded"
                                  >
                                    #{tg}
                                  </span>
                                ))}
                              </div>
                            )}

                            {/* Logs list */}
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-semibold text-slate-500 block">
                                📝 协同跟进备忘 ({task.logs?.length || 0})
                              </span>
                              <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                {(task.logs || []).map((log) => (
                                  <div
                                    key={log.id}
                                    className="bg-stone-50 rounded p-1.5 border border-stone-200/70 text-[10px] space-y-0.5"
                                  >
                                    <div className="flex items-center justify-between text-slate-400">
                                      <span className="font-semibold text-slate-600">
                                        {log.author}
                                      </span>
                                      <span className="font-mono">{log.timestamp}</span>
                                    </div>
                                    <p className="text-slate-700 leading-tight">
                                      {log.content}
                                    </p>
                                  </div>
                                ))}
                              </div>

                              {/* Add note input */}
                              <div className="pt-1 flex items-center space-x-1">
                                <input
                                  type="text"
                                  placeholder="添加跟进纪要..."
                                  value={newLogContent}
                                  onChange={(e) => setNewLogContent(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleAddLog(task.id);
                                    }
                                  }}
                                  className="flex-1 text-[10px] px-2 py-1 rounded border border-stone-300"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleAddLog(task.id)}
                                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-medium"
                                >
                                  提交
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Convert Conflict to Task Modal */}
      {activeConvertConflict && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                  <Swords className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold font-serif text-slate-800">
                    将博弈冲突转化为协同调解待办
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    为识别出的深层世界观或资源死结指派负责人，纳入闭环追踪。
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseConvert}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConvertedTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  协作任务标题 *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    指定协调责任人 / 牵头主体 *
                  </label>
                  <select
                    value={formData.assigneeName}
                    onChange={(e) => {
                      const sel = stakeholders.find((s) => s.name === e.target.value);
                      setFormData({
                        ...formData,
                        assigneeName: e.target.value,
                        assigneeRole: sel?.role || '组织协调方',
                      });
                    }}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    {stakeholders.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                    <option value="跨部门联合专班">跨部门联合专班 (实体化)</option>
                    <option value="专家委员会与第三方监督组">专家委员会与第三方监督组</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    责任主体角色定位
                  </label>
                  <input
                    type="text"
                    value={formData.assigneeRole}
                    onChange={(e) => setFormData({ ...formData, assigneeRole: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                    placeholder="例如：改革牵头机构"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    优先级
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as ConflictTask['priority'],
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="紧急">紧急 (P0)</option>
                    <option value="高">高 (P1)</option>
                    <option value="中">中 (P2)</option>
                    <option value="低">低 (P3)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    初始看板状态
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ConflictTask['status'],
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="backlog">待介入排期</option>
                    <option value="in_progress">调解推进中</option>
                    <option value="negotiating">方案协商中</option>
                    <option value="resolved">已化解共识</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    计划完成日期
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  博弈诉求分歧背景说明
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  观念破局与调解对策 (Accommodation Strategy)
                </label>
                <textarea
                  rows={2}
                  value={formData.resolutionStrategy}
                  onChange={(e) =>
                    setFormData({ ...formData, resolutionStrategy: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  placeholder="如何通过机制创新、利益补偿或制度契约打破对立？"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  初始共识进度 ({formData.progressPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.progressPercent}
                  onChange={(e) =>
                    setFormData({ ...formData, progressPercent: parseInt(e.target.value) })
                  }
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseConvert}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-xs"
                >
                  确认生成协作待办
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold font-serif text-slate-800">
                新建利益博弈协同待办任务
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateManualTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  待办任务名称 *
                </label>
                <input
                  type="text"
                  required
                  placeholder="例如：就跨部门数据共享免责清单召开首次联席闭门会"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  关联已识别的博弈冲突对 (可选)
                </label>
                <select
                  value={formData.conflictId}
                  onChange={(e) => {
                    const cId = e.target.value;
                    const matched = conflictPairs.find((c) => c.id === cId);
                    if (matched) {
                      setFormData({
                        ...formData,
                        conflictId: cId,
                        resolutionStrategy: matched.resolutionStrategy,
                      });
                    } else {
                      setFormData({ ...formData, conflictId: cId });
                    }
                  }}
                  className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                >
                  <option value="">不关联特定冲突对（独立协调任务）</option>
                  {conflictPairs.map((cp) => {
                    const sA = stakeholders.find((s) => s.id === cp.sourceId);
                    const sB = stakeholders.find((s) => s.id === cp.targetId);
                    return (
                      <option key={cp.id} value={cp.id}>
                        {sA?.name} vs {sB?.name} ({cp.conflictType} · {cp.intensity})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    指定协调责任人 *
                  </label>
                  <select
                    value={formData.assigneeName}
                    onChange={(e) => {
                      const sel = stakeholders.find((s) => s.name === e.target.value);
                      setFormData({
                        ...formData,
                        assigneeName: e.target.value,
                        assigneeRole: sel?.role || '组织协调方',
                      });
                    }}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    {stakeholders.map((s) => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                    <option value="跨部门联合推进专班">跨部门联合推进专班</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    优先级
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as ConflictTask['priority'],
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="紧急">紧急</option>
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    状态列
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ConflictTask['status'],
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="backlog">待介入排期</option>
                    <option value="in_progress">调解推进中</option>
                    <option value="negotiating">方案协商中</option>
                    <option value="resolved">已化解共识</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    截止时间
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  任务背景与待办详情
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  placeholder="需要召开几次座谈？需要哪些制度文本支持？"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  观念协调策略与妥协方案
                </label>
                <textarea
                  rows={2}
                  value={formData.resolutionStrategy}
                  onChange={(e) =>
                    setFormData({ ...formData, resolutionStrategy: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                  placeholder="拟订的容错免责、权限划分或经济补偿方案"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-slate-800 hover:bg-slate-900 rounded-lg font-medium shadow-xs"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-2 border-b border-stone-100">
              <h3 className="text-sm font-bold font-serif text-slate-800">
                编辑协作待办事项
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditTask} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  待办任务标题 *
                </label>
                <input
                  type="text"
                  required
                  value={editingTask.title}
                  onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    协调责任人 *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingTask.assigneeName}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, assigneeName: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    优先级
                  </label>
                  <select
                    value={editingTask.priority}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        priority: e.target.value as ConflictTask['priority'],
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="紧急">紧急</option>
                    <option value="高">高</option>
                    <option value="中">中</option>
                    <option value="低">低</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    当前状态
                  </label>
                  <select
                    value={editingTask.status}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        status: e.target.value as ConflictTask['status'],
                        progressPercent:
                          e.target.value === 'resolved'
                            ? 100
                            : editingTask.progressPercent,
                      })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white"
                  >
                    <option value="backlog">待介入排期</option>
                    <option value="in_progress">调解推进中</option>
                    <option value="negotiating">方案协商中</option>
                    <option value="resolved">已化解共识</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">
                    截止日期
                  </label>
                  <input
                    type="date"
                    value={editingTask.dueDate || ''}
                    onChange={(e) =>
                      setEditingTask({ ...editingTask, dueDate: e.target.value })
                    }
                    className="w-full text-xs px-2.5 py-2 rounded-lg border border-stone-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  推进达成进度 ({editingTask.progressPercent}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={editingTask.progressPercent}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      progressPercent: parseInt(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  任务背景与分歧说明
                </label>
                <textarea
                  rows={2}
                  value={editingTask.description}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, description: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">
                  观念破局协调策略
                </label>
                <textarea
                  rows={2}
                  value={editingTask.resolutionStrategy || ''}
                  onChange={(e) =>
                    setEditingTask({ ...editingTask, resolutionStrategy: e.target.value })
                  }
                  className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg font-medium shadow-xs"
                >
                  保存更新
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
