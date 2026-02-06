'use client';

import React, { useState } from 'react';
import {
  SettingsIcon,
  KeyIcon,
  LogOutIcon,
  CheckCircleIcon,
  BoltIcon,
} from '../Icons';

interface SettingsPanelProps {
  user: { id: string; email: string; name: string; company: string };
  settings: {
    jobtreadApiKey: string;
    anthropicApiKey: string;
    sidebarMode: 'sidebar' | 'fullpage';
  };
  onSettingsChange: (settings: Record<string, any>) => void;
  onLogout: () => void;
}

export default function SettingsPanel({
  user,
  settings,
  onSettingsChange,
  onLogout,
}: SettingsPanelProps) {
  const [jobtreadKey, setJobtreadKey] = useState(settings.jobtreadApiKey);
  const [anthropicKey, setAnthropicKey] = useState(settings.anthropicApiKey);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSettingsChange({
      jobtreadApiKey: jobtreadKey,
      anthropicApiKey: anthropicKey,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon size={20} className="text-boss-orange" />
        <div>
          <h2 className="text-lg font-bold text-white">Settings</h2>
          <p className="text-xs text-gray-400">Configure your sidebar</p>
        </div>
      </div>

      {/* Account Info */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Account
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Name</span>
            <span className="text-sm text-white font-medium">{user.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Email</span>
            <span className="text-sm text-white">{user.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Company</span>
            <span className="text-sm text-white">{user.company}</span>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <KeyIcon size={14} />
          API Connections
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              JobTread API Key
            </label>
            <input
              type="password"
              value={jobtreadKey}
              onChange={(e) => setJobtreadKey(e.target.value)}
              placeholder="Enter your JobTread API key"
              className="boss-input text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Found at app.jobtread.com &rarr; Settings &rarr; API.
              Connects live job, financial, and schedule data.
            </p>
            {settings.jobtreadApiKey && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircleIcon size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400">Connected</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Anthropic API Key
            </label>
            <input
              type="password"
              value={anthropicKey}
              onChange={(e) => setAnthropicKey(e.target.value)}
              placeholder="sk-ant-..."
              className="boss-input text-sm"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Get yours at console.anthropic.com. Powers AI estimates,
              smart scheduling, and the assistant.
            </p>
            {settings.anthropicApiKey && (
              <div className="flex items-center gap-1 mt-1">
                <CheckCircleIcon size={12} className="text-green-400" />
                <span className="text-[10px] text-green-400">Connected</span>
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            className="boss-btn w-full flex items-center justify-center gap-2 text-sm"
          >
            {saved ? (
              <>
                <CheckCircleIcon size={16} />
                Saved!
              </>
            ) : (
              <>
                <KeyIcon size={16} />
                Save API Keys
              </>
            )}
          </button>
        </div>
      </div>

      {/* Display Mode */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Display Mode
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onSettingsChange({ sidebarMode: 'fullpage' })}
            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
              settings.sidebarMode === 'fullpage'
                ? 'border-boss-orange bg-boss-orange/10 text-boss-orange'
                : 'border-boss-light text-gray-400 hover:border-boss-orange/50'
            }`}
          >
            Full Page
          </button>
          <button
            onClick={() => onSettingsChange({ sidebarMode: 'sidebar' })}
            className={`p-3 rounded-lg border text-sm font-medium transition-all ${
              settings.sidebarMode === 'sidebar'
                ? 'border-boss-orange bg-boss-orange/10 text-boss-orange'
                : 'border-boss-light text-gray-400 hover:border-boss-orange/50'
            }`}
          >
            Sidebar
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-2">
          Sidebar mode pins the app to the right side of your screen while you
          use JobTread.
        </p>
      </div>

      {/* Feature Guide */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <BoltIcon size={14} className="text-boss-orange" />
          Feature Guide
        </h3>
        <div className="space-y-3">
          {[
            {
              name: 'Dashboard',
              desc: 'Real-time overview of jobs, leads, schedule, and financials. Solves: Flying blind without a consolidated view.',
            },
            {
              name: 'Rapid Estimator',
              desc: 'AI generates detailed estimates in under 4 minutes with current market pricing. Solves: Spending 2-4 hours per estimate.',
            },
            {
              name: 'Smart Scheduler',
              desc: 'AI-optimized crew scheduling with conflict detection and weather awareness. Solves: Scheduling chaos and idle crews.',
            },
            {
              name: 'Profit Tracker',
              desc: 'Real-time job costing and margin analysis with over-budget alerts. Solves: Not knowing your profit until the job is done.',
            },
            {
              name: 'AI Assistant',
              desc: 'Chat with a construction AI expert that knows your current jobs and financials. Solves: Needing quick answers on job sites.',
            },
          ].map((feature) => (
            <div key={feature.name}>
              <p className="text-xs font-medium text-white">{feature.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          About
        </h3>
        <p className="text-xs text-gray-300">
          <span className="font-semibold text-white">Mr. Better Boss</span> by{' '}
          <a
            href="https://better-boss.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-boss-orange hover:underline"
          >
            BetterBossOS&trade;
          </a>
        </p>
        <p className="text-[10px] text-gray-500 mt-1">
          JobTread Certified Implementation Partner &bull; Founded by Nick Peret
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Version 1.0.0 &bull; Powered by Claude AI
        </p>
      </div>

      {/* Logout */}
      <button
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all text-sm font-medium"
      >
        <LogOutIcon size={16} />
        Sign Out
      </button>

      <div className="h-4" />
    </div>
  );
}
