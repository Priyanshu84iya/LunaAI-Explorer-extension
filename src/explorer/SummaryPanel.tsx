import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Send, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import type { TopicResponse } from '../ai/types';

interface SummaryPanelProps {
  data: TopicResponse;
  onAskQuestion: (question: string) => void;
  onExplore: (topic: string) => void;
  onRegenerate: () => void;
}

export function SummaryPanel({ data, onAskQuestion, onExplore, onRegenerate }: SummaryPanelProps) {
  const [question, setQuestion] = useState('');

  const submit = () => {
    const q = question.trim();
    if (!q) return;
    onAskQuestion(q);
    setQuestion('');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-5 px-4 sm:px-5 py-5 overflow-y-auto luna-scroll"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="luna-label mb-2">Selected topic</p>
          <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight text-luna-text break-words leading-[0.95]">
            {data.topic}
          </h1>
          <span className="inline-block mt-4 border-[3px] border-luna-text bg-luna-accent2 text-luna-surface px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-widest shadow-brutal">
            {data.category}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onRegenerate}
            className="luna-brutal-btn flex items-center gap-1.5 px-3 py-2 bg-luna-surface text-luna-text font-mono text-xs font-bold uppercase tracking-widest"
            title="Regenerate explanation"
          >
            <RefreshCw size={14} strokeWidth={3} />
            Refresh
          </button>
        </div>
      </div>

      <div className="border-[3px] border-luna-text bg-luna-accent4 shadow-brutal p-4 sm:p-5">
        <p className="luna-label mb-3">Summary</p>
        <p className="text-base sm:text-lg font-medium leading-relaxed text-luna-text">{data.summary}</p>
      </div>

      {data.suggestedQuestions.length > 0 && (
        <div>
          <p className="luna-label mb-2 flex items-center gap-1">
            <Sparkles size={12} strokeWidth={3} /> What do you want to know?
          </p>
          <div className="flex flex-col gap-2">
            {data.suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => onAskQuestion(q)}
                className="luna-brutal-btn flex items-center justify-between gap-3 px-4 py-3 bg-luna-accent2 text-luna-surface font-display text-sm sm:text-base font-bold uppercase tracking-wide text-left"
              >
                <span className="min-w-0">{q}</span>
                <span className="shrink-0 text-lg leading-none">↗</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {data.keyConcepts.length > 0 && (
        <div>
          <p className="luna-label mb-2">Key concepts</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.keyConcepts.map((c, i) => (
              <div
                key={c}
                className="luna-brutal-btn flex items-center gap-3 px-3 py-3 bg-luna-surface text-luna-text"
              >
                <span className="flex items-center justify-center w-11 h-11 border-[3px] border-luna-text bg-luna-accent font-mono text-base font-black shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-display text-sm font-bold uppercase tracking-wide leading-tight">{c}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.relatedTopics.length > 0 && (
        <div>
          <p className="luna-label mb-2 flex items-center gap-1">
            <Sparkles size={12} strokeWidth={3} /> Explore next
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.relatedTopics.map((t, i) => (
              <button
                key={t}
                onClick={() => onExplore(t)}
                className={`luna-brutal-btn flex items-center justify-between gap-2 px-3 py-3 text-luna-text font-display text-sm font-bold uppercase tracking-wide text-left ${
                  ['bg-luna-accent', 'bg-luna-accent3', 'bg-luna-accent4', 'bg-luna-accent5'][i % 4]
                }`}
              >
                <span className="min-w-0 truncate">{t}</span>
                <ChevronRight size={16} strokeWidth={3} className="shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {data.explorationOptions.length > 0 && (
        <div>
          <p className="luna-label mb-2">Go deeper</p>
          <div className="flex flex-wrap gap-2">
            {data.explorationOptions.map((o) => (
              <button
                key={o}
                onClick={() => onAskQuestion(o)}
                className="luna-brutal-btn px-3 py-2 bg-luna-accent5 text-luna-text font-mono text-xs font-bold uppercase tracking-wide text-left"
              >
                {o}
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="mt-auto flex items-stretch gap-0 border-[3px] border-luna-text bg-luna-surface shadow-brutal"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="ASK SOMETHING ABOUT THIS TOPIC..."
          className="flex-1 min-w-0 px-3 py-3 bg-luna-surface text-sm font-mono font-bold uppercase text-luna-text placeholder:text-luna-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={!question.trim()}
          className="flex items-center gap-1.5 px-4 py-3 bg-luna-accent text-luna-text text-sm font-black uppercase tracking-wide transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          title="Ask LunaAI"
        >
          <Send size={16} strokeWidth={3} />
          Ask
        </button>
      </form>
    </motion.div>
  );
}
