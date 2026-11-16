import React, { useState, useRef, useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  BrainCircuit, 
  Lightbulb, 
  RotateCcw, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  MessageSquare,
  Square,
  Copy,
  Check,
  Cpu,
  Layers,
  ChevronDown,
  RefreshCw,
  PlusCircle,
  Trash2,
  Clock,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { MathRenderer } from '../components/ui/MathRenderer';
import { 
  streamAITutorChat, 
  fetchAIModels, 
  fetchConversations, 
  createConversation,
  clearConversationMessages,
  deleteConversation 
} from '../services/aiGatewayService';

const TUTOR_MODES = [
  { id: 'explain', label: 'Explain', icon: Lightbulb, desc: 'Clear, direct conceptual breakdown' },
  { id: 'socratic', label: 'Socratic', icon: BrainCircuit, desc: 'Guided inquiry & probing hints' },
  { id: 'step_by_step', label: 'Step-by-Step', icon: Layers, desc: 'Scaffolded math & derivation' },
  { id: 'exam_prep', label: 'Exam Prep', icon: ShieldCheck, desc: 'High-yield points & scoring tips' },
  { id: 'debug', label: 'Debug Code', icon: Cpu, desc: 'Find logic & syntax errors' },
  { id: 'conceptual', label: 'Intuition', icon: BookOpen, desc: 'Everyday analogies & mental models' }
];

export const AITutorChat = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTopic = searchParams.get('topic') || 'Fractions & Equations';
  const activeSubject = searchParams.get('subject') || 'Science & Mathematics';
  const initialProblem = searchParams.get('problem') || '';

  const studentDisplayName = user?.name ? user.name.split(' ')[0] : (user?.fullName ? user.fullName.split(' ')[0] : 'there');

  // Conversation & AI state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [tutorMode, setTutorMode] = useState('explain');
  const [routingMode, setRoutingMode] = useState('auto'); // 'auto' | 'manual'
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [availableModels, setAvailableModels] = useState([]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  // Streaming & Message state
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${studentDisplayName}! I'm your AdaptIQ AI Tutor 3.0. I'm powered by intelligent multi-model routing to assist you across ${activeTopic}. Whether you want step-by-step math derivations, Socratic probing, or code debugging, pick a mode and ask away!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: { actualModel: 'gemini-3.8-flash', provider: 'gemini', mode: 'auto' }
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const chatEndRef = useRef(null);
  const activeStreamControllerRef = useRef(null);

  // Load available models and conversations on mount
  useEffect(() => {
    let isMounted = true;

    fetchAIModels().then((models) => {
      if (isMounted && models) {
        setAvailableModels(models);
        const defaultModel = models.find(m => m.isDefault && m.available) || models.find(m => m.available);
        if (defaultModel) setSelectedModel(defaultModel.id);
      }
    }).catch(() => {});

    fetchConversations().then((convs) => {
      if (isMounted && convs && convs.length > 0) {
        setConversations(convs);
        setActiveConversationId(convs[0].id);
      }
    }).catch(() => {});

    return () => {
      isMounted = false;
      if (activeStreamControllerRef.current) {
        activeStreamControllerRef.current.abort();
      }
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Context-aware prompt suggestions based on active tutor mode
  const getSuggestedPrompts = () => {
    switch (tutorMode) {
      case 'socratic':
        return [
          "Don't give me the answer, give me a clue",
          "What is the first step I should check?",
          "Can you test my understanding with a question?"
        ];
      case 'step_by_step':
        return [
          "Solve this step-by-step with intermediate checks",
          "Show all arithmetic calculations clearly",
          "How do I verify my answer at the end?"
        ];
      case 'exam_prep':
        return [
          "What is the most common exam mistake on this topic?",
          "Give me high-yield formulas to memorize",
          "How is this question typically graded?"
        ];
      case 'debug':
        return [
          "Where is the syntax or logic error in my code?",
          "Why does my loop terminate unexpectedly?",
          "What is the time complexity of this solution?"
        ];
      case 'conceptual':
        return [
          "Give me an intuitive real-world analogy",
          "Why does this physical or math rule work?",
          "How would you explain this to a 10-year-old?"
        ];
      default:
        return [
          "Explain the core concept in simple terms",
          "Show me a worked example with numbers",
          "Why was my previous answer incorrect?",
          "Give me a similar practice problem"
        ];
    }
  };

  const handleStartNewChat = async () => {
    try {
      if (activeStreamControllerRef.current) {
        activeStreamControllerRef.current.abort();
        activeStreamControllerRef.current = null;
        setIsStreaming(false);
      }
      const newConv = await createConversation({
        title: `Tutoring: ${activeTopic}`,
        subject: activeSubject,
        topic: activeTopic,
        tutorMode
      });
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      setMessages([
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: `Starting a fresh tutoring session on **${activeTopic}** (${tutorMode} mode). What question would you like to explore?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          metadata: { actualModel: selectedModel, mode: routingMode }
        }
      ]);
    } catch (e) {
      console.warn('Failed to create new conversation:', e);
    }
  };

  const handleClearChat = async () => {
    if (activeConversationId) {
      try {
        await clearConversationMessages(activeConversationId);
      } catch (e) {}
    }
    setMessages([
      {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: `Conversation cleared. Ready for your next question on ${activeTopic}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleStopGeneration = () => {
    if (activeStreamControllerRef.current) {
      activeStreamControllerRef.current.abort();
      activeStreamControllerRef.current = null;
      setIsStreaming(false);
    }
  };

  const handleCopyText = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSendMessage = (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isStreaming) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const aiPlaceholderId = `ai_${Date.now()}`;
    const aiPlaceholder = {
      id: aiPlaceholderId,
      sender: 'ai',
      text: '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      metadata: {
        mode: routingMode,
        requestedModel: routingMode === 'manual' ? selectedModel : undefined
      }
    };

    setMessages(prev => [...prev, userMsg, aiPlaceholder]);
    setInputMessage('');
    setIsStreaming(true);

    const controller = streamAITutorChat({
      message: text,
      conversationId: activeConversationId,
      subject: activeSubject,
      topic: activeTopic,
      tutorMode,
      mode: routingMode,
      requestedModel: routingMode === 'manual' ? selectedModel : null,
      studentContext: {
        currentProblem: initialProblem
      },
      onChunk: (chunk) => {
        setMessages(prev => {
          return prev.map(m => {
            if (m.id === aiPlaceholderId) {
              return { ...m, text: m.text + chunk };
            }
            return m;
          });
        });
      },
      onMetadata: (meta) => {
        setMessages(prev => {
          return prev.map(m => {
            if (m.id === aiPlaceholderId) {
              return {
                ...m,
                metadata: {
                  ...m.metadata,
                  ...meta,
                  actualModel: meta.actualModel || meta.selectedModel || m.metadata?.actualModel,
                  actualProvider: meta.actualProvider || meta.provider || m.metadata?.actualProvider,
                  fallbackActivated: meta.fallbackActivated !== undefined ? meta.fallbackActivated : m.metadata?.fallbackActivated
                }
              };
            }
            return m;
          });
        });
        if (meta.conversationId && !activeConversationId) {
          setActiveConversationId(meta.conversationId);
        }
      },
      onError: (err) => {
        setIsStreaming(false);
        activeStreamControllerRef.current = null;
        setMessages(prev => {
          return prev.map(m => {
            if (m.id === aiPlaceholderId) {
              return {
                ...m,
                text: m.text ? m.text + `\n\n*(Stream interrupted: ${err.error})*` : `⚠️ ${err.error}`,
                isError: true
              };
            }
            return m;
          });
        });
      },
      onDone: (summary) => {
        setIsStreaming(false);
        activeStreamControllerRef.current = null;
        if (summary?.conversationId && !activeConversationId) {
          setActiveConversationId(summary.conversationId);
        }
      }
    });

    activeStreamControllerRef.current = controller;
  };

  const configuredModels = availableModels.filter(m => m.available);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 py-6 flex flex-col h-[calc(100vh-65px)] lg:h-screen">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-glow-primary flex-shrink-0"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                AdaptIQ AI Tutor 3.0
              </h1>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Gateway
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Context-aware multi-model intelligence & Socratic tutoring</p>
          </div>
        </div>

        {/* Model Selector & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* AUTO vs MANUAL Toggle Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold hover:border-indigo-500 shadow-sm transition-all"
            >
              <Cpu className="w-3.5 h-3.5 text-indigo-500" />
              <span>
                {routingMode === 'auto' ? 'Auto Model Routing' : `Model: ${selectedModel}`}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 p-2 space-y-1">
                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Routing Preference
                </div>

                {/* Option 1: AUTO Mode */}
                <button
                  type="button"
                  onClick={() => {
                    setRoutingMode('auto');
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    routingMode === 'auto'
                      ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>AUTO (Recommended)</span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-normal">Intelligently routes by intent & latency</p>
                  </div>
                  {routingMode === 'auto' && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </button>

                <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Manual Models ({configuredModels.length} Configured)
                </div>

                {/* Option 2: Configured Models List */}
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {configuredModels.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedModel(m.id);
                        setRoutingMode('manual');
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        routingMode === 'manual' && selectedModel === m.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="uppercase text-[9px] font-mono px-1 py-0.2 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                            {m.provider}
                          </span>
                          <span>{m.name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-normal">{m.description?.slice(0, 40)}...</p>
                      </div>
                      {routingMode === 'manual' && selectedModel === m.id && (
                        <Check className="w-3.5 h-3.5 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleStartNewChat}
            icon={PlusCircle}
            className="text-xs"
          >
            New Chat
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleClearChat}
            icon={Trash2}
            className="text-xs text-slate-500 hover:text-rose-600"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Tutor Mode Selector Tabs */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 border-b border-slate-100 dark:border-slate-800/80">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
          Pedagogy:
        </span>
        {TUTOR_MODES.map((mode) => {
          const Icon = mode.icon;
          const isActive = tutorMode === mode.id;
          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => setTutorMode(mode.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-sm scale-102'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title={mode.desc}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{mode.label}</span>
            </button>
          );
        })}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto py-5 space-y-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-subtle mt-1">
                    ✦
                  </div>
                )}

                <div
                  className={`max-w-[90%] sm:max-w-[78%] p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-md shadow-card'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-md shadow-card'
                  }`}
                >
                  {/* Content with LaTeX Math & Linebreaks */}
                  <div className="whitespace-pre-line">
                    <MathRenderer content={m.text || (isStreaming ? 'Thinking...' : '')} />
                  </div>

                  {/* Message Footer: Timestamp & Metadata Badge */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3 text-[10px]">
                    <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
                      <span>{m.timestamp}</span>
                      {m.metadata?.actualModel && (
                        <span className="flex items-center gap-1 font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          <Cpu className="w-2.5 h-2.5 text-indigo-500" />
                          {m.metadata.actualModel}
                          {m.metadata.fallbackActivated && (
                            <span className="text-amber-500 font-bold">(fallback)</span>
                          )}
                        </span>
                      )}
                      {m.metadata?.usage?.durationMs && (
                        <span className="flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {m.metadata.usage.durationMs}ms
                        </span>
                      )}
                    </div>

                    {!isUser && m.text && (
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.text, m.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-cyan-400 transition-colors"
                        title="Copy message"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span className="text-emerald-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-1">
                    {user?.fullName ? user.fullName[0] : (user?.name ? user.name[0] : 'U')}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Live Streaming Indicator & Stop Button */}
        {isStreaming && (
          <motion.div 
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between px-4 py-2 bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl"
          >
            <div className="flex items-center gap-2 text-xs text-indigo-700 dark:text-cyan-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-cyan-400 animate-pulse" />
              <span>Streaming token response...</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              icon={Square}
              onClick={handleStopGeneration}
              className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200 dark:border-rose-900"
            >
              Stop Generating
            </Button>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompts:
        </span>
        {getSuggestedPrompts().map((p, idx) => (
          <motion.button
            key={idx}
            type="button"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSendMessage(p)}
            disabled={isStreaming}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-cyan-300 font-medium border border-slate-200/80 dark:border-slate-700 shadow-subtle transition-all disabled:opacity-50"
          >
            {p}
          </motion.button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="pt-2 pb-3 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          placeholder={`Ask anything about ${activeTopic} (${tutorMode} mode)...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          disabled={isStreaming}
          className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-cyan-400 shadow-subtle transition-colors disabled:opacity-60"
        />
        <Button
          type="submit"
          variant="glow"
          size="lg"
          icon={Send}
          disabled={!inputMessage.trim() || isStreaming}
          className="px-6 shadow-glow-primary"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
