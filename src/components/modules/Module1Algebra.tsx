import React, { useState } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import {
  Binary,
  Sliders,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  CheckCircle2,
  TrendingDown,
  Activity,
  Layers,
} from 'lucide-react';
import { KatexFormula } from '../common/KatexFormula';
import { SystemStabilityDashboard } from './SystemStabilityDashboard';

export const Module1Algebra: React.FC = () => {
  const { activeCase, updateActiveCase } = useSSMLab();
  const { algebraModel, stakeholders } = activeCase;

  const [simulationStep, setSimulationStep] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);

  // Helper to update weights
  const handleWeightChange = (shIndex: number, dimIndex: number, val: number) => {
    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      cloned.algebraModel.stakeholderVectors[shIndex].weights[dimIndex] = val;

      // Recalculate tension matrix
      const vectors = cloned.algebraModel.stakeholderVectors;
      const n = vectors.length;
      const matrix: number[][] = Array(n)
        .fill(0)
        .map(() => Array(n).fill(0));

      let totalDist = 0;
      const dists: number[] = [];

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            matrix[i][j] = 0;
          } else {
            // Euclidean distance
            let sumSq = 0;
            for (let d = 0; d < cloned.algebraModel.worldviewDimensions.length; d++) {
              const diff = vectors[i].weights[d] - vectors[j].weights[d];
              sumSq += diff * diff;
            }
            const dist = parseFloat(Math.sqrt(sumSq).toFixed(2));
            matrix[i][j] = dist;
            if (i < j) {
              totalDist += dist;
              dists.push(dist);
            }
          }
        }
      }
      cloned.algebraModel.tensionMatrix = matrix;

      // Recalculate Entropy
      if (totalDist > 0) {
        let entropy = 0;
        for (const d of dists) {
          const p = d / totalDist;
          if (p > 0) {
            entropy -= p * Math.log2(p);
          }
        }
        cloned.algebraModel.tensionEntropy = parseFloat(
          (entropy / Math.log2(dists.length || 1)).toFixed(2)
        );
      }

      return cloned;
    });
  };

  // Simulate Checkland debate / accommodation step (moves vectors 15% towards weighted barycenter)
  const runAccommodationStep = () => {
    setIsSimulating(true);
    setSimulationStep((s) => s + 1);

    updateActiveCase((prev) => {
      const cloned = JSON.parse(JSON.stringify(prev));
      const vectors = cloned.algebraModel.stakeholderVectors;
      const dims = cloned.algebraModel.worldviewDimensions.length;

      // Calculate power-weighted center
      const center: number[] = Array(dims).fill(0);
      let totalPower = 0;

      vectors.forEach((v: any) => {
        const sh = prev.stakeholders.find((s) => s.id === v.stakeholderId);
        const power = sh ? sh.power : 5;
        totalPower += power;
        for (let d = 0; d < dims; d++) {
          center[d] += v.weights[d] * power;
        }
      });

      if (totalPower > 0) {
        for (let d = 0; d < dims; d++) {
          center[d] /= totalPower;
        }
      }

      // Step vectors closer to center
      vectors.forEach((v: any) => {
        for (let d = 0; d < dims; d++) {
          const diff = center[d] - v.weights[d];
          v.weights[d] = parseFloat((v.weights[d] + diff * 0.22).toFixed(1));
        }
      });

      // Update tension matrix
      const n = vectors.length;
      const matrix: number[][] = Array(n)
        .fill(0)
        .map(() => Array(n).fill(0));

      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i === j) {
            matrix[i][j] = 0;
          } else {
            let sumSq = 0;
            for (let d = 0; d < dims; d++) {
              const diff = vectors[i].weights[d] - vectors[j].weights[d];
              sumSq += diff * diff;
            }
            matrix[i][j] = parseFloat(Math.sqrt(sumSq).toFixed(2));
          }
        }
      }
      cloned.algebraModel.tensionMatrix = matrix;
      cloned.algebraModel.tensionEntropy = parseFloat(
        Math.max(0.2, (cloned.algebraModel.tensionEntropy - 0.08)).toFixed(2)
      );

      return cloned;
    });

    setTimeout(() => setIsSimulating(false), 300);
  };

  const currentEntropy = algebraModel.tensionEntropy;
  const entropyStatus =
    currentEntropy > 0.8
      ? { label: '高度对立分歧', color: 'text-rose-600 bg-rose-50 border-rose-200' }
      : currentEntropy > 0.5
      ? { label: '存在协商空间', color: 'text-amber-600 bg-amber-50 border-amber-200' }
      : { label: '观念基本协调', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };

  return (
    <div className="space-y-6">
      {/* Module Banner / Introduction */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                系统代数
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                SSM 系统代数与不确定性映射 (System Algebra & Uncertainty Mapping)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500 flex items-center flex-wrap gap-1">
              <span>面向非结构化社会组织，形式化定义主体价值向量空间</span>
              <KatexFormula math="W \in \mathbb{R}^k" />
              <span>、张力矩阵</span>
              <KatexFormula math="D_{ij}" />
              <span>与观念协调算子</span>
              <KatexFormula math="\Phi" />
              <span>。</span>
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={runAccommodationStep}
              disabled={isSimulating}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Play className="w-3.5 h-3.5" />
              <span>迭代辩论协调 (第 {simulationStep} 轮)</span>
            </button>
          </div>
        </div>

        {/* Mathematical Slices / Formal Definitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 pt-4 border-t border-stone-100">
          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">
              ① 世界观向量空间 (Weltanschauung Space)
            </span>
            <div className="text-xs text-slate-800 bg-white p-2 rounded border border-stone-200 flex items-center justify-center min-h-[42px] overflow-x-auto">
              <KatexFormula math="W_i = [w_{i1}, w_{i2}, \dots, w_{ik}]^T \in \mathbb{R}^k" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              各利益相关者在核心治理维度上的主观优先权重分布。
            </p>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">
              ② 主观张力距离 (Tension Distance Metric)
            </span>
            <div className="text-xs text-slate-800 bg-white p-2 rounded border border-stone-200 flex items-center justify-center min-h-[42px] overflow-x-auto">
              <KatexFormula math="D_{ij} = \|W_i - W_j\|_2 = \sqrt{\sum_{d=1}^k (w_{id} - w_{jd})^2}" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              度量两方因根本理念不通约所造成的隐性摩擦势能。
            </p>
          </div>

          <div className="bg-stone-50 rounded-lg p-3 border border-stone-200">
            <span className="text-[11px] font-mono text-slate-500 block mb-1">
              ③ 系统观念冲突熵 (Tension Entropy)
            </span>
            <div className="text-xs text-slate-800 bg-white p-2 rounded border border-stone-200 flex items-center justify-center min-h-[42px] overflow-x-auto gap-2">
              <KatexFormula math="H = -\sum_{i < j} p_{ij} \log_2(p_{ij})" />
              <span className="text-xs font-mono font-semibold text-slate-700">H = {currentEntropy}</span>
            </div>
            <div className="flex items-center justify-between mt-1.5">
              <span className={`text-[11px] px-2 py-0.5 rounded border font-medium ${entropyStatus.color}`}>
                {entropyStatus.label}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">0.00 ~ 1.00</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Value Vectors Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vectors Sliders */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <span>多主体主观价值向量调节</span>
                <KatexFormula math="W_i" />
              </h3>
            </div>
            <span className="text-xs text-slate-400">滑动实时推导全系统张力与协调度</span>
          </div>

          <div className="space-y-4">
            {algebraModel.stakeholderVectors.map((sv, shIdx) => {
              const matchedSh = stakeholders.find((s) => s.id === sv.stakeholderId);
              return (
                <div
                  key={sv.stakeholderId}
                  className="bg-stone-50/80 rounded-lg p-3.5 border border-stone-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: matchedSh?.color || '#3B82F6' }}
                      />
                      <span className="text-xs font-semibold text-slate-800">{sv.name}</span>
                      <span className="text-[11px] text-slate-500">
                        ({matchedSh?.role || '参与方'} · 权力:{matchedSh?.power || 5}/10)
                      </span>
                    </div>
                    <span className="font-mono text-xs text-indigo-600 bg-white px-2 py-0.5 rounded border border-stone-200">
                      [{sv.weights.map((w) => w.toFixed(1)).join(', ')}]
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {algebraModel.worldviewDimensions.map((dim, dimIdx) => (
                      <div key={dim} className="space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-600 truncate">{dim}</span>
                          <span className="font-mono font-medium text-slate-700">
                            {sv.weights[dimIdx]?.toFixed(1)}
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={sv.weights[dimIdx] || 0}
                          onChange={(e) =>
                            handleWeightChange(shIdx, dimIdx, parseFloat(e.target.value))
                          }
                          className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Distance Matrix & Heatmap */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center space-x-2 mb-3">
              <Binary className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-semibold text-slate-800">
                主体间张力欧氏距离矩阵 (D_ij)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-center border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-slate-500 font-medium">
                    <th className="py-2 px-1 text-left">主体</th>
                    {algebraModel.stakeholderVectors.map((v) => (
                      <th key={v.stakeholderId} className="py-2 px-1 truncate max-w-[65px]">
                        {v.name.slice(0, 4)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {algebraModel.tensionMatrix.map((row, i) => (
                    <tr key={i} className="border-b border-stone-100">
                      <td className="py-2 px-1 text-left font-medium text-slate-700 truncate max-w-[70px]">
                        {algebraModel.stakeholderVectors[i]?.name.slice(0, 4)}
                      </td>
                      {row.map((val, j) => {
                        let bgColor = 'bg-stone-50 text-slate-500';
                        if (i !== j) {
                          if (val > 7.5) bgColor = 'bg-rose-50 text-rose-700 font-semibold';
                          else if (val > 4.5) bgColor = 'bg-amber-50 text-amber-700 font-medium';
                          else bgColor = 'bg-emerald-50 text-emerald-700';
                        }
                        return (
                          <td key={j} className="py-2 px-1">
                            <span className={`inline-block w-9 py-0.5 rounded text-[11px] font-mono ${bgColor}`}>
                              {val.toFixed(1)}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-4 pt-3 border-t border-stone-100">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-100 inline-block" />
                <span>低张力 (&lt;4.5)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-100 inline-block" />
                <span>中张力 (4.5~7.5)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded bg-rose-100 inline-block" />
                <span>高剧烈 (&gt;7.5)</span>
              </span>
            </div>
          </div>

          {/* Theoretical Accommodation Principle Slice */}
          <div className="bg-stone-50 rounded-xl border border-stone-200 p-4">
            <div className="flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  软系统代数准则：从对抗性向心聚敛到观念协调 (Accommodation)
                </p>
                <p className="text-[11px] leading-relaxed">
                  在软系统中，各方向量 W_i 不可能完全合并为同一数值（那属于硬系统空想）。协调的目标是使张力最大值 max(D_ij) ≤ τ_threshold，并在丰富图景与 CATWOE 中寻找到能覆盖各方底线的交集解。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recharts System Stability Dynamics Dashboard */}
      <SystemStabilityDashboard
        algebraModel={algebraModel}
        stakeholders={stakeholders}
      />
    </div>
  );
};
