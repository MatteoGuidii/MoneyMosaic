import React from 'react'
import { Store } from 'lucide-react'
import { TopMerchantsProps } from '../types'
import { formatCurrency } from '../utils'

const TopMerchants: React.FC<TopMerchantsProps> = ({ merchants }) => {
  if (!merchants || merchants.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
      <div className="flex items-center mb-4">
        <Store className="w-5 h-5 text-blue-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Top Merchants
        </h2>
      </div>
      <div className="space-y-3">
        {merchants.slice(0, 5).map((merchant, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{merchant.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {merchant.frequency} transactions
              </p>
            </div>
            <span className="font-bold text-gray-900 dark:text-white">
              {formatCurrency(merchant.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TopMerchants
