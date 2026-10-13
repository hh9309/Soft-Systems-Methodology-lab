import React, { useState } from 'react';
import { useSSMLab } from '../context/SSMLabContext';
import {
  Sparkles,
  X,
  Send,
  BotMessageSquare,
  RefreshCw,
  Copy,
  Check,
  ShieldAlert,
  Settings,
  Cpu,
  Github,
  CheckCircle2,
} from 'lucide-react';

export const AiDiagnosisDrawer: React.FC = () => {
  const {
    activeCase,
    isAiDrawerOpen,
    setIsAiDrawerOpen,
    aiDiagnosticReport,
    setAiDiagnosticReport,
  } = useSSMLab();

  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [chatReplies, setChatReplies] = useState<string[]>([]);

  // Model settings
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'deepseek-v4-pro'>(() => {
    return (localStorage.getItem('ssm_selected_model') as any) || 'gemini-3.8-flash';
  });
  const [tempModel, setTempModel] = useState<'gemini-3.8-flash' | 'deepseek-v4-pro'>(() => {
    return (localStorage.getItem('ssm_selected_model') as any) || 'gemini-3.8-flash';
  });
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ssm_user_api_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState<string>(() => {
    return localStorage.getItem('ssm_user_api_key') || '';
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  if (!isAiDrawerOpen) return null;

  const requireKey = (): boolean => {
    const key = apiKey || localStorage.getItem('ssm_user_api_key') || '';
    if (!key.trim()) {
      setApiKeyError('所有大模型调用必须输入 API-Key 后方可调用！请在设置中输入您的 API-Key。');
      setTempApiKey(apiKey);
      setTempModel(selectedModel);
      setIsSettingsOpen(true);
      return false;
    }
    return true;
  };

  const handleRunScan = async () => {
    if (!requireKey()) return;
    setLoading(true);
    try {
      const activeKey = (apiKey || localStorage.getItem('ssm_user_api_key') || '').trim();
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({
          caseTitle: activeCase.title,
          model: selectedModel,
          apiKey: activeKey,
          situation: activeCase.unstructuredSituation,
          stakeholders: activeCase.stakeholders,
          catwoe: activeCase.catwoe,
          conceptualModel: activeCase.conceptualActivities,
          comparisonMatrix: activeCase.comparisonItems,
          proposedActions: activeCase.proposedActions,
        }),
      });
      const data = await res.json();
      setAiDiagnosticReport(data.report || '诊断生成完成。');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAskQuick = async (q: string) => {
    if (!requireKey()) return;
    setLoading(true);
    try {
      const activeKey = (apiKey || localStorage.getItem('ssm_user_api_key') || '').trim();
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': activeKey,
        },
        body: JSON.stringify({
          message: q,
          model: selectedModel,
          apiKey: activeKey,
          context: `案例：${activeCase.title}\n根定义：${activeCase.catwoe.rootDefinition}`,
        }),
      });
      const data = await res.json();
      setChatReplies((prev) => [...prev, data.reply || '无返回']);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleConfirmModel = () => {
    const trimmed = tempApiKey.trim();
    if (!trimmed) {
      setApiKeyError('所有大模型调用必须输入 API-Key 后方可调用！');
      return;
    }
    setApiKey(trimmed);
    setSelectedModel(tempModel);
    localStorage.setItem('ssm_user_api_key', trimmed);
    localStorage.setItem('ssm_selected_model', tempModel);
    setApiKeyError(null);
    setSaveSuccessMsg(`已切换至 ${tempModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}，Key 已就绪！`);
    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsSettingsOpen(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-white border-l border-stone-200 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-indigo-200 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <h3 className="text-xs font-bold text-slate-800">
                AI 随诊台 · SSM 临床专家
              </h3>
              <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800">
                {selectedModel === 'gemini-3.8-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 truncate max-w-[220px]">
              监测案例：《{activeCase.title}》
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          {/* Gear icon button */}
          <button
            onClick={() => {
              setTempModel(selectedModel);
              setIsSettingsOpen(true);
            }}
            className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-stone-200/60 transition-colors"
            title="设置大模型与密钥部署"
            aria-label="设置大模型"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleRunScan}
            disabled={loading}
            className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
            title="重新执行全维审计"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsAiDrawerOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
        {/* Quick Diagnostic Triggers */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            FAST AUDIT PROBES (快速随诊探针)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              onClick={() => handleAskQuick('诊断当前 CATWOE 中世界观 W 是否与核心转化 T 产生脱节？')}
              disabled={loading}
              className="text-[11px] p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 text-left"
            >
              🔍 W与T逻辑脱节诊断
            </button>
            <button
              onClick={() => handleAskQuick('评估提议的行动是否会破坏既有非正式权力利益格局？')}
              disabled={loading}
              className="text-[11px] p-2 rounded-lg bg-stone-50 hover:bg-stone-100 border border-stone-200 text-slate-700 text-left"
            >
              🛡️ 文化可行性阻力评估
            </button>
          </div>
        </div>

        {/* Diagnostic Report Display */}
        {aiDiagnosticReport ? (
          <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 relative group">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4 text-indigo-600" />
                <span>全维度软系统体检报告</span>
              </span>
              <button
                onClick={() => handleCopy(aiDiagnosticReport)}
                className="text-slate-400 hover:text-slate-700 text-[11px] flex items-center space-x-1"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制' : '复制'}</span>
              </button>
            </div>
            <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto pr-1">
              {aiDiagnosticReport}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-stone-50 rounded-xl border border-dashed border-stone-300 space-y-2">
            <BotMessageSquare className="w-8 h-8 text-indigo-400 mx-auto" />
            <h4 className="text-xs font-semibold text-slate-800">
              尚未执行全维度体检
            </h4>
            <p className="text-[11px] text-slate-500">
              点击下方按钮，由 {selectedModel === 'gemini-3.8-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'} 对当前案例进行深层世界观与文化可行性全面扫描。
            </p>
            <button
              onClick={handleRunScan}
              disabled={loading}
              className="mt-2 inline-flex items-center space-x-1 px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>开始全面体检</span>
            </button>
          </div>
        )}

        {/* Dynamic chat replies */}
        {chatReplies.map((r, i) => (
          <div key={i} className="bg-indigo-50/50 rounded-xl p-3.5 border border-indigo-100 text-xs text-slate-800 space-y-1">
            <span className="text-[10px] font-mono font-bold text-indigo-700">随诊建议 #{i + 1}</span>
            <p className="leading-relaxed whitespace-pre-wrap">{r}</p>
          </div>
        ))}
      </div>

      {/* Drawer Footer Input */}
      <div className="p-3 border-t border-stone-200 bg-stone-50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (inputVal) {
              handleAskQuick(inputVal);
              setInputVal('');
            }
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            placeholder={`[${selectedModel === 'gemini-3.8-flash' ? 'Gemini 3 Flash' : 'DeepSeek V4 Pro'}] 咨询问题...`}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="flex-1 text-xs px-3 py-2 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={loading || !inputVal.trim()}
            className="px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-medium disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>

      {/* Settings Modal inside Drawer */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-60 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <h3 className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                <Settings className="w-4 h-4 text-indigo-600" />
                <span>大模型引擎切换与 GitHub 部署配置</span>
              </h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {apiKeyError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs leading-relaxed">
                {apiKeyError}
              </div>
            )}

            {/* 1. API Key Input */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-700 block">1. 手工输入 API-Key</span>
              <input
                type="password"
                value={tempApiKey}
                onChange={(e) => {
                  setTempApiKey(e.target.value);
                  if (apiKeyError) setApiKeyError(null);
                }}
                placeholder="在此输入您的 API-Key..."
                className="w-full text-xs px-3 py-2 rounded-lg border border-stone-300 font-mono bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500">
                浏览器本地安全存储，所有大模型调用必须输入 API-Key 后方可调用。
              </p>
            </div>

            {/* 2. Models */}
            <div className="space-y-2">
              <span className="text-[11px] font-semibold text-slate-700 block">2. 选择大模型 (gemini 3 flash / deepseek-v4-pro)</span>
              <div className="grid grid-cols-2 gap-2">
                <div
                  onClick={() => setTempModel('gemini-3.8-flash')}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs ${
                    tempModel === 'gemini-3.8-flash'
                      ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/40 font-bold'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="text-slate-900">Gemini 3 Flash</div>
                  <div className="text-[10px] text-slate-500 font-normal mt-0.5">Google 旗舰架构</div>
                </div>

                <div
                  onClick={() => setTempModel('deepseek-v4-pro')}
                  className={`p-2.5 rounded-xl border cursor-pointer text-xs ${
                    tempModel === 'deepseek-v4-pro'
                      ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/40 font-bold'
                      : 'border-stone-200 bg-stone-50'
                  }`}
                >
                  <div className="text-slate-900">DeepSeek V4 Pro</div>
                  <div className="text-[10px] text-purple-600 font-normal mt-0.5">深度博弈推理</div>
                </div>
              </div>
            </div>

            {/* GitHub Deployment info */}
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 text-[11px] text-slate-600 space-y-1.5">
              <div className="font-semibold text-slate-800 flex items-center space-x-1">
                <Github className="w-3.5 h-3.5" />
                <span>GitHub 部署安全保障</span>
              </div>
              <p>
                API 密钥通过服务端环境变量保护，严禁前端硬编码。部署至 GitHub 时，可在 Repository Secrets 中配置 <code className="text-indigo-600">GEMINI_API_KEY</code> 与 <code className="text-purple-600">DEEPSEEK_API_KEY</code>。
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-stone-100">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-stone-100 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleConfirmModel}
                className="px-3.5 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-medium shadow-xs"
              >
                确认大模型
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
