'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { NAV_ITEMS, PanelId } from '@/lib/constants';
import { iconMap, BoltIcon, LogOutIcon } from './Icons';
import DashboardPanel from './panels/DashboardPanel';
import EstimatorPanel from './panels/EstimatorPanel';
import SchedulerPanel from './panels/SchedulerPanel';
import ProfitabilityPanel from './panels/ProfitabilityPanel';
import AssistantPanel from './panels/AssistantPanel';
import SettingsPanel from './panels/SettingsPanel';

interface SidebarAppProps {
  user: { id: string; email: string; name: string; company: string };
  token: string;
  settings: {
    jobtreadApiKey: string;
    anthropicApiKey: string;
    sidebarMode: 'sidebar' | 'fullpage';
  };
  onSettingsChange: (settings: Record<string, any>) => void;
  onLogout: () => void;
}

export default function SidebarApp({
  user,
  token,
  settings,
  onSettingsChange,
  onLogout,
}: SidebarAppProps) {
  const [activePanel, setActivePanel] = useState<PanelId>('dashboard');
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setDataLoading(true);
    setDataError(null);
    try {
      const res = await fetch('/api/jobtread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'getDashboard',
          jobtreadApiKey: settings.jobtreadApiKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDataError(data.error || 'Failed to load data from JobTread');
        setIsDemo(true);
      } else {
        setDashboardData(data);
        setIsDemo(data.isDemo ?? !settings.jobtreadApiKey);
        setDataError(null);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDataError('Network error loading data');
      setIsDemo(true);
    } finally {
      setDataLoading(false);
    }
  }, [settings.jobtreadApiKey]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const isSidebar = settings.sidebarMode === 'sidebar';

  const renderPanel = () => {
    const panelProps = {
      user,
      settings,
      dashboardData,
      dataLoading,
      dataError,
      isDemo,
      onRefresh: fetchDashboardData,
    };

    switch (activePanel) {
      case 'dashboard':
        return <DashboardPanel {...panelProps} />;
      case 'estimator':
        return <EstimatorPanel settings={settings} />;
      case 'scheduler':
        return <SchedulerPanel settings={settings} dashboardData={dashboardData} />;
      case 'profitability':
        return <ProfitabilityPanel settings={settings} dashboardData={dashboardData} dataLoading={dataLoading} />;
      case 'assistant':
        return <AssistantPanel settings={settings} dashboardData={dashboardData} />;
      case 'settings':
        return (
          <SettingsPanel
            user={user}
            token={token}
            settings={settings}
            onSettingsChange={onSettingsChange}
            onLogout={onLogout}
          />
        );
      default:
        return <DashboardPanel {...panelProps} />;
    }
  };

  return (
    <div
      className={`${
        isSidebar ? 'sidebar-container' : 'min-h-screen w-full max-w-[520px] mx-auto'
      } flex flex-col bg-boss-dark`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-boss-light/30 bg-boss-dark/95 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-boss-orange to-boss-orange-dark flex items-center justify-center shadow-lg shadow-boss-orange/20">
            <BoltIcon size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Mr. Better Boss
            </h1>
            <p className="text-[10px] text-gray-400 leading-tight">
              {user.company}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {dataError ? (
              <>
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-[10px] text-red-400">Error</span>
              </>
            ) : isDemo ? (
              <>
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="text-[10px] text-yellow-400">Demo</span>
              </>
            ) : (
              <>
                <div className="w-2 h-2 rounded-full bg-boss-success pulse-dot" />
                <span className="text-[10px] text-green-400">Live</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        {renderPanel()}
      </div>

      {/* Bottom Navigation */}
      <nav className="border-t border-boss-light/30 bg-boss-dark/95 backdrop-blur-sm px-2 py-1.5">
        <div className="flex justify-between items-center">
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = activePanel === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActivePanel(item.id)}
                className={`nav-tab ${isActive ? 'active' : ''}`}
              >
                {Icon && <Icon size={18} />}
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
