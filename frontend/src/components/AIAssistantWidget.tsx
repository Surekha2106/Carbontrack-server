import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, User as UserIcon, Loader2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

const parseMarkdown = (text: string) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let parsedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    if (parsedLine.trim().startsWith('* ')) {
      parsedLine = parsedLine.replace('* ', '');
      return (
        <div key={i} className="flex gap-2 mb-1 ml-2">
          <span className="text-emerald-500">•</span>
          <span dangerouslySetInnerHTML={{ __html: parsedLine }} />
        </div>
      );
    }
    return <p key={i} className="mb-2 last:mb-0 min-h-[1em]" dangerouslySetInnerHTML={{ __html: parsedLine }} />;
  });
};

export function AIAssistantWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your CarbonTrack AI Assistant. I can help you analyze your carbon footprint and suggest ideas to balance high consumption. How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([
    "How can I reduce my transportation emissions?",
    "Tips for eco-friendly shopping?",
    "Lower my energy bill footprint"
  ]);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Analyze deep user activities for personalized prompts
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get('/analytics/summary');
        const topCategories = res.data.topCategories || [];
        if (topCategories.length > 0) {
          const dynamicSuggestions = topCategories.slice(0, 3).map((cat: any) => 
            `How can I reduce my ${cat.category.toLowerCase()} footprint?`
          );
          if (dynamicSuggestions.length < 3) {
            dynamicSuggestions.push("What are the best general eco-friendly habits?");
          }
          setSuggestions(dynamicSuggestions);
        }
      } catch (err) {
        // Fallback to default suggestions
      }
    };
    fetchAnalytics();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend: string = input) => {
    if (!textToSend.trim()) return;

    setHasInteracted(true);
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMessage]);
    if (textToSend === input) setInput('');
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://${window.location.hostname}:8080/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: userMessage.text }),
      });

      if (response.status === 401) {
        throw new Error('401');
      }
      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.text();
      const aiMessage: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: data };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      const isAuthError = error.message === '401';
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: isAuthError 
          ? 'Please log in to receive personalized suggestions.' 
          : 'Sorry, I am having trouble connecting right now. Please try again later.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors z-50 flex items-center justify-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[500px] max-h-[80vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-emerald-600 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h3 className="font-semibold text-lg">AI Assistant</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-emerald-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                    }`}
                  >
                    {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-tl-sm'
                    }`}
                  >
                    {msg.sender === 'user' ? (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="text-sm leading-relaxed">
                        {parseMarkdown(msg.text)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">Typing...</span>
                  </div>
                </div>
              )}
              
              {!hasInteracted && suggestions.length > 0 && (
                <div className="flex flex-col gap-2 mt-4">
                  <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mb-1">
                    <Sparkles className="w-3 h-3" /> Personalized Suggestions
                  </p>
                  {suggestions.map((sug, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(sug)}
                      className="text-left text-sm bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-50 rounded-xl px-4 py-2 transition-colors shadow-sm"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask for suggestions..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
