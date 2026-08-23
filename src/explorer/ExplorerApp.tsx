import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ChevronRight, RefreshCw, X } from 'lucide-react';
import { ExplorerHeader } from './ExplorerHeader';
import { Breadcrumb } from './Breadcrumb';
import { SummaryPanel } from './SummaryPanel';
import { LoadingExperience } from './LoadingExperience';
import { AshnaAIProvider, loadDefaultSettings } from '../ai';
import type { AnswerResponse, SelectionContext, StageUpdate, TopicResponse } from '../ai/types';
import { generateFallbackExploration } from '../ai/fallbackGenerator';
import { ENV_CONFIG } from '../ai/config';

type ExplorerStatus = 'idle' | 'understanding' | 'preparing' | 'ready' | 'error';

interface DebugState {
  selectedText: string;
  status: ExplorerStatus;
  baseUrlConfigured: boolean;
  apiKeyConfigured: boolean;
  modelConfigured: boolean;
  requestSent: boolean;
  endpoint: string;
  httpStatus: number | null;
  error: string | null;
}

interface HistoryEntry {
  data: TopicResponse;
  label: string;
}

interface QAContent {
  question: string;
  answer: AnswerResponse;
}

export function ExplorerApp() {
  const [initPayload, setInitPayload] = useState<SelectionContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ExplorerStatus>('idle');
  const [stage, setStage] = useState<StageUpdate>({ stage: 'understanding', message: 'Understanding your topic...' });
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [index, setIndex] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [qa, setQa] = useState<QAContent | null>(null);
  const [qaLoading, setQaLoading] = useState(false);
  const [debug, setDebug] = useState<DebugState>({
    selectedText: '',
    status: 'idle',
    baseUrlConfigured: false,
    apiKeyConfigured: false,
    modelConfigured: false,
    requestSent: false,
    endpoint: '',
    httpStatus: null,
    error: null,
  });
  const providerRef = useRef<AshnaAIProvider | null>(null);
  const requestSeq = useRef(0);
  const abortRef = useRef<AbortController | null>(null);

  const current = index >= 0 ? history[index] : null;
  const data = current?.data ?? null;

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const d = event.data;
      if (!d || !d.type) return;
      if (d.type === 'LUNAAI_INIT') {
        setInitPayload(d.payload as SelectionContext);
      }
    };
    window.addEventListener('message', onMessage);
    // Announce readiness immediately so the content script sends the INIT
    // payload. Sending READY only after INIT would deadlock the handshake.
    window.parent?.postMessage({ type: 'LUNAAI_READY' }, '*');
    return () => window.removeEventListener('message', onMessage);
  }, []);

  useEffect(() => {
    if (!initPayload) return;
    let cancelled = false;
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('understanding');
    setStage({ stage: 'understanding', message: 'Understanding your topic...' });
    setLoading(true);
    setError(null);
    setDebug((prev) => ({
      ...prev,
      selectedText: initPayload.text,
      status: 'understanding',
      baseUrlConfigured: !!ENV_CONFIG.baseUrl,
      apiKeyConfigured: !!ENV_CONFIG.apiKey,
      modelConfigured: !!ENV_CONFIG.model,
      endpoint: `${ENV_CONFIG.baseUrl.replace(/\/$/, '')}/chat/completions`,
      requestSent: false,
      httpStatus: null,
      error: null,
    }));

    (async () => {
      try {
        console.log('[LunaAI] Selected text:', initPayload.text);
        console.log('[LunaAI] Starting exploration');
        console.log('[Debug] Base URL exists:', !!ENV_CONFIG.baseUrl);
        console.log('[Debug] API Key exists:', !!ENV_CONFIG.apiKey);
        console.log('[Debug] Model exists:', !!ENV_CONFIG.model);
        const settings = await loadDefaultSettings();
        if (cancelled) return;
        providerRef.current = new AshnaAIProvider(settings);
        console.log('[LunaAI] Starting AshnaAI request');
        setDebug((prev) => ({ ...prev, requestSent: true }));
        const seq = ++requestSeq.current;
        setStage({ stage: 'preparing', message: 'Preparing your explanation...' });
        const result = await providerRef.current.analyzeTopic(initPayload, {
          signal: controller.signal,
          onStage: (s) => {
            if (cancelled) return;
            setStage(s);
          },
        });
        if (cancelled || seq !== requestSeq.current) return;
        setHistory([{ data: result, label: result.topic }]);
        setIndex(0);
        setStatus('ready');
        console.log('[LunaAI] Rendering result');
        setDebug((prev) => ({ ...prev, status: 'ready' }));
      } catch (e) {
        if (cancelled) return;
        console.error('[LunaAI] Exploration failed:', e);
        const message = (e as Error).message || 'Failed to understand this topic.';
        setError(message);
        setStatus('error');
        setDebug((prev) => ({ ...prev, status: 'error', error: message }));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [initPayload]);

  const handleExplore = useCallback(
    async (topic: string) => {
      if (!providerRef.current || !data) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setLoading(true);
      setStatus('understanding');
      setStage({ stage: 'understanding', message: `Understanding ${topic}...` });
      setError(null);
      setQa(null);
      const seq = ++requestSeq.current;
      try {
        const result = await providerRef.current.exploreTopic(topic, data.topic, {
          signal: controller.signal,
        });
        if (seq !== requestSeq.current) return;
        const newHistory = history.slice(0, index + 1);
        newHistory.push({ data: result, label: result.topic });
        setHistory(newHistory);
        setIndex(newHistory.length - 1);
        setStatus('ready');
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setError((e as Error).message || 'Could not explore further');
        setStatus('error');
      } finally {
        if (seq === requestSeq.current) setLoading(false);
      }
    },
    [data, history, index],
  );

  const handleAskQuestion = useCallback(
    async (question: string) => {
      if (!providerRef.current || !data) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setQaLoading(true);
      setError(null);
      setQa({ question, answer: { answer: 'Thinking...' } });
      const seq = ++requestSeq.current;
      try {
        const answer = await providerRef.current.askQuestion(question, data.topic, data.summary);
        if (seq !== requestSeq.current) return;
        setQa({ question, answer });
      } catch (e) {
        if (seq !== requestSeq.current) return;
        setQa({
          question,
          answer: { answer: (e as Error).message || 'Could not answer that question.' },
        });
      } finally {
        if (seq === requestSeq.current) setQaLoading(false);
      }
    },
    [data],
  );

  const navigateTo = (i: number) => {
    setIndex(i);
    setQa(null);
  };

  const close = () => {
    window.parent?.postMessage({ type: 'LUNAAI_CLOSE' }, '*');
  };

  const goBack = () => {
    if (index > 0) navigateTo(index - 1);
  };

  const goForward = () => {
    if (index < history.length - 1) navigateTo(index + 1);
  };

  const regenerate = async () => {
    if (!initPayload || !providerRef.current) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setStatus('understanding');
    setStage({ stage: 'understanding', message: 'Understanding your topic...' });
    setError(null);
    setQa(null);
    const seq = ++requestSeq.current;
    try {
      const result = await providerRef.current.analyzeTopic(initPayload, {
        signal: controller.signal,
      });
      if (seq !== requestSeq.current) return;
      setHistory([{ data: result, label: result.topic }]);
      setIndex(0);
      setStatus('ready');
    } catch (e) {
      if (seq !== requestSeq.current) return;
      setError((e as Error).message);
      setStatus('error');
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  };

  const useFallback = () => {
    if (!initPayload) return;
    abortRef.current?.abort();
    setLoading(true);
    setStatus('preparing');
    setError(null);
    setQa(null);
    const result = generateFallbackExploration(initPayload.text, initPayload);
    setHistory([{ data: result, label: result.topic }]);
    setIndex(0);
    setStatus('ready');
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
    >
      <div className="absolute inset-0 bg-luna-text/60" onClick={close} />

      <motion.div
        className="relative w-full max-w-4xl h-[90vh] max-h-[820px] glass shadow-glow-soft flex flex-col overflow-hidden"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
      >
        <ExplorerHeader onClose={close} />

        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <LoadingExperience stage={stage} />
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
            <div className="flex items-center justify-center w-16 h-16 mb-5 border-[3px] border-luna-text bg-luna-error shadow-brutal text-3xl">
              ⚠
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-black uppercase tracking-tight text-luna-text">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-luna-muted max-w-sm">{error}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={regenerate}
                className="luna-brutal-btn flex items-center gap-2 px-4 py-2.5 bg-luna-accent text-luna-text text-sm font-black uppercase tracking-wide"
              >
                <RefreshCw size={15} strokeWidth={3} /> Retry
              </button>
              <button
                onClick={useFallback}
                className="luna-brutal-btn px-4 py-2.5 bg-luna-surface text-luna-text text-sm font-bold uppercase tracking-wide"
              >
                Use Basic Explanation
              </button>
              <button
                onClick={close}
                className="luna-brutal-btn px-4 py-2.5 bg-luna-surface text-luna-text text-sm font-bold uppercase tracking-wide"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {!loading && !error && data && (
          <>
            <Breadcrumb trail={history.map((h) => h.label)} onNavigate={navigateTo} />

            <div className="flex-1 overflow-hidden relative">
              <AnimatePresence mode="wait">
                {qa ? (
                  <motion.div
                    key="qa"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 overflow-y-auto luna-scroll px-5 py-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="luna-label">Your question</p>
                      <button
                        onClick={() => setQa(null)}
                        className="luna-brutal-btn flex items-center gap-1 px-2.5 py-1.5 bg-luna-surface text-luna-text font-mono text-xs font-bold uppercase tracking-wide"
                      >
                        <X size={14} strokeWidth={3} /> Back to topic
                      </button>
                    </div>
                    <div className="border-[3px] border-luna-text bg-luna-accent shadow-brutal p-3 mb-4">
                      <p className="font-display text-lg font-black uppercase tracking-tight text-luna-text">{qa.question}</p>
                    </div>
                    <div className="border-[3px] border-luna-text bg-luna-surface shadow-brutal p-4">
                      <p className="text-sm leading-relaxed text-luna-text">
                        {qa.answer.answer}
                        {qaLoading && <span className="ml-1 animate-pulse">▍</span>}
                      </p>
                    </div>
                    {qa.answer.relatedTopics && qa.answer.relatedTopics.length > 0 && (
                      <div className="mt-4">
                        <p className="luna-label mb-2">Related topics</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {qa.answer.relatedTopics.map((t) => (
                            <button
                              key={t}
                              onClick={() => handleExplore(t)}
                              className="luna-brutal-btn flex items-center justify-between gap-2 px-3 py-2 bg-luna-accent3 text-luna-text font-mono text-xs font-bold uppercase tracking-wide text-left"
                            >
                              <span className="min-w-0 truncate">{t}</span>
                              <ChevronRight size={14} strokeWidth={3} className="shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {qa.answer.suggestedQuestions && qa.answer.suggestedQuestions.length > 0 && (
                      <div className="mt-4">
                        <p className="luna-label mb-2">Keep asking</p>
                        <div className="flex flex-wrap gap-2">
                          {qa.answer.suggestedQuestions.map((q) => (
                            <button
                              key={q}
                              onClick={() => handleAskQuestion(q)}
                              className="luna-brutal-btn px-3 py-2 bg-luna-accent2 text-luna-surface font-mono text-xs font-bold uppercase tracking-wide text-left"
                            >
                              {q}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="topic"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 overflow-y-auto luna-scroll"
                  >
                    <SummaryPanel
                      data={data}
                      onAskQuestion={handleAskQuestion}
                      onExplore={handleExplore}
                      onRegenerate={regenerate}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-t-[3px] border-luna-text bg-luna-surface">
              <button
                onClick={goBack}
                disabled={index === 0}
                className="luna-brutal-btn flex items-center gap-1.5 px-3 py-2 bg-luna-surface text-luna-text font-mono text-sm font-bold uppercase tracking-wide"
              >
                <ArrowLeft size={15} strokeWidth={3} /> Back
              </button>
              <span className="font-mono text-xs font-bold text-luna-muted">
                {index + 1} / {history.length}
              </span>
              <button
                onClick={goForward}
                disabled={index >= history.length - 1}
                className="luna-brutal-btn flex items-center gap-1.5 px-3 py-2 bg-luna-surface text-luna-text font-mono text-sm font-bold uppercase tracking-wide"
              >
                Forward <ArrowRight size={15} strokeWidth={3} />
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
