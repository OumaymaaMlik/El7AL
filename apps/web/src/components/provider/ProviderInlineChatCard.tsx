import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useMissionChat } from '../../hooks/useMissionChat';
import type { ChatMessage } from '../../lib/mission';

interface ProviderInlineChatCardProps {
  missionId: string;
  clientFirstName?: string;
  initialMessages?: ChatMessage[];
}

export const ProviderInlineChatCard: React.FC<ProviderInlineChatCardProps> = ({
  missionId,
  clientFirstName = 'Client',
  initialMessages = [],
}) => {
  const { messages, send, userId } = useMissionChat(missionId, initialMessages);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (textToSend?: string) => {
    const msgText = (textToSend || inputText).trim();
    if (!msgText) return;
    send(msgText);
    if (!textToSend) setInputText('');
  };

  const quickReplies = ['Je suis à 2 minutes', 'Où êtes-vous garé ?', 'Je suis arrivé'];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-tile border border-slate-200/80 dark:border-slate-800 p-5 space-y-4 flex flex-col justify-between min-h-[320px]">
      {/* Header Title with Green Status Indicator */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
          Chat direct <span className="text-slate-500 font-semibold">({clientFirstName || 'Client'})</span>
        </h4>
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
      </div>

      {/* Messages Bubbles Area */}
      <div className="flex-1 max-h-[170px] overflow-y-auto space-y-2.5 px-1 scrollbar-thin">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === userId;

          return (
            <div key={msg.id || index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
              <div
                className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-brand-500 text-white rounded-br-none '
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200/80 dark:border-slate-700/80'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chips Matching Mockup */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
        {quickReplies.map((reply, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSendMessage(reply)}
            className="px-3.5 py-1.5 rounded-full bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-brand-500 hover:border-brand-500 whitespace-nowrap flex-shrink-0 transition-colors"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Input Row with Dark Green Round Send Arrow Button */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          aria-label="Écrire un message..."
          placeholder="Écrire un message..."
          className="flex-1 px-4 py-2.5 rounded-full border bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          className="w-10 h-10 rounded-full bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center active:scale-95 transition-all flex-shrink-0"
        >
          <ArrowRight className="rtl:-scale-x-100 w-4 h-4 stroke-[2.5]" />
        </button>
      </form>
    </div>
  );
};
