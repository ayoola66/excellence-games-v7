'use client';

import { useState, useEffect } from 'react';
import { strapiApi } from '@/lib/strapiApi';
import compatToast from '@/lib/notificationManager';
import {
  CogIcon,
  UserGroupIcon,
  ClockIcon,
  SpeakerWaveIcon,
  BellIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface Settings {
  id: string;
  attributes: {
    gameTimeLimit: number;
    soundEnabled: boolean;
    notificationsEnabled: boolean;
    defaultAdminRole: string;
    questionTimeLimit: number;
    pointsPerQuestion: number;
    bonusPoints: number;
    penaltyPoints: number;
    maxAttempts: number;
    leaderboardEnabled: boolean;
    progressTrackingEnabled: boolean;
  };
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const response = await strapiApi.getGameSettings();
      setSettings(response.data);
    } catch (err) {
      setError('Failed to fetch settings.');
      compatToast.error('Failed to fetch settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        attributes: {
          ...prev.attributes,
          [name]: type === 'checkbox' 
            ? (e.target as HTMLInputElement).checked 
            : type === 'number' 
              ? parseInt(value, 10) 
              : value
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setIsSaving(true);
    try {
      await strapiApi.updateGameSettings(settings.id, settings.attributes);
      compatToast.success('Settings updated successfully');
    } catch (err) {
      compatToast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <ArrowPathIcon className="h-12 w-12 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button
            onClick={fetchSettings}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Game Settings</h1>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isSaving ? (
            <>
              <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <CogIcon className="h-5 w-5 mr-2" />
              Save Changes
            </>
          )}
        </button>
      </div>

      {settings && (
        <div className="grid grid-cols-1 gap-8">
          {/* Game Rules */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Game Rules</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Game Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    name="gameTimeLimit"
                    value={settings.attributes.gameTimeLimit}
                    onChange={handleChange}
                    min="1"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Question Time Limit (seconds)
                  </label>
                  <input
                    type="number"
                    name="questionTimeLimit"
                    value={settings.attributes.questionTimeLimit}
                    onChange={handleChange}
                    min="5"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Scoring</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Points per Correct Answer
                  </label>
                  <input
                    type="number"
                    name="pointsPerQuestion"
                    value={settings.attributes.pointsPerQuestion}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bonus Points
                  </label>
                  <input
                    type="number"
                    name="bonusPoints"
                    value={settings.attributes.bonusPoints}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Penalty Points
                  </label>
                  <input
                    type="number"
                    name="penaltyPoints"
                    value={settings.attributes.penaltyPoints}
                    onChange={handleChange}
                    min="0"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Attempts
                  </label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={settings.attributes.maxAttempts}
                    onChange={handleChange}
                    min="1"
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Features</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="soundEnabled"
                    checked={settings.attributes.soundEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Sound Effects
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    checked={settings.attributes.notificationsEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Notifications
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="leaderboardEnabled"
                    checked={settings.attributes.leaderboardEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Leaderboard
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="progressTrackingEnabled"
                    checked={settings.attributes.progressTrackingEnabled}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">
                    Enable Progress Tracking
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* Admin Settings */}
          <section className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Admin Settings</h2>
            </div>
            <div className="p-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Admin Role
                </label>
                <select
                  name="defaultAdminRole"
                  value={settings.attributes.defaultAdminRole}
                  onChange={handleChange}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="editor">Editor</option>
                  <option value="moderator">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
} 