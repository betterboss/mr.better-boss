'use client';

import React from 'react';
import {
  DollarSignIcon,
  UsersIcon,
  ClockIcon,
  TrendingUpIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from '../Icons';

interface DashboardPanelProps {
  user: { name: string; company: string };
  dashboardData: any;
  dataLoading: boolean;
  onRefresh: () => void;
  settings: any;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'in progress':
      return 'text-blue-400 bg-blue-400/10';
    case 'scheduled':
      return 'text-yellow-400 bg-yellow-400/10';
    case 'estimating':
      return 'text-purple-400 bg-purple-400/10';
    case 'completed':
      return 'text-green-400 bg-green-400/10';
    default:
      return 'text-gray-400 bg-gray-400/10';
  }
}

export default function DashboardPanel({
  user,
  dashboardData,
  dataLoading,
  onRefresh,
}: DashboardPanelProps) {
  const jobs = dashboardData?.jobs || [];
  const leads = dashboardData?.leads || [];
  const schedule = dashboardData?.schedule || [];
  const financials = dashboardData?.financials || {
    totalRevenue: 0,
    totalCosts: 0,
    grossProfit: 0,
    grossMargin: 0,
    openInvoices: 0,
    overdueInvoices: 0,
  };

  const activeJobs = jobs.filter(
    (j: any) => j.status === 'In Progress' || j.status === 'Scheduled'
  );
  const newLeads = leads.filter((l: any) => l.status === 'New');
  const todayEvents = schedule.filter(
    (e: any) => e.startDate === new Date().toISOString().split('T')[0]
  );

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Greeting */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            {getGreeting()}, {user.name.split(' ')[0]}
          </h2>
          <p className="text-xs text-gray-400">
            Here&apos;s your business at a glance
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-boss-orange hover:text-boss-orange-light transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSignIcon size={14} className="text-green-400" />
            <span className="stat-label">Gross Profit</span>
          </div>
          <div className="stat-value text-green-400">
            {formatCurrency(financials.grossProfit)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {financials.grossMargin.toFixed(1)}% margin
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon size={14} className="text-boss-orange" />
            <span className="stat-label">Revenue</span>
          </div>
          <div className="stat-value">
            {formatCurrency(financials.totalRevenue)}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Total billed
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <ClockIcon size={14} className="text-blue-400" />
            <span className="stat-label">Active Jobs</span>
          </div>
          <div className="stat-value text-blue-400">{activeJobs.length}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {todayEvents.length} tasks today
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <UsersIcon size={14} className="text-purple-400" />
            <span className="stat-label">New Leads</span>
          </div>
          <div className="stat-value text-purple-400">{newLeads.length}</div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {leads.length} total pipeline
          </div>
        </div>
      </div>

      {/* Alerts Section */}
      {financials.overdueInvoices > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-start gap-3">
          <AlertTriangleIcon size={16} className="text-red-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-400">
              {financials.overdueInvoices} Overdue Invoice{financials.overdueInvoices > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Follow up to maintain cash flow
            </p>
          </div>
        </div>
      )}

      {/* Active Jobs List */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <ClockIcon size={14} className="text-boss-orange" />
          Active Jobs
        </h3>
        <div className="space-y-2">
          {jobs.slice(0, 5).map((job: any) => {
            const profit = job.estimatedRevenue - job.estimatedCost;
            const margin =
              job.estimatedRevenue > 0
                ? ((profit / job.estimatedRevenue) * 100).toFixed(0)
                : 0;
            return (
              <div key={job.id} className="glass-card p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {job.name}
                    </p>
                    <p className="text-[10px] text-gray-400">{job.customer}</p>
                  </div>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${getStatusColor(
                      job.status
                    )}`}
                  >
                    {job.status}
                  </span>
                </div>

                {/* Progress bar */}
                {job.progress > 0 && (
                  <div className="mt-2">
                    <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{job.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-boss-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-boss-orange to-boss-orange-light rounded-full transition-all duration-500"
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-400">
                  <span>{formatCurrency(job.estimatedRevenue)}</span>
                  <span className="text-green-400">{margin}% margin</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <CheckCircleIcon size={14} className="text-boss-orange" />
          Today&apos;s Schedule
        </h3>
        <div className="space-y-2">
          {todayEvents.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-3">
              No events scheduled for today
            </p>
          ) : (
            todayEvents.map((event: any) => (
              <div key={event.id} className="glass-card p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {event.title}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">
                      {event.jobName}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full ${
                      event.status === 'in_progress'
                        ? 'text-blue-400 bg-blue-400/10'
                        : 'text-yellow-400 bg-yellow-400/10'
                    }`}
                  >
                    {event.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                  </span>
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
      </div>

      {/* Lead Pipeline */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
          <UsersIcon size={14} className="text-boss-orange" />
          Recent Leads
        </h3>
        <div className="space-y-2">
          {leads.slice(0, 3).map((lead: any) => (
            <div key={lead.id} className="glass-card p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">{lead.name}</p>
                <p className="text-[10px] text-gray-400">
                  {lead.source} &bull; {lead.status}
                </p>
              </div>
              <span className="text-xs font-semibold text-boss-orange">
                {formatCurrency(lead.estimatedValue)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom spacer */}
      <div className="h-4" />
    </div>
  );
}
