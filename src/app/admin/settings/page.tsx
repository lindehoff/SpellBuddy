'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AppSettings {
  currentVersion: string;
  availableVersions: string[];
  openaiModel: string;
  jwtSecret: string;
  adminUsername: string;
  debugMode: boolean;
}

interface VersionInfo {
  version: string;
  releaseDate: string;
  description: string;
}

export default function AdminSettings() {
  const router = useRouter();
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data.data);
          setSelectedVersion(data.data.currentVersion);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, [router]);

  const handleUpgrade = async () => {
    if (!selectedVersion) return;
    
    setError(null);
    setSuccess(null);
    setUpgrading(true);

    try {
      const response = await fetch('/api/admin/settings/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ version: selectedVersion }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upgrade failed');
      }

      setSuccess(`Successfully upgraded to version ${selectedVersion}`);
      
      // Reload settings after upgrade
      const settingsResponse = await fetch('/api/admin/settings');
      if (settingsResponse.ok) {
        const data = await settingsResponse.json();
        setSettings(data.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save settings');
      }

      setSuccess('Settings saved successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">⚙️ Application Settings</h1>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded relative">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded relative">
            {success}
          </div>
        )}

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Version Management</h2>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400">Current Version</label>
              <p className="text-white">{settings.currentVersion}</p>
            </div>
            
            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-400">
                Upgrade to Version
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <select
                  id="version"
                  value={selectedVersion}
                  onChange={(e) => setSelectedVersion(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {settings.availableVersions.map((version) => (
                    <option key={version} value={version}>
                      {version}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleUpgrade}
                  disabled={upgrading || selectedVersion === settings.currentVersion}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
                >
                  {upgrading ? 'Upgrading...' : 'Upgrade'}
                </button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="bg-white/5 border border-white/10 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">🔧 Application Configuration</h2>
          
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label htmlFor="openaiModel" className="block text-sm font-medium text-gray-400">
                OpenAI Model
              </label>
              <input
                type="text"
                id="openaiModel"
                value={settings.openaiModel}
                onChange={(e) => setSettings({ ...settings, openaiModel: e.target.value })}
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label htmlFor="adminUsername" className="block text-sm font-medium text-gray-400">
                Admin Username
              </label>
              <input
                type="text"
                id="adminUsername"
                value={settings.adminUsername}
                onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
                className="mt-1 block w-full bg-white/5 border border-white/20 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={settings.debugMode}
                  onChange={(e) => setSettings({ ...settings, debugMode: e.target.checked })}
                  className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-white/20 rounded bg-white/5"
                />
                <span className="ml-2 text-sm text-gray-400">Enable Debug Mode</span>
              </label>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 