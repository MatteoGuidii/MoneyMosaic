import React from 'react'
import { X, TrendingUp, TrendingDown, Building2 } from 'lucide-react'
import { Investment } from '../../../services/apiService'
import { formatCurrency, formatPercent, getSector } from '../utils/investment-utils'

interface InvestmentModalProps {
  investment: Investment | null
  isOpen: boolean
  onClose: () => void
}

const InvestmentModal: React.FC<InvestmentModalProps> = ({ investment, isOpen, onClose }) => {
  if (!isOpen || !investment) return null

  const unrealizedPL = investment.marketValue - (investment.costBasis || investment.quantity * investment.marketPrice * 0.9)
  const unrealizedPLPercent = (investment.costBasis || investment.quantity * investment.marketPrice * 0.9) > 0 ? 
    (unrealizedPL / (investment.costBasis || investment.quantity * investment.marketPrice * 0.9)) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {investment.symbol}
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {investment.companyName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(investment.marketPrice)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    {investment.dayChange >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500 mr-1" />
                    )}
                    <span className={`text-sm ${
                      investment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(investment.dayChangePercent)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Market Value</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(investment.marketValue)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {investment.quantity} shares
              </p>
            </div>
          </div>

          {/* Position Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Position Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Quantity:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {investment.quantity}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Cost Basis:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {formatCurrency(investment.costBasis || investment.quantity * investment.marketPrice * 0.9)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Unrealized P&L:</span>
                <span className={`font-medium ${
                  unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(unrealizedPL)} ({formatPercent(unrealizedPLPercent)})
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Day Change:</span>
                <span className={`font-medium ${
                  investment.dayChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(investment.dayChange * investment.quantity)}
                </span>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Account Information
            </h3>
            
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <Building2 className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {investment.accountName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {investment.institutionName}
                </p>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Company Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Sector:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {getSector(investment.companyName, investment.sector)}
                </span>
              </div>
              
              {investment.industry && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Industry:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {investment.industry}
                  </span>
                </div>
              )}
              
              {investment.securityType && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Security Type:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {investment.securityType}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentModal
