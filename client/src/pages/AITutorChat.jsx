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
  MessageSquare
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { askAITutor, getChatHistory, clearChatHistory } from '../services/aiTutorService';

export const AITutorChat = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const activeTopic = searchParams.get('topic') || 'Fractions';
  const initialProblem = searchParams.get('problem') || '';

  const studentDisplayName = user?.name ? user.name.split(' ')[0] : (user?.fullName ? user.fullName.split(' ')[0] : 'there');

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'ai',
      text: `Hello ${studentDisplayName}! I'm your AdaptIQ AI Tutor. I'm trained with Socratic STEM pedagogy to help you master ${activeTopic}. Whether you want an everyday analogy, a step-by-step breakdown, or a practice puzzle, just ask!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Fetch persisted chat history on mount
  useEffect(() => {
    let isMounted = true;
    getChatHistory().then((res) => {
      if (isMounted && res.success && res.messages && res.messages.length > 0) {
        const historyFormatted = res.messages.map((m) => ({
          id: m._id,
          sender: m.role === 'user' ? 'user' : 'ai',
          text: m.content,
          timestamp: new Date(m.timestamp || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        setMessages(historyFormatted);
      }
    }).catch(() => {});

    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const suggestedPrompts = [
    "Explain this problem step-by-step",
    "Give me an intuitive real-world analogy",
    "Why was my previous answer wrong?",
    "Give me a similar practice problem"
  ];

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedHistory = [...messages, userMsg];
    setMessages(updatedHistory);
    setInputMessage('');
    setIsTyping(true);

    try {
      const response = await askAITutor({
        message: text,
        chatHistory: updatedHistory,
        context: {
          topic: activeTopic,
          problem: initialProblem
        }
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: response.text,
          source: response.source,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: "Let's focus on the fundamentals: Check the common denominator or initial variable isolation, and let's try the first step together!",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[calc(100vh-65px)] lg:h-screen">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-3">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-lg shadow-glow-primary"
          >
            <Sparkles className="w-5 h-5" />
          </motion.div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              AdaptIQ AI Tutor
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">24/7 Socratic learning assistant & step-by-step guide</p>
          </div>
        </div>

        {/* Dynamic Context Awareness Chip */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 hidden sm:inline">Active Context:</span>
          <Badge variant="primary" size="md">
            Topic: {activeTopic}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              await clearChatHistory();
              setMessages([{
                id: 'm_cleared',
                sender: 'ai',
                text: `Chat history cleared! What concept would you like to explore next?`,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }]);
            }}
            className="text-xs text-slate-500 hover:text-rose-600"
          >
            Clear Chat
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/practice?topic=${encodeURIComponent(activeTopic)}`)}
            className="text-xs"
          >
            Go to Practice
          </Button>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1">
        <AnimatePresence initial={false}>
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 shadow-subtle mt-1"
                  >
                    ✦
                  </motion.div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[70%] p-4 rounded-3xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white rounded-tr-md shadow-card'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-800 rounded-tl-md shadow-card whitespace-pre-line'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[10px] mt-1.5 block font-mono ${
                      isUser ? 'text-indigo-200 text-right' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  >
                    {m.timestamp}
                  </span>
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

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center font-bold text-xs">
              ✦
            </div>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-3 rounded-2xl shadow-subtle flex items-center gap-1.5 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-slate-500 dark:text-slate-400">AI Tutor is thinking...</span>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto flex-shrink-0 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500" /> Prompts:
        </span>
        {suggestedPrompts.map((p, idx) => (
          <motion.button
            key={idx}
            type="button"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleSendMessage(p)}
            className="whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-slate-850 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-cyan-300 font-semibold border border-slate-200/80 dark:border-slate-700 shadow-subtle transition-all"
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
        className="pt-2 pb-4 flex items-center gap-2 flex-shrink-0"
      >
        <input
          type="text"
          placeholder={`Ask the AI Tutor anything about ${activeTopic}...`}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          className="flex-1 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 dark:focus:border-cyan-400 shadow-subtle transition-colors"
        />
        <Button
          type="submit"
          variant="glow"
          size="lg"
          icon={Send}
          disabled={!inputMessage.trim()}
          className="px-6 shadow-glow-primary"
        >
          Send
        </Button>
      </form>
    </div>
  );
};
