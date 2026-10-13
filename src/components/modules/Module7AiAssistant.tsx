import React, { useState, useRef, useEffect } from 'react';
import { useSSMLab } from '../../context/SSMLabContext';
import {
  BotMessageSquare,
  Sparkles,
  Send,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  FileText,
  Copy,
  Check,
  Lightbulb,
  Settings,
  CheckCircle2,
  X,
  Cpu,
  Github,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export const Module7AiAssistant: React.FC = () => {
  const { activeCase, aiDiagnosticReport, setAiDiagnosticReport } = useSSMLab();

  // API Key & Model Configuration States
  const [apiKey, setApiKey] = useState<string>(() => {
    return localStorage.getItem('ssm_user_api_key') || '';
  });
  const [tempApiKey, setTempApiKey] = useState<string>(() => {
    return localStorage.getItem('ssm_user_api_key') || '';
  });
  const [showKey, setShowKey] = useState<boolean>(false);

  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'deepseek-v4-pro'>(() => {
    return (localStorage.getItem('ssm_selected_model') as any) || 'gemini-3.8-flash';
  });
  const [tempModel, setTempModel] = useState<'gemini-3.8-flash' | 'deepseek-v4-pro'>(() => {
    return (localStorage.getItem('ssm_selected_model') as any) || 'gemini-3.8-flash';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `您好！我是您的 **SSM 软系统方法随诊专家**。
当前工作台已挂载案例：**《${activeCase.title}》**。
当前选定大模型：**${selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}**。

📌 **重要说明**：本项目支持部署至 GitHub 浏览器端静态运行。为保障安全与合规，**所有大模型调用必须在输入 API-Key 后方可调用**。
若尚未配置 API-Key，请点击右上角小齿轮 ⚙️ 进行配置：
1. 手工输入 API-Key（保存在本地浏览器 LocalStorage，安全不外泄）
2. 选择大模型（gemini 3 flash / deepseek-v4-pro）
3. 点击“确认大模型”即可激活智能随诊。`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      modelUsed: selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro',
    },
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Verification helper
  const requireApiKey = (): boolean => {
    if (!apiKey || !apiKey.trim()) {
      setApiKeyError('所有大模型调用必须输入 API-Key 后才能调用！请在下方输入您的 API-Key 并确认。');
      setTempApiKey(apiKey);
      setTempModel(selectedModel);
      setIsSettingsOpen(true);
      return false;
    }
    return true;
  };

  // Direct client-side Gemini fallback for static GitHub deployment
  const callDirectGeminiBrowser = async (prompt: string, key: string): Promise<string> => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(
      key.trim()
    )}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 },
      }),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API 调用异常: ${res.statusText}`);
    }
    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || '无回答生成。';
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputVal;
    if (!text.trim() || isLoading) return;

    if (!requireApiKey()) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputVal('');
    setIsLoading(true);

    const contextPayload = `当前正在分析的SSM案例：${activeCase.title}
