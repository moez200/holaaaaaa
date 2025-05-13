import React, { useState } from 'react';
import { Save, Globe, ShieldCheck, CreditCard, Mail, Palette, Smartphone, Bell } from 'lucide-react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: 'General', icon: <Globe size={16} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={16} /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck size={16} /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard size={16} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={16} /> },
    { id: 'mobile', label: 'Mobile App', icon: <Smartphone size={16} /> },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Site Settings</h2>
        <button className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
          <Save size={16} className="mr-2" />
          Save Changes
        </button>
      </div>

      {/* Settings Panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-64 bg-gray-50 md:border-r border-gray-200">
            <nav className="p-4 space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">General Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="site-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      id="site-name"
                      defaultValue="Marketplace Admin"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="site-url" className="block text-sm font-medium text-gray-700 mb-1">
                      Site URL
                    </label>
                    <input
                      type="url"
                      id="site-url"
                      defaultValue="https://marketplace.example.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="site-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Description
                    </label>
                    <textarea
                      id="site-description"
                      rows={3}
                      defaultValue="A modern multi-vendor marketplace platform."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      id="timezone"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option>UTC (Coordinated Universal Time)</option>
                      <option>America/New_York (Eastern Time)</option>
                      <option>America/Chicago (Central Time)</option>
                      <option>America/Denver (Mountain Time)</option>
                      <option>America/Los_Angeles (Pacific Time)</option>
                      <option>Europe/London (Greenwich Mean Time)</option>
                      <option>Europe/Paris (Central European Time)</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="maintenance-mode"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-700">
                      Enable Maintenance Mode
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Appearance Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Color Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['indigo', 'blue', 'emerald', 'amber', 'red', 'purple'].map((color) => (
                        <div 
                          key={color}
                          className={`h-12 rounded-lg border-2 cursor-pointer ${color === 'indigo' ? 'border-indigo-500' : 'border-transparent'}`}
                          style={{
                            backgroundColor: 
                              color === 'indigo' ? '#4f46e5' : 
                              color === 'blue' ? '#2563eb' : 
                              color === 'emerald' ? '#10b981' : 
                              color === 'amber' ? '#d97706' : 
                              color === 'red' ? '#ef4444' : 
                              '#8b5cf6'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="logo-upload" className="block text-sm font-medium text-gray-700 mb-1">
                      Site Logo
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-500">Logo</span>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Upload New Logo
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="favicon-upload" className="block text-sm font-medium text-gray-700 mb-1">
                      Favicon
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 bg-gray-100 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-500">Icon</span>
                      </div>
                      <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50">
                        Upload New Favicon
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Layout Options
                    </label>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="layout-fluid"
                          name="layout"
                          checked
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="layout-fluid" className="ml-2 block text-sm text-gray-700">
                          Fluid Layout
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          id="layout-boxed"
                          name="layout"
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <label htmlFor="layout-boxed" className="ml-2 block text-sm text-gray-700">
                          Boxed Layout
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="password-policy" className="block text-sm font-medium text-gray-700">
                        Password Policy
                      </label>
                    </div>
                    <select
                      id="password-policy"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option>High Security (12+ chars, mixed case, numbers, symbols)</option>
                      <option>Medium Security (8+ chars, mixed case, numbers)</option>
                      <option>Basic Security (8+ chars)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="two-factor"
                        checked
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="two-factor" className="ml-2 block text-sm text-gray-700">
                        Require Two-Factor Authentication for admins
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="session-timeout"
                        checked
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="session-timeout" className="ml-2 block text-sm text-gray-700">
                        Enable session timeout after inactivity
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="login-attempts"
                        checked
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="login-attempts" className="ml-2 block text-sm text-gray-700">
                        Lock account after 5 failed login attempts
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="session-length" className="block text-sm font-medium text-gray-700 mb-1">
                      Session Length (minutes)
                    </label>
                    <input
                      type="number"
                      id="session-length"
                      defaultValue="30"
                      min="5"
                      max="240"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder for other tabs */}
            {['payments', 'notifications', 'emails', 'mobile'].includes(activeTab) && (
              <div className="flex items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
                  <p className="text-gray-500">This section would contain {activeTab} configuration options.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;