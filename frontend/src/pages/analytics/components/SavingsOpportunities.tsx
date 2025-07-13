import React from 'react'
import { Lightbulb } from 'lucide-react'
import { SavingsOpportunitiesProps } from '../types'
import { formatCurrency } from '../utils'

const SavingsOpportunities: React.FC<SavingsOpportunitiesProps> = ({ opportunities }) => {
  if (!opportunities || opportunities.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm mb-8">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Savings Opportunities
        </h2>
      </div>
      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <div key={index} className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium text-green-900 dark:text-green-100">
                  {opportunity.category}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                  {opportunity.suggestion}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(opportunity.potentialSavings)}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  potential savings
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SavingsOpportunities
