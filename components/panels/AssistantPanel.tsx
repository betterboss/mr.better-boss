'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircleIcon, SendIcon, BoltIcon } from '../Icons';
import { QUICK_ACTIONS } from '@/lib/constants';

interface AssistantPanelProps {
  settings: { anthropicApiKey: string };
  dashboardData: any;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AssistantPanel({ settings, dashboardData }: AssistantPanelProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hey! I'm Mr. Better Boss, your AI construction business assistant. I can help with estimates, scheduling, job costing, lead follow-ups, material orders, and anything JobTread-related. What are you working on?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Why this feature: Contractors need quick answers while on job sites.
  // An AI assistant that understands their business context (current jobs,
  // finances, schedule) can provide actionable advice instantly instead of
  // hunting through menus or calling the office.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim()) return;

    if (!settings.anthropicApiKey) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'user',
          content,
          timestamp: new Date(),
        },
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            'I need an Anthropic API key to respond. Go to **Settings** (gear icon) and add your API key to unlock AI features.',
          timestamp: new Date(),
        },
      ]);
      setInput('');
      return;
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatMessages = [
        ...messages.filter((m) => m.id !== 'welcome'),
        userMsg,
      ].map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          anthropicApiKey: settings.anthropicApiKey,
          jobContext: dashboardData
            ? {
                activeJobs: dashboardData.jobs?.length || 0,
                openLeads: dashboardData.leads?.length || 0,
                financials: dashboardData.financials,
                todaySchedule: dashboardData.schedule?.filter(
                  (e: any) =>
                    e.startDate === new Date().toISOString().split('T')[0]
                ),
              }
            : null,
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || data.error || 'Sorry, I could not respond.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Connection error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="p-4 pb-2">
        <div className="flex items-center gap-2">
          <MessageCircleIcon size={20} className="text-boss-orange" />
          <div>
            <h2 className="text-lg font-bold text-white">AI Assistant</h2>
            <p className="text-xs text-gray-400">
              Your construction business copilot
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-5 h-5 rounded-md bg-boss-orange/20 flex items-center justify-center">
                  <BoltIcon size={12} className="text-boss-orange" />
                </div>
                <span className="text-[10px] text-gray-400 font-medium">
                  Mr. Better Boss
                </span>
              </div>
            )}
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed">
              {msg.content}
            </div>
            <div className="text-[9px] text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
          </div>
        ))}

        {loading && (
          <div className="chat-message assistant">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-5 h-5 rounded-md bg-boss-orange/20 flex items-center justify-center">
                <BoltIcon size={12} className="text-boss-orange" />
              </div>
              <span className="text-[10px] text-gray-400 font-medium">
                Mr. Better Boss
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="spinner !w-4 !h-4" />
              <span className="text-xs text-gray-400">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      {messages.length <= 2 && (
        <div className="px-4 py-2">
          <p className="text-[10px] text-gray-500 mb-2 uppercase tracking-wider">
            Quick Actions
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.prompt)}
                disabled={loading}
                className="text-left glass-card p-2 hover:border-boss-orange/40 transition-all text-xs"
              >
                <span className="mr-1">{action.icon}</span>
                <span className="text-gray-300">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 pt-2 border-t border-boss-light/20">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about estimates, scheduling, profitability..."
            className="boss-input flex-1 min-h-[42px] max-h-[120px] resize-none py-2.5"
            rows={1}
            disabled={loading}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="boss-btn p-2.5 rounded-lg"
          >
            <SendIcon size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
