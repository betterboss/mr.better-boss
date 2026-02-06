'use client';

import React, { useState } from 'react';
import { CalendarIcon, BoltIcon, UsersIcon, ClockIcon } from '../Icons';

interface SchedulerPanelProps {
  settings: { anthropicApiKey: string };
  dashboardData: any;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(dateStr: string): string {
  return DAYS[new Date(dateStr + 'T12:00:00').getDay()];
}

function getPriorityColor(priority: string): string {
  switch (priority) {
    case 'high':
      return 'border-l-red-500 bg-red-500/5';
    case 'medium':
      return 'border-l-yellow-500 bg-yellow-500/5';
    case 'low':
      return 'border-l-green-500 bg-green-500/5';
    default:
      return 'border-l-gray-500';
  }
}

export default function SchedulerPanel({ settings, dashboardData }: SchedulerPanelProps) {
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState<any>(null);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'current' | 'optimized'>('current');

  const currentSchedule = dashboardData?.schedule || [];

  const handleOptimize = async () => {
    if (!settings.anthropicApiKey) {
      setError('Add your Anthropic API key in Settings to use AI features.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/scheduler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anthropicApiKey: settings.anthropicApiKey,
          jobs: dashboardData?.jobs || [],
          dateRange: 'Next 5 business days',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to optimize schedule');
        return;
      }

      setSchedule(data.schedule);
      setViewMode('optimized');
    } catch {
      setError('Failed to generate schedule. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon size={20} className="text-boss-orange" />
          <div>
            <h2 className="text-lg font-bold text-white">Smart Scheduler</h2>
            <p className="text-xs text-gray-400">
              AI-optimized crew scheduling
            </p>
          </div>
        </div>

        <button
          onClick={handleOptimize}
          disabled={loading}
          className="boss-btn text-xs py-2 px-3 flex items-center gap-1.5"
        >
          {loading ? (
            <div className="spinner !w-3.5 !h-3.5" />
          ) : (
            <BoltIcon size={14} />
          )}
          <span>Optimize</span>
        </button>
      </div>

      {/* Why this feature: Scheduling chaos causes missed deadlines, idle crews,
          and wasted travel time. AI optimization maximizes utilization. */}

      {/* View Toggle */}
      <div className="flex bg-boss-black/50 rounded-lg p-1">
        <button
          onClick={() => setViewMode('current')}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            viewMode === 'current'
              ? 'bg-boss-orange text-white'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Current Schedule
        </button>
        <button
          onClick={() => setViewMode('optimized')}
          disabled={!schedule}
          className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
            viewMode === 'optimized'
              ? 'bg-boss-orange text-white'
              : 'text-gray-400 hover:text-white disabled:opacity-30'
          }`}
        >
          AI Optimized
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {viewMode === 'current' ? (
        /* Current Schedule View */
        <div className="space-y-2">
          {currentSchedule.length === 0 ? (
            <div className="text-center py-8">
              <CalendarIcon size={32} className="text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No events scheduled</p>
              <p className="text-xs text-gray-500 mt-1">
                Click Optimize to generate an AI schedule
              </p>
            </div>
          ) : (
            currentSchedule.map((event: any) => (
              <div
                key={event.id}
                className="glass-card p-3"
              >
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {event.title}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {event.jobName}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-boss-orange font-medium">
                      {getDayName(event.startDate)} {event.startDate?.slice(5)}
                    </span>
                    <span
                      className={`block text-[9px] mt-0.5 px-1.5 py-0.5 rounded-full ${
                        event.type === 'inspection'
                          ? 'text-purple-400 bg-purple-400/10'
                          : event.type === 'delivery'
                          ? 'text-yellow-400 bg-yellow-400/10'
                          : 'text-blue-400 bg-blue-400/10'
                      }`}
                    >
                      {event.type}
                    </span>
                  </div>
                </div>

                {event.crewMembers.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    <UsersIcon size={10} className="text-gray-500" />
                    <span className="text-[10px] text-gray-400">
                      {event.crewMembers.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        /* AI Optimized Schedule View */
        schedule && (
          <div className="space-y-4">
            {/* Schedule Days */}
            {(schedule.schedule || []).map((day: any, di: number) => (
              <div key={di}>
                <h4 className="text-xs font-semibold text-boss-orange mb-2 flex items-center gap-2">
                  <ClockIcon size={12} />
                  {day.dayName} &bull; {day.day}
                </h4>
                <div className="space-y-1.5">
                  {(day.assignments || []).map((task: any, ti: number) => (
                    <div
                      key={ti}
                      className={`glass-card p-3 border-l-2 ${getPriorityColor(
                        task.priority
                      )}`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-white">
                            {task.task}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {task.jobName}
                          </p>
                        </div>
                        <span className="text-[10px] text-boss-orange font-mono">
                          {task.startTime}-{task.endTime}
                        </span>
                      </div>
                      {task.crew && task.crew.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          <UsersIcon size={10} className="text-gray-500" />
                          <span className="text-[10px] text-gray-400">
                            {task.crew.join(', ')}
                          </span>
                        </div>
                      )}
                      {task.notes && (
                        <p className="text-[10px] text-gray-500 mt-1 italic">
                          {task.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Conflicts & Recommendations */}
            {schedule.conflicts && schedule.conflicts.length > 0 && (
              <div className="glass-card p-3 border border-red-500/20">
                <p className="text-xs font-medium text-red-400 mb-1">
                  Conflicts Detected
                </p>
                {schedule.conflicts.map((c: string, i: number) => (
                  <p key={i} className="text-[10px] text-gray-400">
                    &#8226; {c}
                  </p>
                ))}
              </div>
            )}

            {schedule.recommendations && schedule.recommendations.length > 0 && (
              <div className="glass-card p-3 border border-boss-orange/20">
                <p className="text-xs font-medium text-boss-orange mb-1">
                  Recommendations
                </p>
                {schedule.recommendations.map((r: string, i: number) => (
                  <p key={i} className="text-[10px] text-gray-400">
                    &#8226; {r}
                  </p>
                ))}
              </div>
            )}
          </div>
        )
      )}

      <div className="h-4" />
    </div>
  );
}
