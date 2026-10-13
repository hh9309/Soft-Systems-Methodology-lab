import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Sliders,
  RotateCcw,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { KatexFormula } from '../common/KatexFormula';
import { SystemAlgebraState, Stakeholder } from '../../types/ssm';

interface SystemStabilityDashboardProps {
  algebraModel: SystemAlgebraState;
  stakeholders: Stakeholder[];
}

export const SystemStabilityDashboard: React.FC<SystemStabilityDashboardProps> = ({
  algebraModel,
  stakeholders,
}) => {
  // Hypothesis Variables (Assumptions)
  const [alpha, setAlpha] = useState<number>(0.22); // Convergence / Accommodation rate (0.05 - 0.50)
  const [beta, setBeta] = useState<number>(1.0); // Power Asymmetry Weight (0.0 - 2.0)
  const [sigma, setSigma] = useState<number>(0.05); // Environmental Perturbation Noise (0.0 - 0.25)
  const [rounds, setRounds] = useState<number>(12); // Simulation Horizon (6 - 20)
  const [activePreset, setActivePreset] = useState<string>('standard');

  // Compute base initial tension distance
  const initialMetrics = useMemo(() => {
    let maxDist = 0;
    let sumDist = 0;
    let count = 0;
    const matrix = algebraModel.tensionMatrix;
    for (let i = 0; i < matrix.length; i++) {
      for (let j = i + 1; j < matrix.length; j++) {
        const d = matrix[i][j] || 0;
        if (d > maxDist) maxDist = d;
        sumDist += d;
        count++;
      }
    }
    const avgDist = count > 0 ? sumDist / count : 4.0;
    return {
      maxDist: maxDist || 6.5,
      avgDist: avgDist || 4.2,
      entropy: algebraModel.tensionEntropy || 0.75,
    };
  }, [algebraModel]);

  // Generate Simulation Trajectories under 4 Different Hypothesis Scenarios
  const simulationData = useMemo(() => {
    const data = [];
    const baseAvg = initialMetrics.avgDist;
    const baseMax = initialMetrics.maxDist;

    // Pseudo-random deterministic noise based on round
    const getNoise = (t: number, scale: number) => {
      return (Math.sin(t * 1.7) * 0.5 + Math.cos(t * 0.9) * 0.5) * scale;
    };

    for (let t = 0; t <= rounds; t++) {
      // 1. Standard Checkland Accommodation (协商聚敛)
      // Exponential decay toward consensus + minor noise
      const decayBaseline = Math.exp(-alpha * t * (1.1 - beta * 0.1));
      const distBaseline = Math.max(0.5, baseAvg * decayBaseline + getNoise(t, sigma * 2));
      const stabBaseline = Math.min(
        100,
        Math.max(0, (1 - distBaseline / (baseMax * 1.3)) * 100)
      );

      // 2. Power-Biased Dictate (强权主导压制)
      // Fast drop initially, then rebounds or plateaus due to minority resistance
      const powerBiasDecay = Math.exp(-alpha * 1.4 * t);
      const backlash = t > 3 ? (t - 3) * 0.08 * beta : 0;
      const distPower = Math.max(1.0, baseAvg * powerBiasDecay + backlash + getNoise(t, sigma * 3));
      const stabPower = Math.min(
        95,
        Math.max(10, (1 - distPower / (baseMax * 1.3)) * 100)
      );

      // 3. Unregulated Conflict (无调解极化对抗)
      // Entropy rises, divergent drift
      const distPolarized = Math.min(
        baseMax * 1.5,
        baseAvg * (1 + 0.045 * t * (1 + beta * 0.3)) + getNoise(t, sigma * 4)
      );
      const stabPolarized = Math.min(
        100,
        Math.max(5, (1 - distPolarized / (baseMax * 1.3)) * 100)
      );

      // 4. Ideal Egalitarian Consensus (理想多方充分共识)
      // Rapid convergence with minimal overshoot
      const idealDecay = Math.exp(-alpha * 1.85 * t);
      const distIdeal = Math.max(0.2, baseAvg * idealDecay + getNoise(t, sigma * 0.8));
      const stabIdeal = Math.min(
        100,
        Math.max(15, (1 - distIdeal / (baseMax * 1.3)) * 100)
      );

      data.push({
        round: `第 ${t} 轮`,
        roundNum: t,
        baseline: parseFloat(stabBaseline.toFixed(1)),
        powerBiased: parseFloat(stabPower.toFixed(1)),
        polarized: parseFloat(stabPolarized.toFixed(1)),
        idealConsensus: parseFloat(stabIdeal.toFixed(1)),
      });
    }

    return data;
  }, [alpha, beta, sigma, rounds, initialMetrics]);

  // Presets handler
  const applyPreset = (presetKey: string) => {
    setActivePreset(presetKey);
    switch (presetKey) {
      case 'standard':
        setAlpha(0.22);
        setBeta(1.0);
        setSigma(0.05);
        break;
      case 'strong_power':
        setAlpha(0.35);
        setBeta(1.8);
        setSigma(0.12);
        break;
      case 'polarized':
        setAlpha(0.08);
        setBeta(0.4);
        setSigma(0.18);
        break;
      case 'high_consensus':
        setAlpha(0.42);
        setBeta(0.8);
        setSigma(0.02);
        break;
      default:
        break;
    }
  };

  const finalRoundData = simulationData[simulationData.length - 1] || {
    baseline: 75,
    powerBiased: 60,
    polarized: 30,
    idealConsensus: 92,
  };

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-5">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              稳定性仪表盘
            </span>
            <h3 className="text-sm font-serif font-bold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>不同假设变量下的系统稳定性趋势对比 (Recharts)</span>
            </h3>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            基于李雅普诺夫能量函数与软系统张力聚敛方程，动态推演在不同协商强度与权力倾斜下的系统渐近稳定性趋势。
          </p>
        </div>

        {/* KaTeX formula badge */}
        <div className="bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-700 flex items-center space-x-2 shrink-0">
          <span className="text-slate-400">稳定度模型:</span>
          <KatexFormula math="S(t) = \left[1 - \frac{\bar{D}(t)}{D_{\max}}\right] \times 100\%" />
        </div>
      </div>

      {/* Preset Scenario Selector Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-500 font-medium mr-1 flex items-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>预设假设场景:</span>
        </span>
        <button
          onClick={() => applyPreset('standard')}
          className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
            activePreset === 'standard'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
              : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          标准 Checkland 协调 (α=0.22, β=1.0)
        </button>
        <button
          onClick={() => applyPreset('strong_power')}
          className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
            activePreset === 'strong_power'
              ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
              : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          强权主导压制 (α=0.35, β=1.8)
        </button>
        <button
          onClick={() => applyPreset('polarized')}
          className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
            activePreset === 'polarized'
              ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
              : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          无调解极化对抗 (α=0.08, β=0.4)
        </button>
        <button
          onClick={() => applyPreset('high_consensus')}
          className={`px-2.5 py-1 text-xs rounded-lg border font-medium transition-all ${
            activePreset === 'high_consensus'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-stone-50 text-slate-600 border-stone-200 hover:bg-stone-100'
          }`}
        >
          理想多方共识 (α=0.42, β=0.8)
        </button>
        <button
          onClick={() => applyPreset('standard')}
          className="ml-auto text-xs text-slate-400 hover:text-slate-700 flex items-center space-x-1"
          title="重置参数"
        >
          <RotateCcw className="w-3 h-3" />
          <span>重置变量</span>
        </button>
      </div>

      {/* Main Grid: Left Controls + Right Recharts Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Hypothesis Variable Sliders (4 cols) */}
        <div className="lg:col-span-4 bg-stone-50/70 rounded-xl p-4 border border-stone-200 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-700">
            <Sliders className="w-3.5 h-3.5 text-indigo-600" />
            <span>假设变量微调 (Parameters)</span>
          </div>

          {/* Variable 1: Alpha (Convergence rate) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1">
                <span>协商收敛强度</span>
                <KatexFormula math="\alpha" />
              </span>
              <span className="font-mono font-bold text-indigo-600 text-[11px]">{alpha.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.50"
              step="0.01"
              value={alpha}
              onChange={(e) => {
                setAlpha(parseFloat(e.target.value));
                setActivePreset('custom');
              }}
              className="w-full accent-indigo-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.05 (缓慢辩论)</span>
              <span>0.50 (强力凝聚)</span>
            </div>
          </div>

          {/* Variable 2: Beta (Power Asymmetry) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1">
                <span>权力极化偏置</span>
                <KatexFormula math="\beta" />
              </span>
              <span className="font-mono font-bold text-rose-600 text-[11px]">{beta.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="2.0"
              step="0.1"
              value={beta}
              onChange={(e) => {
                setBeta(parseFloat(e.target.value));
                setActivePreset('custom');
              }}
              className="w-full accent-rose-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.0 (绝对平等)</span>
              <span>2.0 (单寡头专断)</span>
            </div>
          </div>

          {/* Variable 3: Sigma (Environmental Perturbation Noise) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 flex items-center gap-1">
                <span>环境随机扰动</span>
                <KatexFormula math="\sigma" />
              </span>
              <span className="font-mono font-bold text-amber-600 text-[11px]">{sigma.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="0.25"
              step="0.01"
              value={sigma}
              onChange={(e) => {
                setSigma(parseFloat(e.target.value));
                setActivePreset('custom');
              }}
              className="w-full accent-amber-600 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.0 (封闭纯粹)</span>
              <span>0.25 (高频突发干扰)</span>
            </div>
          </div>

          {/* Variable 4: Horizon Rounds */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600">推演迭代轮次 (T)</span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">{rounds} 轮</span>
            </div>
            <input
              type="range"
              min="6"
              max="20"
              step="1"
              value={rounds}
              onChange={(e) => setRounds(parseInt(e.target.value))}
              className="w-full accent-slate-800 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>6 轮 (短期)</span>
              <span>20 轮 (长远演化)</span>
            </div>
          </div>

          {/* Stability State Preview Cards */}
          <div className="pt-3 border-t border-stone-200 space-y-2">
            <div className="text-[11px] font-semibold text-slate-600">各情景第 {rounds} 轮预测终态:</div>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div className="p-2 bg-indigo-50/70 border border-indigo-200 rounded-lg">
                <span className="block text-indigo-700 text-[10px]">标准协调</span>
                <strong className="text-indigo-900 text-sm">{finalRoundData.baseline}%</strong>
              </div>
              <div className="p-2 bg-rose-50/70 border border-rose-200 rounded-lg">
                <span className="block text-rose-700 text-[10px]">强权偏向</span>
                <strong className="text-rose-900 text-sm">{finalRoundData.powerBiased}%</strong>
              </div>
              <div className="p-2 bg-amber-50/70 border border-amber-200 rounded-lg">
                <span className="block text-amber-700 text-[10px]">极化对抗</span>
                <strong className="text-amber-900 text-sm">{finalRoundData.polarized}%</strong>
              </div>
              <div className="p-2 bg-emerald-50/70 border border-emerald-200 rounded-lg">
                <span className="block text-emerald-700 text-[10px]">理想共识</span>
                <strong className="text-emerald-900 text-sm">{finalRoundData.idealConsensus}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recharts Interactive Trend Comparison Chart (8 cols) */}
        <div className="lg:col-span-8 flex flex-col justify-between bg-stone-50/40 rounded-xl p-4 border border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block animate-pulse" />
              <span className="font-semibold text-slate-800">
                系统稳定性指数演化曲线 (Stability Index: 0% ~ 100%)
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Safe Threshold &ge; 70%
            </span>
          </div>

          {/* Recharts LineChart Container */}
          <div className="w-full h-72 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={simulationData}
                margin={{ top: 10, right: 25, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="round"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 100]}
                  unit="%"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  formatter={(value: any, name: any) => {
                    const labels: Record<string, string> = {
                      baseline: '标准协调假设',
                      powerBiased: '强权偏向假设',
                      polarized: '无调解极化假设',
                      idealConsensus: '理想共识假设',
                    };
                    return [`${value}%`, labels[name] || name];
                  }}
                  labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e2e8f0',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '8px' }}
                  formatter={(value) => {
                    const labels: Record<string, string> = {
                      baseline: '标准协调 (Baseline)',
                      powerBiased: '强权偏向 (Power-Biased)',
                      polarized: '无调解极化 (Polarization)',
                      idealConsensus: '理想共识 (Ideal Consensus)',
                    };
                    return labels[value] || value;
                  }}
                />
                {/* 70% Safe Line */}
                <ReferenceLine
                  y={70}
                  stroke="#10b981"
                  strokeDasharray="4 4"
                  label={{
                    value: '稳定安全线 (70%)',
                    fill: '#059669',
                    fontSize: 10,
                    position: 'insideTopRight',
                  }}
                />
                {/* 40% Danger Line */}
                <ReferenceLine
                  y={40}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={{
                    value: '崩溃临界线 (40%)',
                    fill: '#dc2626',
                    fontSize: 10,
                    position: 'insideBottomRight',
                  }}
                />

                {/* 4 Lines */}
                <Line
                  type="monotone"
                  dataKey="baseline"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#4f46e5' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="powerBiased"
                  stroke="#e11d48"
                  strokeWidth={2}
                  strokeDasharray="5 3"
                  dot={{ r: 2.5, fill: '#e11d48' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="polarized"
                  stroke="#d97706"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 2.5, fill: '#d97706' }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="idealConsensus"
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#059669' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Footer Diagnostic Note */}
          <div className="flex items-start space-x-2 bg-white rounded-lg p-3 border border-stone-200 mt-2 text-[11px] text-slate-600 leading-relaxed">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-800">动力学结论分析: </span>
              {finalRoundData.baseline >= 70 ? (
                <span>
                  当前协商强度下，标准协调方案在第 {rounds} 轮达到 <strong>{finalRoundData.baseline}%</strong> 的稳定性，顺利穿越安全阈值；反观强权主导方案易在后期因弱势方次生反抗导致稳定性徘徊在 {finalRoundData.powerBiased}%。
                </span>
              ) : (
                <span>
                  当前协商强度较弱（α={alpha}），系统稳定性增长较缓。建议在 CATWOE 中增加对核心执行者 (Actors) 的赋权机制以加速向心收敛。
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
