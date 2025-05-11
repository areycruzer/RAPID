import React, { useState, useEffect } from 'react';
import { Settings, Bell, Moon, Sun, Volume2, Globe, Shield, User } from 'lucide-react';

// Define settings interface for type safety and persistence
interface SettingsState {
  darkMode: boolean;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  language: string;
  mapProvider: string;
  priorityLevels: {
    critical: boolean;
    high: boolean;
    medium: boolean;
    low: boolean;
  };
  dataRetention: string;
}

// Default settings
const defaultSettings: SettingsState = {
  darkMode: false,
  notificationsEnabled: true,
  soundEnabled: true,
  autoRefresh: true,
  refreshInterval: 30,
  language: 'en',
  mapProvider: 'openstreetmap',
  priorityLevels: {
    critical: true,
    high: true,
    medium: true,
    low: false
  },
  dataRetention: '30'
};

export function SettingsView() {
  // Initialize state from localStorage or defaults
  const [settings, setSettings] = useState<SettingsState>(() => {
    const savedSettings = localStorage.getItem('lit-dashboard-settings');
    return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
  });
  
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [showResetToast, setShowResetToast] = useState(false);
  
  // Apply dark mode effect
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [settings.darkMode]);
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('lit-dashboard-settings', JSON.stringify(settings));
  }, [settings]);
  
  // Update a single setting
  const updateSetting = <K extends keyof SettingsState>(key: K, value: SettingsState[K]) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Update a nested priority level setting
  const updatePriorityLevel = (level: keyof SettingsState['priorityLevels'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      priorityLevels: {
        ...prev.priorityLevels,
        [level]: value
      }
    }));
  };
  
  // Reset all settings to default
  const resetToDefaults = () => {
    setSettings(defaultSettings);
    setShowResetToast(true);
    setTimeout(() => setShowResetToast(false), 3000);
  };
  
  // Save changes (in a real app, this might send to a server)
  const saveChanges = () => {
    // In a real app, you might send these to a server
    localStorage.setItem('lit-dashboard-settings', JSON.stringify(settings));
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 3000);
    
    // Apply settings to the application
    applySettings();
  };
  
  // Apply settings to the application
  const applySettings = () => {
    // Apply language
    document.documentElement.lang = settings.language;
    
    // Apply dark mode
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
    
    // In a real app, you would set up notification permissions here
    if (settings.notificationsEnabled && 'Notification' in window) {
      Notification.requestPermission();
    }
    
    // Set up auto-refresh timer
    if (settings.autoRefresh) {
      // This would connect to your real refresh logic
      console.log(`Auto-refresh enabled with interval: ${settings.refreshInterval} seconds`);
    } else {
      console.log('Auto-refresh disabled');
    }
  };
  
  return (
    <div className="h-full bg-white p-6 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Settings className="h-8 w-8 text-blue-500 mr-3" />
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>
        
        <div className="space-y-8">
          {/* Interface Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Interface Settings
            </h2>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Dark Mode */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {settings.darkMode ? (
                    <Moon className="h-5 w-5 text-blue-600 mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 text-yellow-500 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Switch between light and dark theme</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.darkMode}
                    onChange={() => updateSetting('darkMode', !settings.darkMode)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Language */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Globe className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Language</h3>
                    <p className="text-sm text-gray-500">Select your preferred language</p>
                  </div>
                </div>
                <select 
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={settings.language}
                  onChange={(e) => updateSetting('language', e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              
              {/* Map Provider */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Map Provider</h3>
                    <p className="text-sm text-gray-500">Select your preferred map service</p>
                  </div>
                </div>
                <select 
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                  value={settings.mapProvider}
                  onChange={(e) => updateSetting('mapProvider', e.target.value)}
                >
                  <option value="openstreetmap">OpenStreetMap</option>
                  <option value="google">Google Maps</option>
                  <option value="mapbox">Mapbox</option>
                </select>
              </div>
            </div>
          </section>
          
          {/* Notification Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Bell className="h-5 w-5 mr-2 text-blue-500" />
              Notification Settings
            </h2>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Enable Notifications */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Enable Notifications</h3>
                  <p className="text-sm text-gray-500">Receive alerts for new emergencies</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.notificationsEnabled}
                    onChange={() => updateSetting('notificationsEnabled', !settings.notificationsEnabled)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Sound Alerts */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Volume2 className="h-5 w-5 text-blue-600 mr-3" />
                  <div>
                    <h3 className="font-medium">Sound Alerts</h3>
                    <p className="text-sm text-gray-500">Play sound for critical emergencies</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.soundEnabled}
                    onChange={() => updateSetting('soundEnabled', !settings.soundEnabled)}
                    disabled={!settings.notificationsEnabled}
                  />
                  <div className={`w-11 h-6 ${settings.notificationsEnabled ? 'bg-gray-200' : 'bg-gray-300'} peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600`}></div>
                </label>
              </div>
              
              {/* Priority Levels */}
              <div>
                <h3 className="font-medium mb-2">Notification Priority Levels</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input 
                      id="critical" 
                      type="checkbox" 
                      checked={settings.priorityLevels.critical} 
                      disabled={true}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="critical" className="ml-2 text-sm font-medium text-gray-900">
                      Critical (Always notify)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="high" 
                      type="checkbox" 
                      checked={settings.priorityLevels.high} 
                      onChange={() => updatePriorityLevel('high', !settings.priorityLevels.high)}
                      disabled={!settings.notificationsEnabled}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="high" className="ml-2 text-sm font-medium text-gray-900">
                      High
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="medium" 
                      type="checkbox" 
                      checked={settings.priorityLevels.medium} 
                      onChange={() => updatePriorityLevel('medium', !settings.priorityLevels.medium)}
                      disabled={!settings.notificationsEnabled}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="medium" className="ml-2 text-sm font-medium text-gray-900">
                      Medium
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      id="low" 
                      type="checkbox" 
                      checked={settings.priorityLevels.low} 
                      onChange={() => updatePriorityLevel('low', !settings.priorityLevels.low)}
                      disabled={!settings.notificationsEnabled}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="low" className="ml-2 text-sm font-medium text-gray-900">
                      Low
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Data Settings */}
          <section>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-500" />
              Data Settings
            </h2>
            <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Auto Refresh */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Auto Refresh</h3>
                  <p className="text-sm text-gray-500">Automatically refresh emergency data</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={settings.autoRefresh}
                    onChange={() => updateSetting('autoRefresh', !settings.autoRefresh)}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              {/* Refresh Interval */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Refresh Interval</h3>
                  <p className="text-sm text-gray-500">Time between data updates (seconds)</p>
                </div>
                <input 
                  type="number" 
                  min="5" 
                  max="300" 
                  step="5"
                  value={settings.refreshInterval}
                  onChange={(e) => updateSetting('refreshInterval', parseInt(e.target.value))}
                  disabled={!settings.autoRefresh}
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-20 p-2.5"
                />
              </div>
              
              {/* Data Retention */}
              <div>
                <h3 className="font-medium mb-2">Data Retention</h3>
                <select 
                  className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  value={settings.dataRetention}
                  onChange={(e) => updateSetting('dataRetention', e.target.value)}
                >
                  <option value="1">1 Day</option>
                  <option value="7">7 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
            </div>
          </section>
          
          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              onClick={resetToDefaults}
            >
              Reset to Defaults
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              onClick={saveChanges}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
      
      {/* Save Toast */}
      {showSaveToast && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Settings saved successfully!
          </p>
        </div>
      )}
      
      {/* Reset Toast */}
      {showResetToast && (
        <div className="fixed bottom-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg shadow-lg">
          <p className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Settings reset to defaults!
          </p>
        </div>
      )}
    </div>
  );
}

// MapPin component
const MapPin = ({ className }: { className?: string }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
};
