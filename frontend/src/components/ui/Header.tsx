import React, { useState } from 'react'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'

const Header: React.FC = () => {
  const { isDarkMode, toggleDarkMode } = useTheme()
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
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-navy-600 transition-colors"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="text-sm font-medium">
                {isDarkMode ? 'Light' : 'Dark'}
              </span>
            </button>
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
            <div className="space-y-2">
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-lg hover:bg-navy-600 transition-colors"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header
