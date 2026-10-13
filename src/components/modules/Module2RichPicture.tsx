import React, { useState, useRef } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import { RichPictureNode, RichPictureEdge } from '../../types/ssm';
import {
  Palette,
  Plus,
  Trash2,
  Move,
  Link as LinkIcon,
  RotateCcw,
  Download,
  Info,
  Layers,
  Sparkles,
  Flame,
  MessageSquare,
  Building2,
  User,
  ShieldAlert,
} from 'lucide-react';

export const Module2RichPicture: React.FC = () => {
  const { activeCase, updateActiveCase } = useSSMLab();
  const { richPicture } = activeCase;

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState<boolean>(false);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Add new node
  const handleAddNode = (type: RichPictureNode['type']) => {
    const id = `node-${Date.now()}`;
    const colors: Record<RichPictureNode['type'], string> = {
      actor: '#10B981',
      org: '#3B82F6',
      bubble: '#64748B',
      conflict: '#EF4444',
      barrier: '#F43F5E',
      process: '#8B5CF6',
      structure: '#475569',
    };
    const defaultLabels: Record<RichPictureNode['type'], { label: string; sublabel: string }> = {
      actor: { label: '新利益方角色', sublabel: '一线行动者' },
      org: { label: '业务部门/外部机构', sublabel: '组织实体' },
      bubble: { label: '“核心顾虑与真实想法”', sublabel: '非正式心理诉求' },
      conflict: { label: '深层矛盾冲突点', sublabel: '权力或利益对立' },
      barrier: { label: '制度/文化壁垒', sublabel: '隐性阻力' },
      process: { label: '常态化交互流程', sublabel: '信息或物流' },
      structure: { label: '物理/技术基础设施', sublabel: '底层架构' },
    };

    const newNode: RichPictureNode = {
      id,
      type,
      label: defaultLabels[type].label,
      sublabel: defaultLabels[type].sublabel,
      x: 200 + Math.random() * 200,
      y: 150 + Math.random() * 150,
      color: colors[type],
    };

    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.richPicture.nodes.push(newNode);
      return cloned;
    });
    setSelectedNodeId(id);
  };

  // Node Dragging
  const handleMouseDown = (e: React.MouseEvent, node: RichPictureNode) => {
    if (isConnectMode) {
      if (!connectSourceId) {
        setConnectSourceId(node.id);
      } else if (connectSourceId !== node.id) {
        // Create Edge
        const newEdge: RichPictureEdge = {
          id: `edge-${Date.now()}`,
          from: connectSourceId,
          to: node.id,
          label: '张力关联',
          style: 'tension',
        };
        updateActiveCase((prev) => {
          const cloned = JSON.parse(JSON.stringify(prev));
          cloned.richPicture.edges.push(newEdge);
          return cloned;
        });
        setConnectSourceId(null);
        setIsConnectMode(false);
      }
      return;
    }

    setSelectedNodeId(node.id);
    setDraggingNodeId(node.id);

    const svgRect = svgRef.current?.getBoundingClientRect();
    if (svgRect) {
      setDragOffset({
        x: e.clientX - svgRect.left - node.x,
        y: e.clientY - svgRect.top - node.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingNodeId || !svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const newX = Math.max(30, Math.min(760, e.clientX - svgRect.left - dragOffset.x));
    const newY = Math.max(30, Math.min(480, e.clientY - svgRect.top - dragOffset.y));

    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const target = cloned.richPicture.nodes.find((n: any) => n.id === draggingNodeId);
      if (target) {
        target.x = newX;
        target.y = newY;
      }
      return cloned;
    });
  };

  const handleMouseUp = () => {
    setDraggingNodeId(null);
  };

  // Delete selected node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.richPicture.nodes = cloned.richPicture.nodes.filter(
        (n: any) => n.id !== selectedNodeId
      );
      cloned.richPicture.edges = cloned.richPicture.edges.filter(
        (e: any) => e.from !== selectedNodeId && e.to !== selectedNodeId
      );
      return cloned;
    });
    setSelectedNodeId(null);
  };

  // Export SVG
  const handleExportSvg = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rich-picture-${activeCase.id}.svg`;
    a.click();
  };

  const selectedNode = richPicture.nodes.find((n) => n.id === selectedNodeId);

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                丰富图景
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                丰富图景 (Rich Picture) 交互绘制
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Checkland 第 2 阶段核心工具：拒绝僵硬流程图，用人际、符号、思想泡泡与冲突交锋捕捉“活的社会情境”。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsConnectMode(!isConnectMode)}
              className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors border shadow-xs ${
                isConnectMode
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-700 border-stone-200 hover:bg-stone-50'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>{isConnectMode ? '连线中(点击两节点)' : '添加关系连线'}</span>
            </button>

            <button
              onClick={handleExportSvg}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 SVG 矢量图</span>
            </button>
          </div>
        </div>

        {/* Quick Node Creator Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100">
          <span className="text-xs font-medium text-slate-500 mr-1">添加图元:</span>
          <button
            onClick={() => handleAddNode('actor')}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
          >
            <User className="w-3 h-3" />
            <span>+ 参与人 (Actor)</span>
          </button>
          <button
            onClick={() => handleAddNode('org')}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
          >
            <Building2 className="w-3 h-3" />
            <span>+ 机构/组织 (Org)</span>
          </button>
          <button
            onClick={() => handleAddNode('bubble')}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300"
          >
            <MessageSquare className="w-3 h-3" />
            <span>+ 思想泡泡 (Thought)</span>
          </button>
          <button
            onClick={() => handleAddNode('conflict')}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
          >
            <Flame className="w-3 h-3" />
            <span>+ 冲突焦点 (⚔️ Tension)</span>
          </button>
          <button
            onClick={() => handleAddNode('barrier')}
            className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200"
          >
            <ShieldAlert className="w-3 h-3" />
            <span>+ 制度壁垒 (Barrier)</span>
          </button>
        </div>
      </div>

      {/* Main Canvas & Inspector Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: SVG Canvas */}
        <div className="lg:col-span-8 bg-stone-100/60 rounded-xl border border-stone-300/80 p-2 shadow-inner relative overflow-hidden">
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded text-[11px] text-slate-500 border border-stone-200 flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>画板可自由拖拽节点 · 节点数: {richPicture.nodes.length} · 关系数: {richPicture.edges.length}</span>
          </div>

          <svg
            ref={svgRef}
            viewBox="0 0 800 520"
            className="w-full h-[520px] bg-stone-50 rounded-lg cursor-grab active:cursor-grabbing select-none"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <defs>
              {/* Markers for arrows */}
              <marker
                id="arrow-flow"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
              </marker>
              <marker
                id="arrow-conflict"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EF4444" />
              </marker>
              <marker
                id="arrow-tension"
                viewBox="0 0 10 10"
                refX="22"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#EA580C" />
              </marker>

              {/* Grid pattern */}
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#E2E8F0" strokeWidth="0.6" />
              </pattern>
            </defs>

            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {richPicture.edges.map((edge) => {
              const fromNode = richPicture.nodes.find((n) => n.id === edge.from);
              const toNode = richPicture.nodes.find((n) => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const isConflict = edge.style === 'conflict';
              const isTension = edge.style === 'tension';
              const strokeColor = isConflict ? '#EF4444' : isTension ? '#EA580C' : '#3B82F6';
              const strokeDash = isConflict || isTension ? '5,4' : 'none';
              const markerEnd = isConflict
                ? 'url(#arrow-conflict)'
                : isTension
                ? 'url(#arrow-tension)'
                : 'url(#arrow-flow)';

              const midX = (fromNode.x + toNode.x) / 2;
              const midY = (fromNode.y + toNode.y) / 2;

              return (
                <g key={edge.id} className="group cursor-pointer">
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={strokeColor}
                    strokeWidth={isConflict ? 2.5 : 1.8}
                    strokeDasharray={strokeDash}
                    markerEnd={markerEnd}
                  />
                  {edge.label && (
                    <g transform={`translate(${midX}, ${midY})`}>
                      <rect
                        x="-40"
                        y="-10"
                        width="80"
                        height="18"
                        rx="3"
                        fill="#FFFFFF"
                        stroke={strokeColor}
                        strokeWidth="0.8"
                        className="opacity-90"
                      />
                      <text
                        x="0"
                        y="3"
                        textAnchor="middle"
                        fontSize="9"
                        fill={strokeColor}
                        fontWeight="bold"
                      >
                        {edge.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {richPicture.nodes.map((node) => {
              const isSelected = node.id === selectedNodeId;
              const isConnectSource = node.id === connectSourceId;

              // Node shapes based on type
              if (node.type === 'bubble') {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleMouseDown(e, node)}
                    className="cursor-pointer"
                  >
                    <path
                      d="M -75 -24 Q -75 -35 -60 -35 L 60 -35 Q 75 -35 75 -24 L 75 14 Q 75 25 60 25 L 10 25 L 0 38 L 0 25 L -60 25 Q -75 25 -75 14 Z"
                      fill="#FFFFFF"
                      stroke={isSelected ? '#6366F1' : isConnectSource ? '#EF4444' : '#94A3B8'}
                      strokeWidth={isSelected || isConnectSource ? 2.5 : 1.2}
                      strokeDasharray="4,2"
                      filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                    />
                    <text
                      textAnchor="middle"
                      y="-8"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#334155"
                    >
                      {node.label}
                    </text>
                    <text textAnchor="middle" y="8" fontSize="8" fill="#64748B">
                      {node.sublabel || '心智诉求'}
                    </text>
                  </g>
                );
              }

              if (node.type === 'conflict') {
                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleMouseDown(e, node)}
                    className="cursor-pointer"
                  >
                    {/* Star / Tension Polygon */}
                    <polygon
                      points="0,-28 8,-9 28,-9 12,3 18,22 0,11 -18,22 -12,3 -28,-9 -8,-9"
                      fill="#FEE2E2"
                      stroke={isSelected ? '#4F46E5' : '#EF4444'}
                      strokeWidth={isSelected ? 3 : 2}
                      filter="drop-shadow(0 2px 5px rgba(239,68,68,0.25))"
                    />
                    <text
                      textAnchor="middle"
                      y="-2"
                      fontSize="10"
                      fontWeight="bold"
                      fill="#991B1B"
                    >
                      ⚔️ {node.label}
                    </text>
                    <text textAnchor="middle" y="10" fontSize="8" fill="#B91C1C">
                      {node.sublabel}
                    </text>
                  </g>
                );
              }

              // Default Box Node (actor, org, barrier, process)
              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onMouseDown={(e) => handleMouseDown(e, node)}
                  className="cursor-pointer"
                >
                  <rect
                    x="-65"
                    y="-25"
                    width="130"
                    height="50"
                    rx={node.type === 'actor' ? 25 : 8}
                    fill="#FFFFFF"
                    stroke={
                      isSelected
                        ? '#4F46E5'
                        : isConnectSource
                        ? '#EF4444'
                        : node.color || '#CBD5E1'
                    }
                    strokeWidth={isSelected || isConnectSource ? 2.5 : 1.5}
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.06))"
                  />
                  {/* Top indicator bar */}
                  <rect
                    x="-65"
                    y="-25"
                    width="130"
                    height="5"
                    rx="2"
                    fill={node.color || '#3B82F6'}
                  />
                  <text
                    textAnchor="middle"
                    y="-3"
                    fontSize="11"
                    fontWeight="bold"
                    fill="#1E293B"
                  >
                    {node.label}
                  </text>
                  <text textAnchor="middle" y="12" fontSize="9" fill="#64748B">
                    {node.sublabel || node.type}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right: Node Detail Inspector & Legend */}
        <div className="lg:col-span-4 space-y-4">
          {/* Node Inspector */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-stone-100">
              <h3 className="text-xs font-semibold text-slate-800">图元属性检视器</h3>
              {selectedNode && (
                <button
                  onClick={handleDeleteSelected}
                  className="inline-flex items-center space-x-1 text-xs text-rose-600 hover:text-rose-700 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>删除</span>
                </button>
              )}
            </div>

            {selectedNode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    图元标题
                  </label>
                  <input
                    type="text"
                    value={selectedNode.label}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateActiveCase((prev) => {
                        const cloned = JSON.parse(JSON.stringify(prev));
                        const target = cloned.richPicture.nodes.find(
                          (n: any) => n.id === selectedNode.id
                        );
                        if (target) target.label = val;
                        return cloned;
                      });
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    情境注解 (痛点/世界观/隐性情绪)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.sublabel || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateActiveCase((prev) => {
                        const cloned = JSON.parse(JSON.stringify(prev));
                        const target = cloned.richPicture.nodes.find(
                          (n: any) => n.id === selectedNode.id
                        );
                        if (target) target.sublabel = val;
                        return cloned;
                      });
                    }}
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-1">
                    图元类型
                  </label>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-stone-100 text-slate-700">
                    {selectedNode.type}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                点击画板中的任意图元，可在此处编辑文字或删除。
              </div>
            )}
          </div>

          {/* SSM Rich Picture Design Rules Slice */}
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4 space-y-2">
            <h4 className="text-xs font-semibold text-slate-800 flex items-center space-x-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-600" />
              <span>丰富图景绘制“四大禁忌”</span>
            </h4>
            <ul className="text-[11px] text-slate-600 space-y-1.5 leading-relaxed">
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>严禁画成 UML 活动图或数据库 ER 图（不要强加硬系统控制框）。</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>严禁抹杀利益对立（必须画出“交叉剑⚔️”与各方的抱怨）。</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>严禁只画正规组织架构（非正式权力同盟往往起决定作用）。</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>核心在于：让外人一眼就能看清现场各方的“爱恨情仇与死结”。</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
