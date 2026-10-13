import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Stakeholder, ConflictPair } from '../../types/ssm';
import {
  Play,
  Pause,
  Sliders,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Layers,
} from 'lucide-react';

interface StakeholderD3NetworkProps {
  stakeholders: Stakeholder[];
  conflictPairs: ConflictPair[];
  selectedShId: string | null;
  onSelectStakeholder: (id: string) => void;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  name: string;
  role: string;
  power: number;
  interest: number;
  worldview: string;
  color: string;
}

interface D3Link extends d3.SimulationLinkDatum<D3Node> {
  id: string;
  source: string | D3Node;
  target: string | D3Node;
  type: string;
  intensity: string;
  baseWeight: number;
  currentWeight: number;
}

export const StakeholderD3Network: React.FC<StakeholderD3NetworkProps> = ({
  stakeholders,
  conflictPairs,
  selectedShId,
  onSelectStakeholder,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isOscillating, setIsOscillating] = useState<boolean>(true);
  const [oscillationSpeed, setOscillationSpeed] = useState<number>(1);
  const [networkMode, setNetworkMode] = useState<'influence' | 'tension'>('influence');

  // Hover state
  const [hoveredNode, setHoveredNode] = useState<D3Node | null>(null);
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null);

  // References for D3 animation
  const animFrameRef = useRef<number | null>(null);
  const phaseRef = useRef<number>(0);
  const linksSelectionRef = useRef<d3.Selection<SVGLineElement, D3Link, SVGGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || stakeholders.length === 0) return;

    const width = 760;
    const height = 480;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create container group for zoom/pan
    const g = svg.append('g').attr('class', 'main-network-group');

    // Add zoom behavior
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    // Defs for gradients & markers
    const defs = svg.append('defs');

    // Shadow filters
    const filter = defs.append('filter').attr('id', 'd3-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Build Node data
    const nodes: D3Node[] = stakeholders.map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      power: s.power,
      interest: s.interest,
      worldview: s.worldview,
      color: s.color || '#3B82F6',
    }));

    // Build Link data
    const links: D3Link[] = [];

    if (networkMode === 'tension') {
      // Direct conflict pairs
      conflictPairs.forEach((cp) => {
        const srcNode = nodes.find((n) => n.id === cp.sourceId);
        const tgtNode = nodes.find((n) => n.id === cp.targetId);
        if (srcNode && tgtNode) {
          const powerMult = ((srcNode.power + tgtNode.power) / 20) * 4;
          const intensityMult = cp.intensity === '激烈' ? 3 : cp.intensity === '中度' ? 2 : 1;
          const baseWeight = Math.max(1.5, powerMult * intensityMult);
          links.push({
            id: cp.id,
            source: cp.sourceId,
            target: cp.targetId,
            type: cp.conflictType,
            intensity: cp.intensity,
            baseWeight,
            currentWeight: baseWeight,
          });
        }
      });
    } else {
      // Dynamic Power-Influence Collaboration & Conflict Flow
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const u = nodes[i];
          const v = nodes[j];
          const hasDirectConflict = conflictPairs.find(
            (cp) =>
              (cp.sourceId === u.id && cp.targetId === v.id) ||
              (cp.sourceId === v.id && cp.targetId === u.id)
          );

          // Combined influence weight: (Power_u * Interest_v + Power_v * Interest_u) / 35
          const influenceScore = (u.power * v.interest + v.power * u.interest) / 35;
          const baseWeight = Math.max(1.2, influenceScore * (hasDirectConflict ? 1.4 : 0.8));

          links.push({
            id: `link-${u.id}-${v.id}`,
            source: u.id,
            target: v.id,
            type: hasDirectConflict ? hasDirectConflict.conflictType : '协同影响力耦合',
            intensity: hasDirectConflict ? hasDirectConflict.intensity : '轻微',
            baseWeight,
            currentWeight: baseWeight,
          });
        }
      }
    }

    // Force simulation
    const simulation = d3
      .forceSimulation<D3Node>(nodes)
      .force(
        'link',
        d3
          .forceLink<D3Node, D3Link>(links)
          .id((d) => d.id)
          .distance((d) => (networkMode === 'tension' ? 140 : 170))
      )
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collide', d3.forceCollide().radius((d: any) => d.power * 4.5 + 24));

    // Draw Links
    const linkGroup = g.append('g').attr('class', 'links');

    const linkLines = linkGroup
      .selectAll<SVGLineElement, D3Link>('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', (d) => {
        if (d.intensity === '激烈') return '#EF4444';
        if (d.intensity === '中度') return '#F59E0B';
        return '#6366F1';
      })
      .attr('stroke-opacity', (d) => (d.intensity === '激烈' ? 0.75 : 0.5))
      .attr('stroke-width', (d) => d.baseWeight)
      .attr('stroke-dasharray', (d) => (d.intensity === '激烈' ? '5,3' : 'none'));

    linksSelectionRef.current = linkLines;

    // Draw Nodes
    const nodeGroup = g.append('g').attr('class', 'nodes');

    const nodeElements = nodeGroup
      .selectAll<SVGGElement, D3Node>('g')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-item cursor-pointer')
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      )
      .on('click', (event, d) => {
        onSelectStakeholder(d.id);
      })
      .on('mouseenter', (event, d) => {
        setHoveredNode(d);
        const rect = svgRef.current?.getBoundingClientRect();
        if (rect) {
          setHoverPosition({
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          });
        }
      })
      .on('mouseleave', () => {
        setHoveredNode(null);
        setHoverPosition(null);
      });

    // Outer Halo for High Power nodes
    nodeElements
      .append('circle')
      .attr('r', (d) => d.power * 2.8 + 14)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', (d) => (d.power >= 7 ? 0.15 : 0.08))
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.4);

    // Core circle sized by Power
    nodeElements
      .append('circle')
      .attr('r', (d) => d.power * 2 + 10)
      .attr('fill', '#FFFFFF')
      .attr('stroke', (d) => (d.id === selectedShId ? '#4F46E5' : d.color))
      .attr('stroke-width', (d) => (d.id === selectedShId ? 3.5 : 2.5))
      .attr('filter', (d) => (d.id === selectedShId ? 'url(#d3-glow)' : 'none'));

    // Inner circle fill
    nodeElements
      .append('circle')
      .attr('r', (d) => d.power * 1.5 + 4)
      .attr('fill', (d) => d.color)
      .attr('fill-opacity', 0.85);

    // Initial Letter
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d) => Math.max(9, d.power + 3))
      .attr('font-weight', 'bold')
      .attr('fill', '#FFFFFF')
      .text((d) => d.name.slice(0, 1));

    // Label under circle
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.power * 2.8 + 24)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('fill', '#1E293B')
      .text((d) => d.name);

    // Sublabel (Power & Interest)
    nodeElements
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.power * 2.8 + 36)
      .attr('font-size', '8.5px')
      .attr('fill', '#64748B')
      .text((d) => `权${d.power} · 益${d.interest}`);

    // Simulation tick handler
    simulation.on('tick', () => {
      linkLines
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      nodeElements.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [stakeholders, conflictPairs, selectedShId, networkMode]);

  // Dynamic Oscillation loop using requestAnimationFrame
  useEffect(() => {
    if (!isOscillating) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const animateFluctuation = () => {
      phaseRef.current += 0.035 * oscillationSpeed;
      const phase = phaseRef.current;

      if (linksSelectionRef.current) {
        linksSelectionRef.current.attr('stroke-width', (d, i) => {
          // Dynamic wave factor modulating thickness
          const wave = Math.sin(phase + i * 1.2);
          const fluctuation = wave * (d.baseWeight * 0.45);
          return Math.max(1, d.baseWeight + fluctuation);
        });
      }

      animFrameRef.current = requestAnimationFrame(animateFluctuation);
    };

    animFrameRef.current = requestAnimationFrame(animateFluctuation);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOscillating, oscillationSpeed]);

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
      {/* Panel Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-stone-100 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              D3.js 动力拓扑
            </span>
            <h3 className="text-sm font-bold text-slate-800">
              利益相关者协作与博弈网络 (Dynamic Power-Influence Force Graph)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            连线粗细映射两端主体权力与影响力的交互耦合权重，支持动态波动与实时物理拖拽交互。
          </p>
        </div>

        {/* Toggle & Oscillation Controls */}
        <div className="flex items-center space-x-2">
          {/* Mode Switch */}
          <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5 text-xs">
            <button
              onClick={() => setNetworkMode('influence')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                networkMode === 'influence'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              协作影响力流
            </button>
            <button
              onClick={() => setNetworkMode('tension')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                networkMode === 'tension'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              直接博弈张力
            </button>
          </div>

          {/* Oscillation Play/Pause */}
          <button
            onClick={() => setIsOscillating(!isOscillating)}
            className={`inline-flex items-center space-x-1 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              isOscillating
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-medium'
                : 'bg-stone-100 text-slate-600 border-stone-200'
            }`}
            title="切换动态权力波动流动"
          >
            {isOscillating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isOscillating ? '波动模拟中' : '暂停波动'}</span>
          </button>
        </div>
      </div>

      {/* D3 Graph Canvas Wrapper */}
      <div
        ref={containerRef}
        className="relative w-full h-[480px] bg-stone-50/70 rounded-xl border border-stone-200 overflow-hidden select-none"
      >
        {/* Floating Indicator */}
        <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] text-slate-500 border border-stone-200 flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          <span>
            D3 力导向仿真运行中 · 节点: {stakeholders.length} · 滚动滚轮缩放 / 拖拽任意主体
          </span>
        </div>

        {/* Oscillation Speed Slider overlay */}
        <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-xs px-2.5 py-1.5 rounded-md text-xs border border-stone-200 flex items-center space-x-2">
          <Sliders className="w-3 h-3 text-slate-400" />
          <span className="text-[11px] text-slate-600">波动频次:</span>
          <input
            type="range"
            min="0.3"
            max="2.5"
            step="0.1"
            value={oscillationSpeed}
            onChange={(e) => setOscillationSpeed(parseFloat(e.target.value))}
            className="w-16 h-1 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <span className="text-[10px] font-mono text-indigo-600 font-bold">{oscillationSpeed}x</span>
        </div>

        {/* SVG Element */}
        <svg ref={svgRef} viewBox="0 0 760 480" className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Hover Tooltip Overlay */}
        {hoveredNode && hoverPosition && (
          <div
            style={{
              left: `${Math.min(540, hoverPosition.x + 12)}px`,
              top: `${Math.min(360, hoverPosition.y + 12)}px`,
            }}
            className="absolute z-30 pointer-events-none bg-slate-900/95 text-white p-3 rounded-lg shadow-xl text-xs max-w-xs space-y-1"
          >
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredNode.color }} />
              <span className="font-bold">{hoveredNode.name}</span>
              <span className="text-[10px] text-slate-400">({hoveredNode.role})</span>
            </div>
            <div className="flex items-center space-x-3 text-[11px] text-slate-300 font-mono">
              <span>权力 (Power): {hoveredNode.power}/10</span>
              <span>利益关切: {hoveredNode.interest}/10</span>
            </div>
            <p className="text-[10px] text-slate-300 italic pt-1 border-t border-slate-800">
              “{hoveredNode.worldview}”
            </p>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-xs p-2.5 rounded-lg border border-stone-200 text-[10px] text-slate-600 space-y-1">
          <div className="font-semibold text-slate-800 mb-0.5">图例说明 (Legend):</div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full border-2 border-indigo-600 bg-indigo-50 inline-block" />
            <span>圆圈半径 ∝ 行政与制度权力大小 (Power)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-indigo-500 inline-block" />
            <span>连线粗细 ∝ 动态耦合影响力 (Power × Interest 波动)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="w-4 h-0.5 bg-rose-500 border-dashed inline-block" />
            <span>红色虚线 ∝ 剧烈/中度博弈冲突对 (Clash)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
