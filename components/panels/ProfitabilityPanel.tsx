'use client';

import React from 'react';
import {
  TrendingUpIcon,
  DollarSignIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from '../Icons';

interface ProfitabilityPanelProps {
  settings: { anthropicApiKey: string; jobtreadApiKey: string };
  dashboardData: any;
  dataLoading: boolean;
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function getMarginColor(margin: number): string {
  if (margin >= 35) return 'text-green-400';
  if (margin >= 25) return 'text-yellow-400';
  if (margin >= 15) return 'text-orange-400';
  return 'text-red-400';
}

function getMarginBg(margin: number): string {
  if (margin >= 35) return 'bg-green-400';
  if (margin >= 25) return 'bg-yellow-400';
  if (margin >= 15) return 'bg-orange-400';
  return 'bg-red-400';
}

export default function ProfitabilityPanel({
  dashboardData,
  dataLoading,
}: ProfitabilityPanelProps) {
  const jobs = dashboardData?.jobs || [];
  const financials = dashboardData?.financials || {
    totalRevenue: 0,
    totalCosts: 0,
    grossProfit: 0,
    grossMargin: 0,
    openInvoices: 0,
    overdueInvoices: 0,
    cashInFlow: 0,
    cashOutFlow: 0,
  };

  // Why this feature: Most contractors don't know their real profit until the job is done.
  // Real-time tracking prevents margin leaks and identifies problems early.
  // BetterBossOS increases profitability by at least 5% through this visibility.

  const jobProfitData = jobs.map((job: any) => {
    const estimatedProfit = job.estimatedRevenue - job.estimatedCost;
    const estimatedMargin =
      job.estimatedRevenue > 0
        ? (estimatedProfit / job.estimatedRevenue) * 100
        : 0;
    const actualProfit = job.actualRevenue - job.actualCost;
    const actualMargin =
      job.actualRevenue > 0
        ? (actualProfit / job.actualRevenue) * 100
        : estimatedMargin;
    const variance = job.actualCost > 0 ? job.actualCost - job.estimatedCost * (job.progress / 100) : 0;

    return {
      ...job,
      estimatedProfit,
      estimatedMargin,
      actualProfit,
      actualMargin,
      variance,
      isOverBudget: variance > 0 && job.progress > 0,
    };
  });

  const overBudgetJobs = jobProfitData.filter((j: any) => j.isOverBudget);
  const avgMargin =
    jobProfitData.length > 0
      ? jobProfitData.reduce(
          (acc: number, j: any) => acc + j.estimatedMargin,
          0
        ) / jobProfitData.length
      : 0;

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-gray-400">Loading profitability data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUpIcon size={20} className="text-boss-orange" />
        <div>
          <h2 className="text-lg font-bold text-white">Profit Tracker</h2>
          <p className="text-xs text-gray-400">
            Real-time job costing &amp; margin analysis
          </p>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <DollarSignIcon size={14} className="text-green-400" />
            <span className="stat-label">Gross Profit</span>
          </div>
          <div className="stat-value text-green-400">
            {formatCurrency(financials.grossProfit)}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUpIcon size={14} className="text-boss-orange" />
            <span className="stat-label">Avg Margin</span>
          </div>
          <div className={`stat-value ${getMarginColor(avgMargin)}`}>
            {avgMargin.toFixed(1)}%
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircleIcon size={14} className="text-blue-400" />
            <span className="stat-label">Open Invoices</span>
          </div>
          <div className="stat-value text-blue-400">
            {financials.openInvoices}
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangleIcon size={14} className="text-red-400" />
            <span className="stat-label">Overdue</span>
          </div>
          <div className="stat-value text-red-400">
            {financials.overdueInvoices}
          </div>
        </div>
      </div>

      {/* Cash Flow */}
      <div className="glass-card p-4">
        <h3 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">
          Cash Flow This Month
        </h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Money In</span>
          <span className="text-sm font-semibold text-green-400">
            +{formatCurrency(financials.cashInFlow)}
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Money Out</span>
          <span className="text-sm font-semibold text-red-400">
            -{formatCurrency(financials.cashOutFlow)}
          </span>
        </div>
        <div className="border-t border-boss-light/30 pt-2 flex items-center justify-between">
          <span className="text-xs font-medium text-white">Net Cash Flow</span>
          <span
            className={`text-sm font-bold ${
              financials.cashInFlow - financials.cashOutFlow >= 0
                ? 'text-green-400'
                : 'text-red-400'
            }`}
          >
            {formatCurrency(financials.cashInFlow - financials.cashOutFlow)}
          </span>
        </div>
      </div>

      {/* Over Budget Alert */}
      {overBudgetJobs.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangleIcon size={14} className="text-red-400" />
            <p className="text-xs font-semibold text-red-400">
              {overBudgetJobs.length} Job{overBudgetJobs.length > 1 ? 's' : ''}{' '}
              Trending Over Budget
            </p>
          </div>
          {overBudgetJobs.map((job: any) => (
            <div key={job.id} className="flex items-center justify-between py-1">
              <span className="text-[11px] text-gray-300">{job.name}</span>
              <span className="text-[11px] text-red-400 font-medium">
                +{formatCurrency(job.variance)} over
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Per-Job Profitability */}
      <div>
        <h3 className="text-sm font-semibold text-white mb-2">
          Job-by-Job Profitability
        </h3>
        <div className="space-y-2">
          {jobProfitData.map((job: any) => (
            <div key={job.id} className="glass-card p-3">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {job.name}
                  </p>
                  <p className="text-[10px] text-gray-400">{job.customer}</p>
                </div>
                <span
                  className={`text-sm font-bold ${getMarginColor(
                    job.estimatedMargin
                  )}`}
                >
                  {job.estimatedMargin.toFixed(0)}%
                </span>
              </div>

              {/* Margin bar */}
              <div className="h-2 bg-boss-black/50 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getMarginBg(
                    job.estimatedMargin
                  )}`}
                  style={{ width: `${Math.min(job.estimatedMargin * 2, 100)}%` }}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <span className="text-gray-400 block">Revenue</span>
                  <span className="text-white font-medium">
                    {formatCurrency(job.estimatedRevenue)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Cost</span>
                  <span className="text-white font-medium">
                    {formatCurrency(job.estimatedCost)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Profit</span>
                  <span className="text-green-400 font-medium">
                    {formatCurrency(job.estimatedProfit)}
                  </span>
                </div>
              </div>

              {job.isOverBudget && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-400">
                  <AlertTriangleIcon size={10} />
                  <span>
                    Over budget by {formatCurrency(job.variance)} at{' '}
                    {job.progress}% complete
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* BetterBossOS Insight */}
      <div className="glass-card p-3 border border-boss-orange/20">
        <p className="text-xs font-semibold text-boss-orange mb-1">
          BetterBossOS Insight
        </p>
        <p className="text-[11px] text-gray-300">
          Your average margin of {avgMargin.toFixed(1)}% is{' '}
          {avgMargin >= 35
            ? 'healthy. Keep tracking actuals vs estimates to maintain it.'
            : avgMargin >= 25
            ? 'decent but has room to grow. Review your pricing on materials and labor rates.'
            : 'below target. BetterBossOS clients average 35%+ margins. Consider repricing or reducing waste.'}
        </p>
      </div>

      <div className="h-4" />
    </div>
  );
}
