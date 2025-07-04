import React, { useState } from 'react'
import { User, Settings, LogOut, Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

const Header: React.FC = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { isDarkMode, toggleDarkMode } = useTheme()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">💰</div>
            <div>
              <h1 className="text-xl font-bold">MoneyMosaic</h1>
              <p className="text-sm text-purple-100">Personal Finance Dashboard</p>
            </div>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <User size={18} />
              </div>
              <span className="text-sm font-medium">John Doe</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1 z-50 animate-fade-in">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                  <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-600" />
                <button className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
