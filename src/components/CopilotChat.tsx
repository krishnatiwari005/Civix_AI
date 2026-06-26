import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface CopilotChatProps {
  onSendMessage: (msg: string, history: {role: 'user' | 'model', content: string}[]) => Promise<string>;
}

export default function CopilotChat({ onSendMessage }: CopilotChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content: "Hello! I am **Civix Copilot**, your municipal intelligence advisor.\n\nI can analyze active civic complaints, check department response speeds, write summaries for executive meetings, or predict upcoming infrastructure failures. Try one of the suggested prompts below!"
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const chips = [
    "Which category has highest unresolved complaints?",
    "Which department is underperforming?",
    "Generate this week's summary report",
    "Predict next month's risk zones"
  ];

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg = text.trim();
    setInputValue('');
    const updatedMessages = [...messages, { role: 'user' as const, content: userMsg }];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      // Map history format to match endpoint (role: 'user' | 'model')
      const formattedHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));

      const reply = await onSendMessage(userMsg, formattedHistory);
      setMessages([...updatedMessages, { role: 'model', content: reply }]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        { role: 'model', content: "⚠️ Sorry, I encountered an issue connecting to my Gemini intelligence cluster. Please verify your `GEMINI_API_KEY` is configured." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Simple Markdown Parser for beautiful formatting
  const parseMarkdown = (text: string) => {
    return text.split('\n').map((line, lIdx) => {
      // Check for bullet lists
      if (line.trim().startsWith('* ')) {
        return (
          <li key={lIdx} className="ml-5 list-disc text-xs text-slate-700 leading-relaxed mb-1">
            {parseInlineMarkdown(line.trim().substring(2))}
          </li>
        );
      }
      // Check for numbered lists
      if (/^\d+\.\s/.test(line.trim())) {
        const content = line.trim().replace(/^\d+\.\s/, '');
        return (
          <li key={lIdx} className="ml-5 list-decimal text-xs text-slate-700 leading-relaxed mb-1">
            {parseInlineMarkdown(content)}
          </li>
        );
      }
      // Check for subheadings
      if (line.trim().startsWith('### ')) {
        return (
          <h4 key={lIdx} className="text-xs font-extrabold text-slate-800 mt-4 mb-2 uppercase tracking-wider">
            {parseInlineMarkdown(line.trim().substring(4))}
          </h4>
        );
      }
      if (line.trim().startsWith('## ')) {
        return (
          <h3 key={lIdx} className="text-sm font-bold text-slate-900 mt-5 mb-2.5">
            {parseInlineMarkdown(line.trim().substring(3))}
          </h3>
        );
      }
      if (line.trim().startsWith('# ')) {
        return (
          <h2 key={lIdx} className="text-base font-extrabold text-blue-600 mt-6 mb-3">
            {parseInlineMarkdown(line.trim().substring(2))}
          </h2>
        );
      }
      // Standard paragraph
      if (line.trim() === '') return <div key={lIdx} className="h-2" />;
      return (
        <p key={lIdx} className="text-xs text-slate-700 leading-relaxed mb-2">
          {parseInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Parse inline tags like **bold** and `code`
  const parseInlineMarkdown = (text: string) => {
    const parts = [];
    let currentText = text;
    let idx = 0;

    while (currentText.length > 0) {
      const boldMatch = currentText.match(/\*\*(.*?)\*\*/);
      const codeMatch = currentText.match(/`(.*?)`/);

      // Find first match
      const boldIndex = boldMatch ? currentText.indexOf(boldMatch[0]) : Infinity;
      const codeIndex = codeMatch ? currentText.indexOf(codeMatch[0]) : Infinity;

      if (boldIndex === Infinity && codeIndex === Infinity) {
        parts.push(<span key={idx++}>{currentText}</span>);
        break;
      }

      if (boldIndex < codeIndex) {
        // Bold match is first
        if (boldIndex > 0) {
          parts.push(<span key={idx++}>{currentText.substring(0, boldIndex)}</span>);
        }
        parts.push(<strong key={idx++} className="font-extrabold text-slate-900">{boldMatch![1]}</strong>);
        currentText = currentText.substring(boldIndex + boldMatch![0].length);
      } else {
        // Code match is first
        if (codeIndex > 0) {
          parts.push(<span key={idx++}>{currentText.substring(0, codeIndex)}</span>);
        }
        parts.push(<code key={idx++} className="bg-slate-100 text-blue-700 font-mono text-[10px] px-1.5 py-0.5 rounded-md font-bold">{codeMatch![1]}</code>);
        currentText = currentText.substring(codeIndex + codeMatch![0].length);
      }
    }

    return parts;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs h-[600px] flex flex-col justify-between" id="copilot">
      {/* Header */}
      <div className="bg-blue-600 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-xl text-white">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight">Civix Copilot Advisor</h3>
            <span className="text-[10px] font-bold text-blue-100 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" /> Powered by Gemini Flash
            </span>
          </div>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
        {messages.map((m, idx) => {
          const isModel = m.role === 'model';
          return (
            <div key={idx} className={`flex ${isModel ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex items-start space-x-3 max-w-[80%] ${isModel ? '' : 'flex-row-reverse space-x-reverse'}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isModel ? 'bg-blue-100 text-blue-700' : 'bg-slate-800 text-white'}`}>
                  {isModel ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                {/* Bubble */}
                <div className={`p-4 rounded-2xl shadow-2xs ${isModel ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none' : 'bg-blue-600 text-white rounded-tr-none'}`}>
                  {isModel ? (
                    <div>{parseMarkdown(m.content)}</div>
                  ) : (
                    <p className="text-xs leading-relaxed">{m.content}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none flex items-center space-x-2 text-xs font-semibold text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Copilot is analyzing data records...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      {/* Suggested prompts and inputs */}
      <div className="p-4 border-t border-slate-100 space-y-3.5">
        {/* Suggestion Chips */}
        <div className="flex flex-wrap gap-2">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full hover:bg-blue-100 hover:text-blue-800 transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input box */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="flex items-center space-x-2"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Copilot about infrastructure problems or department tasks..."
            className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
