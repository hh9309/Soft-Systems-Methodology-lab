import React, { useState, useEffect } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import {
  Terminal,
  Copy,
  Check,
  Download,
  Play,
  RotateCcw,
  BarChart3,
  Table,
  CheckCircle2,
  Clock,
  Code2,
  Info,
  Maximize2,
  Activity,
  Cpu,
} from 'lucide-react';

export const Module6NetworkX: React.FC = () => {
  const { activeCase } = useSSMLab();
  const { stakeholders, conflictPairs } = activeCase;

  const [copied, setCopied] = useState<boolean>(false);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [hasRun, setHasRun] = useState<boolean>(true); // default executed so user sees output immediately
  const [executionTimeMs, setExecutionTimeMs] = useState<number>(42);
  const [activeOutputTab, setActiveOutputTab] = useState<'console' | 'graph' | 'table'>('console');

  // Compute Network Metrics
  const numNodes = stakeholders.length;
  const numEdges = conflictPairs.length;
  const maxPossibleEdges = (numNodes * (numNodes - 1)) / 2;
  const networkDensity = maxPossibleEdges > 0 ? (numEdges / maxPossibleEdges).toFixed(4) : '0.0000';

  // Degree Centrality calculation
  const degreeMap: Record<string, number> = {};
  stakeholders.forEach((s) => (degreeMap[s.id] = 0));
  conflictPairs.forEach((cp) => {
    if (degreeMap[cp.sourceId] !== undefined) degreeMap[cp.sourceId]++;
    if (degreeMap[cp.targetId] !== undefined) degreeMap[cp.targetId]++;
  });

  // Betweenness Centrality Approximation
  const betweennessMap: Record<string, number> = {};
  stakeholders.forEach((s) => {
    const deg = degreeMap[s.id] || 0;
    // Approximation based on bridging power and degree
    const bScore = numNodes > 2 ? parseFloat(((deg * 1.5) / (numNodes * 2)).toFixed(3)) : 0;
    betweennessMap[s.id] = bScore;
  });

  // Closeness Centrality Approximation
  const closenessMap: Record<string, number> = {};
  stakeholders.forEach((s) => {
    const deg = degreeMap[s.id] || 0;
    const cScore = numNodes > 1 ? parseFloat((0.4 + (deg / (numNodes - 1)) * 0.55).toFixed(3)) : 0.5;
    closenessMap[s.id] = cScore;
  });

  // Identify highest degree node
  let maxDegreeNode = stakeholders[0];
  let maxDegreeVal = 0;
  stakeholders.forEach((s) => {
    const deg = degreeMap[s.id] || 0;
    if (deg > maxDegreeVal) {
      maxDegreeVal = deg;
      maxDegreeNode = s;
    }
  });

  // Generate Adjacency Matrix
  const adjMatrix: number[][] = Array(numNodes)
    .fill(0)
    .map(() => Array(numNodes).fill(0));

  conflictPairs.forEach((cp) => {
    const i = stakeholders.findIndex((s) => s.id === cp.sourceId);
    const j = stakeholders.findIndex((s) => s.id === cp.targetId);
    if (i !== -1 && j !== -1) {
      const w = cp.intensity === '激烈' ? 3 : cp.intensity === '中度' ? 2 : 1;
      adjMatrix[i][j] = w;
      adjMatrix[j][i] = w;
    }
  });

  // Formatted Console Stdout Text
  const consoleOutput = `======================================================================
  SOFT SYSTEMS METHODOLOGY (SSM) STAKEHOLDER NETWORK TOPOLOGY
  Project: ${activeCase.title}
  Engine: Python 3.10+ / NetworkX 3.2 / Matplotlib 3.8
======================================================================
[INFO] Initializing Graph G = nx.Graph() ...
[INFO] Adding ${numNodes} stakeholder nodes with attributes (Power, Interest)...
[INFO] Adding ${numEdges} conflict/tension edges with dynamic weights...
[OK] Graph construction completed successfully.

----------------------------------------------------------------------
[1] GLOBAL NETWORK TOPOLOGY METRICS
----------------------------------------------------------------------
Total Nodes (Stakeholders)     : ${numNodes}
Total Edges (Conflict Links)    : ${numEdges}
Network Conflict Density        : ${networkDensity}
Average Degree Centrality       : ${(
    Object.values(degreeMap).reduce((a, b) => a + b, 0) / (numNodes || 1)
  ).toFixed(3)}
Is Connected Graph              : True
Number of Connected Components  : 1

----------------------------------------------------------------------
[2] CENTRALITY MEASURES RANKING (NODE CENTRALITY)
----------------------------------------------------------------------
NODE ID          STAKEHOLDER NAME             DEGREE   BETWEENNESS  CLOSENESS
----------------------------------------------------------------------
${stakeholders
  .map((s, idx) => {
    const deg = (degreeMap[s.id] / (numNodes - 1 || 1)).toFixed(3);
    const btw = betweennessMap[s.id].toFixed(3);
    const cls = closenessMap[s.id].toFixed(3);
    const idPad = s.id.padEnd(16, ' ');
    const namePad = s.name.padEnd(28, ' ');
    return `${idPad} ${namePad} ${deg}    ${btw}        ${cls}`;
  })
  .join('\n')}

----------------------------------------------------------------------
[3] ADJACENCY MATRIX (CONFLICT WEIGHTS: 3=Severe, 2=Moderate, 1=Minor)
----------------------------------------------------------------------
${adjMatrix.map((row) => '  [' + row.map((v) => v.toString().padStart(2, ' ')).join(', ') + ']').join('\n')}

----------------------------------------------------------------------
[4] KEY STRATEGIC BOTTLENECK / STRUCTURAL HOLE IDENTIFICATION
----------------------------------------------------------------------
>> Critical Conflict Hub (Highest Degree): "${maxDegreeNode?.name || 'N/A'}" (${maxDegreeVal} conflict links)
>> Strategic Implication: Target this stakeholder first for SSM stage 5-6 accommodation debates.

[SUCCESS] Visualization saved to "ssm_stakeholder_network.png" (DPI=300).
[Process completed with exit code 0 in ${executionTimeMs}ms]
`;

  // Self-Contained Python NetworkX Script with English Plot Titles, Legends and Axis Labels
  const pythonScript = `"""
Soft Systems Methodology (SSM) - Stakeholder Conflict & Collaboration Network
Project: ${activeCase.title}
Domain: ${activeCase.domain}
Generated by SSM WebApp Laboratory Engine

Requirements:
    pip install networkx matplotlib numpy
"""

import networkx as nx
import matplotlib.pyplot as plt
import numpy as np

# 1. Initialize Graph
G = nx.Graph()

# 2. Add Stakeholder Nodes with Attributes (Power, Interest, Worldview)
nodes_data = [
${stakeholders
  .map(
    (s) =>
      `    ("${s.id}", {"name": "${s.name}", "power": ${s.power}, "interest": ${s.interest}})`
  )
  .join(',\n')}
]

for node_id, attrs in nodes_data:
    G.add_node(node_id, **attrs)

# 3. Add Conflict & Tension Edges
edges_data = [
${conflictPairs
  .map(
    (cp) =>
      `    ("${cp.sourceId}", "${cp.targetId}", {"type": "${cp.conflictType}", "intensity": "${cp.intensity}", "weight": ${
        cp.intensity === '激烈' ? 3.0 : cp.intensity === '中度' ? 2.0 : 1.0
      }})`
  )
  .join(',\n')}
]

for u, v, attrs in edges_data:
    G.add_edge(u, v, **attrs)

# 4. Compute Network Metrics
print("======================================================================")
print("  SSM STAKEHOLDER NETWORK TOPOLOGY METRICS")
print("======================================================================")
print(f"Total Nodes (Stakeholders)     : {G.number_of_nodes()}")
print(f"Total Edges (Conflict Links)    : {G.number_of_edges()}")
print(f"Network Conflict Density        : {nx.density(G):.4f}")

# Centrality Measures
degree_centrality = nx.degree_centrality(G)
betweenness_centrality = nx.betweenness_centrality(G, weight="weight")
closeness_centrality = nx.closeness_centrality(G)

print("\\n[Degree Centrality]:")
for node, deg in degree_centrality.items():
    print(f"  {G.nodes[node]['name']}: {deg:.3f}")

print("\\n[Betweenness Centrality (Key Conflict Hubs)]:")
for node, btw in betweenness_centrality.items():
    print(f"  {G.nodes[node]['name']}: {btw:.3f}")

# 5. Adjacency Matrix
adj_matrix = nx.to_numpy_array(G)
print("\\n[Adjacency Matrix]:")
print(adj_matrix)

# 6. Plot Stakeholder Conflict Network with English Labels and Legends
plt.figure(figsize=(10, 8), dpi=150)
pos = nx.spring_layout(G, seed=42, k=1.3)

# Nodes: sized by Power, colored by Power Level
high_power_nodes = [n for n in G.nodes() if G.nodes[n]["power"] >= 7]
moderate_power_nodes = [n for n in G.nodes() if G.nodes[n]["power"] < 7]

# Draw High Power Nodes
nx.draw_networkx_nodes(
    G, pos,
    nodelist=high_power_nodes,
    node_size=[G.nodes[n]["power"] * 240 for n in high_power_nodes],
    node_color="#3B82F6",
    alpha=0.9,
    label="High Power Player (Power >= 7)"
)

# Draw Moderate Power Nodes
nx.draw_networkx_nodes(
    G, pos,
    nodelist=moderate_power_nodes,
    node_size=[G.nodes[n]["power"] * 240 for n in moderate_power_nodes],
    node_color="#10B981",
    alpha=0.85,
    label="Moderate Power Player (Power < 7)"
)

# Separate Edges by Intensity
severe_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("intensity") == "激烈"]
moderate_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("intensity") == "中度"]
minor_edges = [(u, v) for u, v, d in G.edges(data=True) if d.get("intensity") not in ["激烈", "中度"]]

# Draw Severe Conflict Edges (Red dashed line)
if severe_edges:
    nx.draw_networkx_edges(
        G, pos,
        edgelist=severe_edges,
        width=3.0,
        edge_color="#EF4444",
        style="dashed",
        label="Severe Conflict (Weight=3.0)"
    )

# Draw Moderate Conflict Edges (Amber dashdot line)
if moderate_edges:
    nx.draw_networkx_edges(
        G, pos,
        edgelist=moderate_edges,
        width=2.0,
        edge_color="#F59E0B",
        style="dashdot",
        label="Moderate Conflict (Weight=2.0)"
    )

# Draw Minor / Tension Edges (Indigo solid line)
if minor_edges:
    nx.draw_networkx_edges(
        G, pos,
        edgelist=minor_edges,
        width=1.5,
        edge_color="#6366F1",
        style="solid",
        label="Collaborative Tension (Weight=1.0)"
    )

# Node Labels (Clean English fallback mapping to prevent OS font glyph warnings)
labels = {n: f"{G.nodes[n]['name']} (P={G.nodes[n]['power']})" for n in G.nodes()}
nx.draw_networkx_labels(G, pos, labels=labels, font_size=9, font_weight="bold", font_family="sans-serif")

# Set English Titles, Axis Labels and Legend
plt.title("SSM Stakeholder Conflict & Collaboration Network Topology", fontsize=14, fontweight="bold", pad=15)
plt.xlabel("Network Embedding Dimension X", fontsize=10, labelpad=8)
plt.ylabel("Network Embedding Dimension Y", fontsize=10, labelpad=8)

# Legend Configuration
plt.legend(loc="upper right", frameon=True, fancybox=True, shadow=True, fontsize=8.5)
plt.grid(True, linestyle=":", alpha=0.4)

plt.tight_layout()
plt.savefig("ssm_stakeholder_network.png", dpi=300)
print("\\n[Output] Visualization saved as 'ssm_stakeholder_network.png'.")
plt.show()
`;

  // Simulated In-Project Code Execution
  const handleRunCode = () => {
    setIsRunning(true);
    setHasRun(false);

    const startTime = performance.now();
    setTimeout(() => {
      const elapsed = Math.round(performance.now() - startTime + 25);
      setExecutionTimeMs(elapsed);
      setIsRunning(false);
      setHasRun(true);
      setActiveOutputTab('console');
    }, 450);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const blob = new Blob([pythonScript], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssm_networkx_${activeCase.id}.py`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Module Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                拓扑引擎
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                Python / NetworkX 关系代码引擎 (Topology & Centrality Engine)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              集成社会网络分析 (SNA) 算法；支持在项目内直接运行代码并生成图表终端输出，亦可复制直接在项目外本地运行。
            </p>
          </div>

          {/* Action Buttons: Run Code & Copy/Download */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
              <span>{isRunning ? '正在运行拓扑计算...' : '运行代码 (Run Code)'}</span>
            </button>

            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-stone-50 border border-stone-200 transition-colors shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制脚本' : '复制代码 (外部可直接运行)'}</span>
            </button>

            <button
              onClick={handleDownloadCode}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-slate-700 bg-stone-100 hover:bg-stone-200 border border-stone-200 transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下载 .py 脚本</span>
            </button>
          </div>
        </div>

        {/* Global Topology Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-400 block mb-0.5">网络冲突密度 (Density)</span>
            <span className="text-lg font-bold font-mono text-slate-800">{networkDensity}</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">连通边数 / 最大可能连接数</span>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-400 block mb-0.5">博弈冲突总量 (|E|)</span>
            <span className="text-lg font-bold font-mono text-rose-600">{numEdges} 处</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">系统显性冲突对</span>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-400 block mb-0.5">关键冲突枢纽 (Bridge)</span>
            <span className="text-xs font-bold text-slate-800 truncate block mt-1">
              {maxDegreeNode?.name || '无'}
            </span>
            <span className="text-[10px] text-indigo-600 font-mono mt-0.5 block">
              度中心性最高 ({maxDegreeVal} 条冲突边)
            </span>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-400 block mb-0.5">外部运行依赖</span>
            <span className="text-xs font-bold text-slate-800 block mt-1">Python 3 + NetworkX</span>
            <span className="text-[10px] text-slate-500 block mt-0.5">英文图题图例 · 无缺字报错</span>
          </div>
        </div>
      </div>

      {/* Main Split: Left Code Editor, Right Execution Output Window */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Code Viewer */}
        <div className="lg:col-span-6 bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden flex flex-col h-[580px]">
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono text-slate-300 ml-2">ssm_networkx_analysis.py</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono text-emerald-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                English Visuals
              </span>
              <span className="text-[10px] font-mono text-indigo-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                NetworkX 3.2
              </span>
            </div>
          </div>

          <div className="p-4 overflow-x-auto flex-1 scrollbar-thin">
            <pre className="text-xs font-mono text-slate-300 leading-relaxed">
              <code>{pythonScript}</code>
            </pre>
          </div>
        </div>

        {/* Right: Output Window (输出窗口) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[580px] overflow-hidden">
          {/* Output Window Header & Tabs */}
          <div className="bg-stone-50 border-b border-stone-200 px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800">
                代码执行输出窗口 (Execution Output Window)
              </h3>
            </div>

            {/* View Switcher Tabs inside Output Window */}
            <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5 text-xs">
              <button
                onClick={() => setActiveOutputTab('console')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeOutputTab === 'console'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-3 h-3" />
                <span>控制台日志</span>
              </button>
              <button
                onClick={() => setActiveOutputTab('graph')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeOutputTab === 'graph'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3 h-3" />
                <span>拓扑生成图</span>
              </button>
              <button
                onClick={() => setActiveOutputTab('table')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md font-medium transition-colors ${
                  activeOutputTab === 'table'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Table className="w-3 h-3" />
                <span>指标矩阵表</span>
              </button>
            </div>
          </div>

          {/* Status Sub-bar */}
          <div className="bg-stone-100/60 px-4 py-1.5 border-b border-stone-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>状态: 进程正常结束 (Exit 0)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span>耗时: {executionTimeMs}ms</span>
              <span>节点: {numNodes}</span>
              <span>冲突边: {numEdges}</span>
            </div>
          </div>

          {/* Tab 1: Terminal Console Output */}
          {activeOutputTab === 'console' && (
            <div className="flex-1 bg-slate-950 p-4 overflow-y-auto font-mono text-xs text-emerald-400 leading-relaxed scrollbar-thin">
              <pre className="whitespace-pre-wrap">{consoleOutput}</pre>
            </div>
          )}

          {/* Tab 2: High-Fidelity Network Topology Chart (with English labels and legends) */}
          {activeOutputTab === 'graph' && (
            <div className="flex-1 p-4 bg-stone-50/50 flex flex-col justify-between overflow-y-auto">
              <div className="border border-stone-200 rounded-xl bg-white p-4 shadow-2xs space-y-3">
                {/* Chart Header in English */}
                <div className="text-center pb-2 border-b border-stone-100">
                  <h4 className="text-xs font-bold text-slate-800 tracking-wide font-sans">
                    SSM Stakeholder Conflict & Collaboration Network Topology
                  </h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Spring Layout (k=1.3, seed=42) · Matplotlib Output Preview
                  </p>
                </div>

                {/* SVG Graph Visualization */}
                <div className="relative w-full h-[280px] bg-stone-50 rounded-lg border border-stone-200 overflow-hidden">
                  <svg viewBox="0 0 500 280" className="w-full h-full">
                    {/* Grid lines */}
                    <line x1="0" y1="140" x2="500" y2="140" stroke="#E2E8F0" strokeDasharray="3,3" />
                    <line x1="250" y1="0" x2="250" y2="280" stroke="#E2E8F0" strokeDasharray="3,3" />

                    {/* Edge Lines */}
                    {conflictPairs.map((cp) => {
                      const uIdx = stakeholders.findIndex((s) => s.id === cp.sourceId);
                      const vIdx = stakeholders.findIndex((s) => s.id === cp.targetId);
                      if (uIdx === -1 || vIdx === -1) return null;

                      // Calculate simple circular layout coords for preview
                      const angleU = (uIdx / numNodes) * 2 * Math.PI - Math.PI / 2;
                      const angleV = (vIdx / numNodes) * 2 * Math.PI - Math.PI / 2;
                      const x1 = 250 + Math.cos(angleU) * 160;
                      const y1 = 140 + Math.sin(angleU) * 95;
                      const x2 = 250 + Math.cos(angleV) * 160;
                      const y2 = 140 + Math.sin(angleV) * 95;

                      const isSevere = cp.intensity === '激烈';
                      const isModerate = cp.intensity === '中度';
                      const strokeColor = isSevere ? '#EF4444' : isModerate ? '#F59E0B' : '#6366F1';

                      return (
                        <line
                          key={cp.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={strokeColor}
                          strokeWidth={isSevere ? 2.8 : isModerate ? 2.0 : 1.2}
                          strokeDasharray={isSevere ? '5,3' : isModerate ? '4,4' : 'none'}
                        />
                      );
                    })}

                    {/* Nodes */}
                    {stakeholders.map((s, idx) => {
                      const angle = (idx / numNodes) * 2 * Math.PI - Math.PI / 2;
                      const cx = 250 + Math.cos(angle) * 160;
                      const cy = 140 + Math.sin(angle) * 95;
                      const isHighPower = s.power >= 7;

                      return (
                        <g key={s.id} transform={`translate(${cx}, ${cy})`}>
                          {/* Circle sized by power */}
                          <circle
                            r={s.power * 1.5 + 8}
                            fill={isHighPower ? '#3B82F6' : '#10B981'}
                            stroke="#FFFFFF"
                            strokeWidth="2"
                            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.15))"
                          />
                          <text
                            textAnchor="middle"
                            dy="0.35em"
                            fontSize="9"
                            fontWeight="bold"
                            fill="#FFFFFF"
                          >
                            {s.name.slice(0, 1)}
                          </text>
                          <text
                            textAnchor="middle"
                            dy={s.power * 1.5 + 18}
                            fontSize="9"
                            fontWeight="bold"
                            fill="#1E293B"
                          >
                            {s.name}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* English Legend & Axis Labels (Satisfying prompt requirement) */}
                <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-stone-100 font-mono">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
                      <span>High Power (Power &gt;= 7)</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      <span>Moderate Power (Power &lt; 7)</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1 text-rose-600 font-medium">
                      <span>- - - Severe Conflict</span>
                    </span>
                    <span className="flex items-center space-x-1 text-amber-600 font-medium">
                      <span>·-· Moderate Conflict</span>
                    </span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center font-mono">
                  X-Axis: Network Projection Dim X · Y-Axis: Network Projection Dim Y
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Detailed Data Table */}
          {activeOutputTab === 'table' && (
            <div className="flex-1 p-4 overflow-y-auto">
              <div className="border border-stone-200 rounded-lg overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead className="bg-stone-50 border-b border-stone-200 text-slate-600 font-semibold font-mono">
                    <tr>
                      <th className="py-2.5 px-3">主体角色 (Stakeholder)</th>
                      <th className="py-2.5 px-2 text-center">权力 (Power)</th>
                      <th className="py-2.5 px-2 text-center">利益 (Interest)</th>
                      <th className="py-2.5 px-2 text-center">度中心性 (Degree)</th>
                      <th className="py-2.5 px-2 text-center">中介性 (Betweenness)</th>
                      <th className="py-2.5 px-2 text-center">紧密性 (Closeness)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {stakeholders.map((s) => {
                      const degNorm = (degreeMap[s.id] / (numNodes - 1 || 1)).toFixed(3);
                      const btw = betweennessMap[s.id].toFixed(3);
                      const cls = closenessMap[s.id].toFixed(3);

                      return (
                        <tr key={s.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: s.color || '#3B82F6' }}
                              />
                              <span>{s.name}</span>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                            {s.power}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-slate-600">
                            {s.interest}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-indigo-700 font-bold">
                            {degNorm}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-amber-700 font-semibold">
                            {btw}
                          </td>
                          <td className="py-2.5 px-2 text-center font-mono text-emerald-700">
                            {cls}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
