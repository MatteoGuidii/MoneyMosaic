import React, { useState } from 'react'
import NetWorthTrend from '../components/NetWorthTrend'
import CashFlowForecast from '../components/CashFlowForecast'
import ExportComponent from '../components/ExportComponent'
import { BarChart3, TrendingUp, Calendar, Download, FileText, PieChart } from 'lucide-react'

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'net-worth' | 'cash-flow' | 'export'>('net-worth')

  const tabs = [
    { id: 'net-worth', label: 'Net Worth Trend', icon: TrendingUp },
    { id: 'cash-flow', label: 'Cash Flow Forecast', icon: BarChart3 },
    { id: 'export', label: 'Export Data', icon: Download }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-navy-600 to-purple-600 dark:from-navy-700 dark:to-purple-700 rounded-lg p-6 text-white">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">Reports & Analytics</h1>
            <p className="text-navy-100 dark:text-navy-200">
              Comprehensive financial insights and data analysis
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Net Worth Growth</span>
          </div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
            +12.5%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">This year</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Avg Monthly Flow</span>
          </div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            +$2,450
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Last 3 months</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <PieChart className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Savings Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            28%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Of income</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Report Period</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
            365
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Days tracked</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-navy-500 text-navy-600 dark:text-navy-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'net-worth' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Net Worth Analysis
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Track your wealth growth over time with detailed trend analysis
                </p>
              </div>
              <NetWorthTrend />
            </div>
          )}

          {activeTab === 'cash-flow' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Cash Flow Forecast
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Predict your future financial position based on current spending patterns
                </p>
              </div>
              <CashFlowForecast />
            </div>
          )}

          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Export Your Data
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Download your financial data in various formats for external analysis
                </p>
              </div>
              <div className="max-w-md mx-auto">
                <ExportComponent />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Report Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Key Insights
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Strong Savings Growth
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Your savings rate has improved by 5% this quarter
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Consistent Investment Returns
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Portfolio showing steady 8% annual growth
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Dining Budget Exceeded
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consider reducing restaurant expenses by 20%
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommended Actions
          </h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Increase Emergency Fund
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Target 6 months of expenses for better security
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Review Subscription Services
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Cancel unused subscriptions to save $150/month
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Diversify Investments
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Consider adding international funds to portfolio
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Reports
