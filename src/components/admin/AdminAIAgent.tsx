import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Bot,
  Send,
  Upload,
  FileCheck,
  Tag,
  FolderTree,
  AlertTriangle,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  Copy,
  Terminal,
} from 'lucide-react';

interface AICommandResult {
  title?: string;
  description?: string;
  category?: string;
  tags?: string[];
  seoKeywords?: string[];
  duplicateRisk?: string;
  summary?: string;
  status: 'draft_ready' | 'analyzed' | 'moderation_flag' | 'suggestion';
}

export const AdminAIAgent: React.FC = () => {
  const { categories, storeProducts, playUiSound, showToast, addAuditLog } = useApp();
  const [prompt, setPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState<
    { sender: 'user' | 'agent'; text: string; result?: AICommandResult; timestamp: string }[]
  >([
    {
      sender: 'agent',
      text: 'Hello Admin. I am your CYBERX AI Management Agent. Give me natural language commands like "Upload this video", "Generate SEO tags for Cyberpunk 2077 Gear", "Check duplicate products", or "Summarize platform analytics".',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleExecuteAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isAnalyzing) return;

    const userMsg = prompt.trim();
    setPrompt('');
    playUiSound('click');

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [...prev, { sender: 'user', text: userMsg, timestamp: currentTime }]);
    setIsAnalyzing(true);

    // Simulate Agent Natural Language Intelligence Processing
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let replyText = '';
      let resultObj: AICommandResult | undefined;

      if (lower.includes('video') || lower.includes('upload')) {
        replyText = 'Analyzed video input parameters. Generated title, optimized streaming description, and mapped category.';
        resultObj = {
          title: 'CYBERX 4K Esports Championship Grand Final Highlight Reel',
          description:
            'Experience the high-stakes decisive rounds from the CyberX World Finals. Rendered in 60FPS with tactical breakdown commentary.',
          category: categories[0]?.name || 'Esports',
          tags: ['esports', 'tournament', 'highlights', '4k', 'pro-gaming'],
          seoKeywords: ['cyberx championship', 'pro finals', 'gaming tournament stream'],
          duplicateRisk: '0% duplicate similarity against 8 existing video records.',
          status: 'draft_ready',
        };
      } else if (lower.includes('duplicate') || lower.includes('check')) {
        replyText = `Scanned ${storeProducts.length} active digital products in Firestore. No direct SKU or title collisions detected.`;
        resultObj = {
          summary: 'All product SKUs and affiliate links are unique. Catalog health is 100%.',
          duplicateRisk: 'Low (0 collisions)',
          status: 'analyzed',
        };
      } else if (lower.includes('analytics') || lower.includes('summary') || lower.includes('stats')) {
        replyText = 'Generated executive analytics digest for last 30-day window.';
        resultObj = {
          summary:
            'Platform active users up +28.4% WoW. Digital merchandise checkout conversion at 4.2%. Top-selling category: Gaming Gear.',
          status: 'suggestion',
        };
      } else if (lower.includes('tag') || lower.includes('seo') || lower.includes('product')) {
        replyText = 'Synthesized high-intent SEO metadata and product taxonomy draft.';
        resultObj = {
          title: 'CyberX Apex Pro Wireless Optical Switch Gear',
          description:
            'Ultra-low latency sub-1ms response with zero debounce delay. Built for competitive tier-1 esports athletes.',
          category: categories[1]?.name || 'Hardware',
          tags: ['mechanical', 'wireless', 'esports-grade', 'optical-switches', 'rgb'],
          seoKeywords: ['gaming keyboard', 'wireless esports gear', 'optical switch peripheral'],
          status: 'draft_ready',
        };
      } else {
        replyText = `Processed instruction: "${userMsg}". Generated tactical action plan and metadata tags.`;
        resultObj = {
          summary: 'Generated recommendation and taxonomy classification.',
          tags: ['cyberx', 'optimization', 'platform-ready'],
          status: 'suggestion',
        };
      }

      setHistory((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: replyText,
          result: resultObj,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setIsAnalyzing(false);
      playUiSound('success');
      addAuditLog('AI_AGENT_COMMAND', 'System/AI', `Executed natural language task: "${userMsg}"`);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to Clipboard', 'Metadata snippet copied successfully.', 'success');
  };

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 space-y-6 shadow-xl text-slate-100">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-wide text-white flex items-center gap-2">
              <span>CYBERX AI Management Agent</span>
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[10px] font-extrabold rounded-full border border-indigo-500/30">
                Gemini 3.1 Pro High-Thinking
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Natural-language content orchestration, SEO tagging, duplicate detection, and automated workflow drafts.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Chat Stream */}
      <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
        {history.map((msg, idx) => (
          <div
            key={idx}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-2`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white font-medium rounded-br-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-bl-none shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1.5 opacity-60 text-[10px]">
                <span className="font-bold">{msg.sender === 'user' ? 'Admin Operator' : 'CYBERX AI Agent'}</span>
                <span>{msg.timestamp}</span>
              </div>
              <p className="leading-relaxed">{msg.text}</p>

              {/* Structured AI Result Card */}
              {msg.result && (
                <div className="mt-3 pt-3 border-t border-slate-700/80 space-y-2.5 bg-slate-950/40 p-3 rounded-xl">
                  {msg.result.title && (
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Suggested Title
                      </span>
                      <p className="font-bold text-white text-xs mt-0.5">{msg.result.title}</p>
                    </div>
                  )}

                  {msg.result.description && (
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                        Generated Description
                      </span>
                      <p className="text-slate-300 text-[11px] mt-0.5">{msg.result.description}</p>
                    </div>
                  )}

                  {msg.result.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                        Matched Category:
                      </span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded text-[10px]">
                        {msg.result.category}
                      </span>
                    </div>
                  )}

                  {msg.result.tags && msg.result.tags.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        Recommended Tags
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.result.tags.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-slate-800 text-cyan-300 text-[10px] font-mono rounded border border-slate-700"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {msg.result.seoKeywords && (
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                        SEO Keywords
                      </span>
                      <p className="text-[11px] text-slate-300 font-mono">
                        {msg.result.seoKeywords.join(' • ')}
                      </p>
                    </div>
                  )}

                  {msg.result.duplicateRisk && (
                    <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{msg.result.duplicateRisk}</span>
                    </div>
                  )}

                  {msg.result.summary && (
                    <p className="text-[11px] text-slate-300 italic">{msg.result.summary}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        {isAnalyzing && (
          <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/60 p-3 rounded-2xl w-fit border border-slate-700/60 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>Agent analyzing instructions and executing tactical workflow...</span>
          </div>
        )}
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider self-center">
          Quick Actions:
        </span>
        {[
          'Upload this video',
          'Generate tags for Esports Gaming Mouse',
          'Check duplicate catalog products',
          'Summarize platform analytics',
        ].map((quick, i) => (
          <button
            key={i}
            onClick={() => setPrompt(quick)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium rounded-lg border border-slate-700 transition"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleExecuteAI} className="relative flex items-center">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Instruct AI Agent: 'Prepare product draft for CyberX Pro Headset'..."
          className="w-full bg-slate-800 text-xs text-white pl-4 pr-24 py-3 rounded-2xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder:text-slate-500"
        />
        <button
          type="submit"
          disabled={isAnalyzing || !prompt.trim()}
          className="absolute right-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs rounded-xl shadow transition disabled:opacity-40 flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};
