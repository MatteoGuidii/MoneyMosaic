import React, { useState } from 'react'
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Download, HelpCircle, LogOut } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Settings: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [activeSection, setActiveSection] = useState('profile')
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
    budgetAlerts: true,
    transactionAlerts: true,
    goalReminders: true
  })

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Privacy', icon: Download },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ]

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-gray-700 dark:from-navy-700 dark:to-gray-800 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <SettingsIcon className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-navy-100 dark:text-navy-200">
              Customize your MoneyMosaic experience
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <nav className="p-4 space-y-1">
              {sections.map((section) => {
                const Icon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                      activeSection === section.id
                        ? 'bg-navy-100 dark:bg-navy-900 text-navy-700 dark:text-navy-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Profile Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      defaultValue="Doe"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      defaultValue="john.doe@example.com"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                               bg-white dark:bg-gray-700 text-gray-900 dark:text-white 
                               focus:ring-2 focus:ring-navy-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <button className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-md transition-colors">
                  Save Changes
                </button>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.email}
                        onChange={(e) => handleNotificationChange('email', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 dark:peer-focus:ring-navy-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-navy-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Push Notifications</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Receive browser notifications</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.push}
                        onChange={(e) => handleNotificationChange('push', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 dark:peer-focus:ring-navy-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-navy-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Budget Alerts</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when approaching budget limits</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.budgetAlerts}
                        onChange={(e) => handleNotificationChange('budgetAlerts', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 dark:peer-focus:ring-navy-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Security Settings</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Change Password</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Update your password to keep your account secure
                    </p>
                    <button className="px-4 py-2 bg-navy-600 hover:bg-navy-700 text-white rounded-md transition-colors">
                      Change Password
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Two-Factor Authentication</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Add an extra layer of security to your account
                    </p>
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Appearance Settings</h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Switch between light and dark themes
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDarkMode}
                        onChange={toggleDarkMode}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-navy-300 dark:peer-focus:ring-navy-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-navy-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data & Privacy</h2>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Export Data</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Download all your data in a portable format
                    </p>
                    <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                      Export Data
                    </button>
                  </div>

                  <div className="border border-red-200 dark:border-red-600 rounded-lg p-4">
                    <h3 className="font-medium text-red-700 dark:text-red-400 mb-2">Delete Account</h3>
                    <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                      Permanently delete your account and all associated data
                    </p>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'help' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Help & Support</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Documentation</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Learn how to use MoneyMosaic effectively
                    </p>
                    <button className="text-navy-600 dark:text-navy-400 hover:underline">
                      View Docs
                    </button>
                  </div>

                  <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">Contact Support</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      Get help from our support team
                    </p>
                    <button className="text-navy-600 dark:text-navy-400 hover:underline">
                      Contact Us
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sign Out */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Sign Out</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sign out of your MoneyMosaic account
            </p>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings
