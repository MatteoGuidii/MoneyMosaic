import React, { useState } from 'react'
import { Moon, Sun, User, Settings, LogOut, Bell, Menu, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  return (
    <header className="bg-gradient-to-r from-navy-700 to-navy-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💰</div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">MoneyMosaic</h1>
              <p className="text-sm text-navy-100">Personal Finance Dashboard</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-lg font-bold">MoneyMosaic</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-navy-600 transition-colors">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:bg-navy-600 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Profile Menu */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-navy-600 transition-colors"
              >
                <div className="w-8 h-8 bg-navy-500 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
                <span className="text-sm font-medium">John Doe</span>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="py-2">
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <User size={16} />
                      <span>Profile</span>
                    </button>
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <Settings size={16} />
                      <span>Settings</span>
                    </button>
                    <hr className="my-2 border-gray-200 dark:border-gray-600" />
                    <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-navy-600 transition-colors"
          >
            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-navy-600 py-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-10 h-10 bg-navy-500 rounded-full flex items-center justify-center">
                <User size={20} />
              </div>
              <div>
                <p className="font-medium">John Doe</p>
                <p className="text-sm text-navy-100">john.doe@example.com</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-navy-600 transition-colors">
                <Bell size={20} />
                <span>Notifications</span>
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  3
                </span>
              </button>
              
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-navy-600 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
              
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-navy-600 transition-colors">
                <Settings size={20} />
                <span>Settings</span>
              </button>
              
              <button className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-navy-600 transition-colors text-red-300">
                <LogOut size={20} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