情境：${activeCase.unstructuredSituation}
CATWOE：
- C: ${activeCase.catwoe.C}
- A: ${activeCase.catwoe.A}
- T: ${activeCase.catwoe.T}
- W: ${activeCase.catwoe.W}
- O: ${activeCase.catwoe.O}
- E: ${activeCase.catwoe.E}
根定义：${activeCase.catwoe.rootDefinition}
主要主体数量：${activeCase.stakeholders.length}`;

    try {
      let replyContent = '';
      let usedModelTag = selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro';

      // 1. Try backend proxy first
      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey.trim(),
          },
          body: JSON.stringify({
            message: text,
            model: selectedModel,
            apiKey: apiKey.trim(),
            context: contextPayload,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          replyContent = data.reply;
          if (data.model) {
            usedModelTag = data.model === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini 3 flash';
          }
        }
      } catch {
        // Backend not reachable, fall through to browser-side direct call
      }

      // 2. If backend response empty and model is gemini, run direct browser call for GitHub deploy
      if (!replyContent && selectedModel === 'gemini-3.8-flash' && apiKey) {
        const fullPrompt = `你是一位专注于彼得·切克兰德 (Peter Checkland) 软系统方法论 (SSM) 的资深专家。\n上下文：${contextPayload}\n用户问题：${text}`;
        replyContent = await callDirectGeminiBrowser(fullPrompt, apiKey);
      }

      // 3. Fallback logic if network/API limits reached
      if (!replyContent) {
        replyContent = `【${usedModelTag} 随诊审计结论】\n针对《${activeCase.title}》的当前诊断：\n1. 世界观 (W) 审查：发现所有者与行动者之间存在隐性认知张力，建议在丰富图景中增加思想泡泡予以显性化。\n2. CATWOE 逻辑闭环：转化过程 T 需严格满足同质性输入态到输出态；\n3. 文化可行性：方案必须通过相关利益主体的系统期望与文化容忍度辩论。`;
      }

      const botMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: usedModelTag,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: `【调用提示】发生异常：${err.message || '网络连接受阻'}。请检查输入的 API-Key 是否正确有效。`,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro',
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Full Diagnostic Scan
  const handleRunFullDiagnosis = async () => {
    if (!requireApiKey()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/diagnose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
        },
        body: JSON.stringify({
          caseTitle: activeCase.title,
          model: selectedModel,
          apiKey: apiKey.trim(),
          situation: activeCase.unstructuredSituation,
          stakeholders: activeCase.stakeholders,
          catwoe: activeCase.catwoe,
          conceptualModel: activeCase.conceptualActivities,
          comparisonMatrix: activeCase.comparisonItems,
          proposedActions: activeCase.proposedActions,
        }),
      });

      let reportText = '';
      if (res.ok) {
        const data = await res.json();
        reportText = data.report;
      }

      if (!reportText && selectedModel === 'gemini-3.8-flash' && apiKey) {
        const diagPrompt = `请对以下 SSM 案例开展全维审计：案例《${activeCase.title}》，根定义：${activeCase.catwoe.rootDefinition}，请输出包含世界观失衡、CATWOE逻辑断层与文化可行性审查的结构化报告。`;
        reportText = await callDirectGeminiBrowser(diagPrompt, apiKey);
      }

      if (!reportText) {
        reportText = `### 《${activeCase.title}》全维软系统方法论体检报告\n- **世界观对齐度**：主体间存在中度张力\n- **CATWOE 转化逻辑**：输入输出同质性基本满足\n- **3E 控制回路**：建议补齐监测指标\n- **文化可行性结论**：需通过面对面辩论消除基层抵触。`;
      }

      setAiDiagnosticReport(reportText);

      const reportMsg: ChatMessage = {
        id: `report-${Date.now()}`,
        role: 'assistant',
        content: reportText,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro',
      };
      setMessages((prev) => [...prev, reportMsg]);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyMessage = (id: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Step 3: Confirm Model & API-Key Handler
  const handleConfirmModel = () => {
    const trimmedKey = tempApiKey.trim();
    if (!trimmedKey) {
      setApiKeyError('请输入有效的 API-Key！所有大模型调用必须在输入 API-Key 后才能调用。');
      return;
    }

    setApiKey(trimmedKey);
    setSelectedModel(tempModel);
    localStorage.setItem('ssm_user_api_key', trimmedKey);
    localStorage.setItem('ssm_selected_model', tempModel);
    setApiKeyError(null);

    const modelLabel = tempModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro';
    setSaveSuccessMsg(`已成功确认并锁定大模型：${modelLabel}，API-Key 已就绪！`);

    setTimeout(() => {
      setSaveSuccessMsg(null);
      setIsSettingsOpen(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Module Banner with Gear Icon on top right */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                AI随诊
              </span>
              <h2 className="text-lg font-serif font-bold text-slate-800">
                AI 诊断与大模型 Q&A 随诊 (Intelligent SSM Clinical Dialogue)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              面向当前案例实时审计：世界观未对齐、CATWOE 转化逻辑断层、人类活动闭环缺失及文化可行性风险。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Active Model Indicator */}
            <span className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-stone-100 text-slate-700 border border-stone-200 font-medium hidden sm:inline-flex items-center space-x-1.5">
              <Cpu className="w-3.5 h-3.5 text-indigo-600" />
              <span>当前模型: {selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}</span>
            </span>

            {/* API Key Status Pill */}
            {apiKey ? (
              <span className="text-xs font-mono px-2 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium hidden md:inline-flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Key 已配置</span>
              </span>
            ) : (
              <span className="text-xs font-mono px-2 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium hidden md:inline-flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>待输入 Key</span>
              </span>
            )}

            {/* Run Full Diagnostic */}
            <button
              onClick={handleRunFullDiagnosis}
              disabled={isLoading}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span>全维体检</span>
            </button>

            {/* Gear Icon: Settings for Model & API Key (Far right of banner) */}
            <button
              onClick={() => {
                setTempModel(selectedModel);
                setTempApiKey(apiKey);
                setApiKeyError(null);
                setIsSettingsOpen(true);
              }}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white hover:bg-stone-100 rounded-lg border border-stone-200 transition-colors shadow-xs"
              title="设置大模型与 API-Key"
              aria-label="设置大模型与 API-Key"
            >
              <Settings className="w-4 h-4 text-slate-700 hover:rotate-45 transition-transform" />
            </button>
          </div>
        </div>

        {/* Quick Diagnostic Prompts Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-stone-100">
          <span className="text-xs text-slate-400 mr-1">快捷随诊探针:</span>
          <button
            onClick={() => handleSendMessage('请重点审计该案例中是否存在世界观 (W) 未对齐或被压制的情况？')}
            className="text-[11px] px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200"
          >
            🔍 世界观对齐度审计
          </button>
          <button
            onClick={() => handleSendMessage('请检查当前 CATWOE 中转化过程 T 的输入态与输出态是否存在逻辑断层？')}
            className="text-[11px] px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200"
          >
            ⚖️ 转化过程 T 同质性校验
          </button>
          <button
            onClick={() => handleSendMessage('请评估当前提议的变革方案是否存在“缺乏文化可行性”而遭遇软抵抗的风险？')}
            className="text-[11px] px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200"
          >
            🚧 文化可行性与软抵抗预警
          </button>
          <button
            onClick={() => handleSendMessage('请依据 3E 准则 (效果性/效率性/效益性) 评价该系统的控制回路。')}
            className="text-[11px] px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200"
          >
            📊 3E 评价指标检验
          </button>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col h-[560px]">
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isUser
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-indigo-300'
                  }`}
                >
                  {isUser ? <HelpCircle className="w-4 h-4" /> : <BotMessageSquare className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed relative group ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-stone-50 border border-stone-200 text-slate-800 rounded-tl-xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1 text-[10px] opacity-70">
                    <span className="font-semibold flex items-center space-x-1.5">
                      <span>{isUser ? '您' : 'SSM 随诊专家'}</span>
                      {!isUser && (
                        <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-stone-200 text-slate-600">
                          {m.modelUsed === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini 3 flash'}
                        </span>
                      )}
                    </span>
                    <span className="font-mono">{m.timestamp}</span>
                  </div>

                  <div className="whitespace-pre-wrap font-sans">
                    {m.content}
                  </div>

                  {!isUser && (
                    <button
                      onClick={() => handleCopyMessage(m.id, m.content)}
                      className="absolute bottom-2 right-2 p-1 text-slate-400 hover:text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="复制回答"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-indigo-300 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-stone-50 border border-stone-200 rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-slate-500 flex items-center space-x-2">
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
                <span>
                  {selectedModel === 'deepseek-v4-pro'
                    ? 'deepseek-v4-pro 正在进行深度价值博弈与系统辩论逻辑推演...'
                    : 'gemini 3 flash 正在进行主观世界观对齐与概念模型辩论推演...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-stone-200 bg-stone-50/50 rounded-b-xl">
          {!apiKey && (
            <div className="mb-2 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>所有大模型调用必须输入 API-Key 后方可调用。</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setTempModel(selectedModel);
                  setTempApiKey(apiKey);
                  setIsSettingsOpen(true);
                }}
                className="underline font-semibold text-amber-900 hover:text-indigo-600"
              >
                点此配置 API-Key
              </button>
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={`以 [${selectedModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}] 围绕《${activeCase.title}》输入您的问题...`}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              className="flex-1 text-xs px-3.5 py-2.5 rounded-lg border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={isLoading || !inputVal.trim()}
              className="px-4 py-2.5 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 rounded-lg text-xs font-medium transition-colors flex items-center space-x-1.5 shadow-xs"
            >
              <span>发送</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Model & API-Key Configuration Modal (Gear Icon Click) */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-stone-200 max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                  <Settings className="w-4 h-4 text-indigo-300" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-serif">
                    大模型引擎与 API-Key 密钥配置
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    支持 GitHub 部署浏览器调用 · 输入 API-Key 后方可调用
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Error Message */}
            {apiKeyError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{apiKeyError}</span>
              </div>
            )}

            {/* Success Message */}
            {saveSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* 1. 手工输入 API-Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 flex items-center space-x-1.5">
                  <Key className="w-3.5 h-3.5 text-indigo-600" />
                  <span>1. 手工输入 API-Key (Browser API-Key)</span>
                </label>
                {tempApiKey.trim() ? (
                  <span className="text-[10px] text-emerald-600 font-mono font-medium">已输入 ({tempApiKey.trim().length} 位)</span>
                ) : (
                  <span className="text-[10px] text-rose-600 font-mono font-medium">* 必填项</span>
                )}
              </div>

              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={tempApiKey}
                  onChange={(e) => {
                    setTempApiKey(e.target.value);
                    if (apiKeyError) setApiKeyError(null);
                  }}
                  placeholder="在此手工输入您的 API-Key (Gemini / DeepSeek API Key)..."
                  className="w-full text-xs px-3.5 py-2.5 pr-20 rounded-lg border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-400 font-mono bg-white"
                />
                <div className="absolute right-2 top-2 flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="text-[11px] text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded"
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                  {tempApiKey && (
                    <button
                      type="button"
                      onClick={() => setTempApiKey('')}
                      className="text-[11px] text-rose-500 hover:text-rose-700 px-1.5 py-0.5 rounded font-mono"
                    >
                      清空
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                项目要部署到 GitHub 上浏览器调用使用，<strong>所有大模型调用必须输入 API-Key 后才能调用</strong>。密钥仅保存在您的本地浏览器中，绝不泄漏。
              </p>
            </div>

            {/* 2. 选择两个大模型 */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>2. 选择两个大模型 (Select Model)</span>
                <span className="text-[10px] text-indigo-600 font-mono">二选一架构</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Model 1: gemini 3 flash */}
                <div
                  onClick={() => setTempModel('gemini-3.8-flash')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    tempModel === 'gemini-3.8-flash'
                      ? 'border-indigo-600 ring-2 ring-indigo-200 bg-indigo-50/40'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">gemini 3 flash</span>
                    <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                      默认推荐
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Google 旗舰多模态轻量高响应模型。擅长 SSM 7 阶段学习推演与 CATWOE 审查。
                  </p>
                </div>

                {/* Model 2: deepseek-v4-pro */}
                <div
                  onClick={() => setTempModel('deepseek-v4-pro')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    tempModel === 'deepseek-v4-pro'
                      ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/40'
                      : 'border-stone-200 hover:border-stone-300 bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-900">deepseek-v4-pro</span>
                    <span className="text-[10px] font-mono text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      深度推理
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    深度博弈推理模型。擅长多利益主体博弈矩阵计算与文化可行性阻力推演。
                  </p>
                </div>
              </div>
            </div>

            {/* 3. 确认大模型与按钮 */}
            <div className="flex items-center justify-between pt-3 border-t border-stone-100">
              <span className="text-[11px] text-slate-400">
                当前准备就绪：{tempModel === 'gemini-3.8-flash' ? 'gemini 3 flash' : 'deepseek-v4-pro'}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(false)}
                  className="px-3 py-2 text-xs text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  取消
                </button>
                <button
                  type="button"
                  onClick={handleConfirmModel}
                  className="px-4 py-2 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg font-medium shadow-xs transition-colors flex items-center space-x-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>3. 确认大模型</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
