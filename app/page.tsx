'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { BoltIcon } from '@/components/Icons';
import LoginScreen from '@/components/LoginScreen';
import SidebarApp from '@/components/SidebarApp';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  company: string;
}

interface AppSettings {
  jobtreadApiKey: string;
  anthropicApiKey: string;
  sidebarMode: 'sidebar' | 'fullpage';
}

export default function Home() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [settings, setSettings] = useState<AppSettings>({
    jobtreadApiKey: '',
    anthropicApiKey: '',
    sidebarMode: 'fullpage',
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount — verify JWT with server
  useEffect(() => {
    async function restoreSession() {
      const savedToken = localStorage.getItem('mrbb_token');
      const savedUser = localStorage.getItem('mrbb_user');
      const savedSettings = localStorage.getItem('mrbb_settings');

      if (savedSettings) {
        try {
          setSettings((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
        } catch {
          // ignore
        }
      }

      if (savedToken && savedUser) {
        try {
          // Verify token with server (also re-creates user record if server restarted)
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'verify', token: savedToken }),
          });

          if (res.ok) {
            const data = await res.json();
            setToken(savedToken);
            setUser(data.user);
          } else {
            // Token invalid/expired — clear session
            localStorage.removeItem('mrbb_token');
            localStorage.removeItem('mrbb_user');
          }
        } catch {
          // Network error — still trust localStorage for offline usage
          try {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
          } catch {
            localStorage.removeItem('mrbb_token');
            localStorage.removeItem('mrbb_user');
          }
        }
      }

      setIsLoading(false);
    }
    restoreSession();
  }, []);

  const handleLogin = useCallback((authToken: string, authUser: AuthUser) => {
    setToken(authToken);
    setUser(authUser);
    localStorage.setItem('mrbb_token', authToken);
    localStorage.setItem('mrbb_user', JSON.stringify(authUser));
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSettings({ jobtreadApiKey: '', anthropicApiKey: '', sidebarMode: 'fullpage' });
    localStorage.removeItem('mrbb_token');
    localStorage.removeItem('mrbb_user');
    localStorage.removeItem('mrbb_settings');
  }, []);

  const handleSettingsChange = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('mrbb_settings', JSON.stringify(updated));
      return updated;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-boss-black">
        <div className="flex flex-col items-center gap-4">
          <BoltIcon size={48} className="text-boss-orange animate-pulse" />
          <div className="text-lg font-semibold text-white">Loading Mr. Better Boss...</div>
        </div>
      </div>
    );
  }

  if (!user || !token) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <SidebarApp
      user={user}
      token={token}
      settings={settings}
      onSettingsChange={handleSettingsChange}
      onLogout={handleLogout}
    />
  );
}
