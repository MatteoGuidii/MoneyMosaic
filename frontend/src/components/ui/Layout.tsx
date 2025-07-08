import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Receipt, 
  Building2,
  Menu,
  X,
  TrendingUp,
  Target,
  Sun,
  Moon,
  Sparkles
} from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useState } from 'react'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Budget', href: '/budget', icon: Target },
    { name: 'Accounts', href: '/accounts', icon: Building2 },
    { name: 'Investments', href: '/investments', icon: TrendingUp },
  ]

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-zinc-50 via-neutral-50 to-stone-50 dark:from-zinc-950 dark:via-neutral-950 dark:to-stone-950">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
        fixed inset-y-0 left-0 z-50 w-80 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl shadow-2xl transform transition-transform duration-500 ease-out 
        lg:translate-x-0 lg:static lg:inset-0 border-r border-zinc-200/40 dark:border-zinc-700/40 shadow-zinc-900/5 dark:shadow-black/20`}>
        
        {/* Logo */}
        <div className="flex items-center justify-between h-24 px-8 border-b border-zinc-200/40 dark:border-zinc-700/40">
          <div className="flex items-center space-x-4">
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 dark:shadow-emerald-400/10">
              <Sparkles size={20} className="text-white drop-shadow-sm" />
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-2xl"></div>
              <div className="absolute inset-0 ring-1 ring-white/20 rounded-2xl"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-900 via-neutral-800 to-stone-800 dark:from-zinc-100 dark:via-neutral-200 dark:to-stone-200 bg-clip-text text-transparent">
                MoneyMosaic
              </h1>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 tracking-wider uppercase">
                Wealth Platform
              </p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-12 px-8">
          <div className="mb-6">
            <p className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4">
              Navigation
            </p>
          </div>
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const active = isActive(item.href)
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center space-x-4 px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      active
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02] ring-1 ring-emerald-500/20'
                        : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 hover:scale-[1.01]'
                    }`}
                  >
                    {active && (
                      <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent rounded-2xl"></div>
                    )}
                    <Icon 
                      size={20} 
                      className={`relative z-10 ${
                        active 
                          ? 'text-white drop-shadow-sm' 
                          : 'text-zinc-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 dark:text-zinc-400'
                      } transition-colors duration-300`} 
                    />
                    <span className="relative z-10 font-medium tracking-wide">{item.name}</span>
                    {active && (
                      <div className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full opacity-90 shadow-sm"></div>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl shadow-sm border-b border-zinc-200/40 dark:border-zinc-700/40 shadow-zinc-900/5 dark:shadow-black/20">
          <div className="flex items-center justify-between px-8 py-6">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2.5 rounded-xl text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/80 transition-all duration-200"
              >
                <Menu size={20} />
              </button>
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-zinc-900 via-neutral-800 to-stone-800 dark:from-zinc-100 dark:via-neutral-200 dark:to-stone-200 bg-clip-text text-transparent">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Overview'}
                </h2>
                <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mt-1">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="group relative flex items-center space-x-3 px-5 py-3 rounded-2xl hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-all duration-300 hover:scale-105 ring-1 ring-zinc-200/50 dark:ring-zinc-700/50 hover:ring-emerald-200/50 dark:hover:ring-emerald-700/50"
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                <div className="relative">
                  {isDarkMode ? (
                    <Sun size={18} className="text-amber-500 group-hover:text-amber-600 transition-colors duration-300 drop-shadow-sm" />
                  ) : (
                    <Moon size={18} className="text-zinc-600 group-hover:text-emerald-600 dark:text-zinc-400 transition-colors duration-300" />
                  )}
                  <div className="absolute inset-0 bg-current opacity-20 rounded-full blur-sm group-hover:opacity-30 transition-opacity duration-300"></div>
                </div>
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors duration-300">
                  {isDarkMode ? 'Light' : 'Dark'}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gradient-to-br from-zinc-50 via-neutral-50 to-stone-50 dark:from-zinc-950 dark:via-neutral-950 dark:to-stone-950">
          <div className="p-8 max-w-[1400px] mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}

export default Layout
