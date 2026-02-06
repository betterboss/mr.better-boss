'use client';

import React, { useState } from 'react';
import { CalculatorIcon, BoltIcon } from '../Icons';
import { TRADE_TYPES } from '@/lib/constants';

interface EstimatorPanelProps {
  settings: { anthropicApiKey: string };
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function EstimatorPanel({ settings }: EstimatorPanelProps) {
  const [tradeType, setTradeType] = useState('Roofing - Shingle');
  const [projectName, setProjectName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [measurements, setMeasurements] = useState('');
  const [materialGrade, setMaterialGrade] = useState('Mid-range');
  const [profitMargin, setProfitMargin] = useState('35');
  const [location, setLocation] = useState('Dallas-Fort Worth, TX');
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!settings.anthropicApiKey) {
      setError('Add your Anthropic API key in Settings to use AI features.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/estimates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anthropicApiKey: settings.anthropicApiKey,
          tradeType,
          projectName: projectName || 'Residential Project',
          customerName: customerName || 'Homeowner',
          measurements: measurements || '2,000 sq ft, standard pitch',
          materialGrade,
          profitMargin: profitMargin + '%',
          location,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to generate estimate');
        return;
      }

      setEstimate(data.estimate);
    } catch {
      setError('Failed to generate estimate. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <CalculatorIcon size={20} className="text-boss-orange" />
        <div>
          <h2 className="text-lg font-bold text-white">Rapid Estimator</h2>
          <p className="text-xs text-gray-400">
            AI-powered estimates in under 4 minutes
          </p>
        </div>
      </div>

      {/* Why this feature: Contractors spend 2-4 hours per estimate manually.
          BetterBossOS reduces this to under 4 minutes, letting them bid more jobs. */}

      {!estimate ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Trade Type
            </label>
            <select
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value)}
              className="boss-input"
            >
              {TRADE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Project Name
              </label>
              <input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Smith Reroof"
                className="boss-input"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Customer
              </label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="John Smith"
                className="boss-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Measurements & Scope
            </label>
            <textarea
              value={measurements}
              onChange={(e) => setMeasurements(e.target.value)}
              placeholder="2,000 sq ft roof, 6/12 pitch, 1 layer tear-off, 2 pipe boots, ridge vent..."
              className="boss-input min-h-[80px] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Material Grade
              </label>
              <select
                value={materialGrade}
                onChange={(e) => setMaterialGrade(e.target.value)}
                className="boss-input"
              >
                <option value="Budget">Budget / Economy</option>
                <option value="Mid-range">Mid-Range (30-year)</option>
                <option value="Premium">Premium (50-year / Lifetime)</option>
                <option value="Luxury">Luxury / Designer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Target Profit %
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={profitMargin}
                  onChange={(e) => setProfitMargin(e.target.value)}
                  min="10"
                  max="60"
                  className="boss-input pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  %
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Dallas-Fort Worth, TX"
              className="boss-input"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="boss-btn w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="spinner" />
                <span>Generating Estimate...</span>
              </>
            ) : (
              <>
                <BoltIcon size={18} />
                <span>Generate AI Estimate</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-gray-500 text-center">
            Uses current 2026 market rates &bull; Powered by Claude AI
          </p>
        </div>
      ) : (
        /* Estimate Results */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">
                {estimate.projectName}
              </h3>
              <p className="text-xs text-gray-400">
                {estimate.customerName} &bull; {estimate.tradeType}
              </p>
            </div>
            <button
              onClick={() => setEstimate(null)}
              className="text-xs text-boss-orange hover:underline"
            >
              New Estimate
            </button>
          </div>

          {estimate.summary && (
            <p className="text-sm text-gray-300">{estimate.summary}</p>
          )}

          {/* Line Items */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase tracking-wider px-1">
              <span>Description</span>
              <span>Amount</span>
            </div>
            {(estimate.lineItems || []).map((item: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between glass-card px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white truncate">
                    {item.description}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {item.quantity} {item.unit} @ {formatCurrency(item.unitCost)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-white ml-3">
                  {formatCurrency(item.totalCost)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="glass-card p-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-300">
              <span>Subtotal</span>
              <span>{formatCurrency(estimate.subtotal || 0)}</span>
            </div>
            {estimate.wasteAllowance > 0 && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Waste ({estimate.wastePercent}%)</span>
                <span>{formatCurrency(estimate.wasteAllowance)}</span>
              </div>
            )}
            {estimate.overhead > 0 && (
              <div className="flex justify-between text-xs text-gray-400">
                <span>Overhead ({estimate.overheadPercent}%)</span>
                <span>{formatCurrency(estimate.overhead)}</span>
              </div>
            )}
            <div className="flex justify-between text-xs text-green-400">
              <span>Profit ({estimate.profitPercent}%)</span>
              <span>{formatCurrency(estimate.profit || 0)}</span>
            </div>
            <div className="border-t border-boss-light/30 pt-2 flex justify-between">
              <span className="text-base font-bold text-white">
                Total Price
              </span>
              <span className="text-base font-bold text-boss-orange">
                {formatCurrency(estimate.totalPrice || 0)}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card p-3">
              <p className="text-[10px] text-gray-400 uppercase">Duration</p>
              <p className="text-sm font-semibold text-white">
                {estimate.estimatedDuration || 'TBD'}
              </p>
            </div>
            <div className="glass-card p-3">
              <p className="text-[10px] text-gray-400 uppercase">Crew Size</p>
              <p className="text-sm font-semibold text-white">
                {estimate.crewSize || 'TBD'} workers
              </p>
            </div>
          </div>

          {/* Notes */}
          {estimate.notes && estimate.notes.length > 0 && (
            <div className="glass-card p-3">
              <p className="text-xs font-medium text-white mb-2">Notes</p>
              <ul className="space-y-1">
                {estimate.notes.map((note: string, i: number) => (
                  <li
                    key={i}
                    className="text-[11px] text-gray-300 flex items-start gap-2"
                  >
                    <span className="text-boss-orange mt-0.5">&#8226;</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
