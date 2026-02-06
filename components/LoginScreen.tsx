'use client';

import React, { useState } from 'react';
import { BoltIcon, KeyIcon } from './Icons';

interface LoginScreenProps {
  onLogin: (token: string, user: { id: string; email: string; name: string; company: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const body: Record<string, string> = {
        action: mode,
        email,
        password,
      };
      if (mode === 'register') {
        body.name = name;
        body.company = company;
      }

      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Authentication failed');
        return;
      }

      onLogin(data.token, data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Quick demo login
  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      // Register a demo user
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'register',
          email: `demo-${Date.now()}@betterboss.ai`,
          password: 'demo1234',
          name: 'Demo Contractor',
          company: 'Demo Roofing Co.',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Demo login failed');
        return;
      }

      onLogin(data.token, data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-boss-black flex items-center justify-center p-4">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-boss-orange/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-boss-orange/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-boss-orange to-boss-orange-dark mb-4 shadow-lg shadow-boss-orange/20">
            <BoltIcon size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Mr. Better Boss
          </h1>
          <p className="text-gray-400 mt-2">
            AI-Powered JobTread Command Center
          </p>
          <p className="text-boss-orange/70 text-sm mt-1">
            by BetterBossOS&trade;
          </p>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <div className="flex mb-6 bg-boss-black/50 rounded-lg p-1">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-boss-orange text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                mode === 'register'
                  ? 'bg-boss-orange text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nick Peret"
                    className="boss-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Better Boss Roofing"
                    className="boss-input"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="boss-input"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="boss-input"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="boss-btn w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="spinner" />
              ) : (
                <>
                  <KeyIcon size={18} />
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-boss-light" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-boss-dark text-gray-400">or</span>
            </div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="boss-btn-outline w-full flex items-center justify-center gap-2"
          >
            <BoltIcon size={18} />
            Try Demo Mode
          </button>

          <p className="text-center text-gray-500 text-xs mt-4">
            Demo mode uses sample data. Connect your JobTread API key in Settings for live data.
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-xs">
            Powered by{' '}
            <a
              href="https://better-boss.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="text-boss-orange hover:underline"
            >
              Better Boss
            </a>
            {' '}&bull; JobTread Certified Partner
          </p>
        </div>
      </div>
    </div>
  );
}
