import React, { useState, useRef, useEffect } from 'react';
import { sendChat } from '../api/metroApi';
import { Send, MessageSquare, X, Minus, Bot } from 'lucide-react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hello There! I am MetroSheba AI. How can I help you navigate MRT-6 today?' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  //Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await sendChat(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Sorry, I am having trouble connecting to the station servers.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[2000] flex flex-col items-end">
      {isOpen ? (
        <div className="mb-4 flex h-[450px] w-[350px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between bg-green-700 p-4 text-white">
            <div className="flex items-center gap-2">
              <Bot size={20} />
              <span className="font-bold">MetroSheba AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:text-green-200">
              <Minus size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm ${
                  msg.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-slate-800 border border-slate-100'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && <div className="text-xs text-slate-400 italic">MetroSheba is thinking...</div>}
            <div ref={scrollRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="border-t p-3 bg-white flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about landmarks or stations..."
              className="flex-1 text-sm bg-slate-100 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-green-500"
            />
            <button type="submit" className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white shadow-lg hover:scale-110 transition-transform"
        >
          <MessageSquare size={28} />
        </button>
      )}
    </div>
  );
};

export default ChatBot;