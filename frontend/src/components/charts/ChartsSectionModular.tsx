import React from 'react'
import { ChartsSectionProps } from './types'
import { SpendingChart, CategoryChart } from './components'

/**
 * Main charts section component
 */
const ChartsSection: React.FC<ChartsSectionProps> = ({ 
  spendingData, 
  categoryData, 
  onCategorySelect,
  onCategoryPeriodChange 
}) => {
  return (
    <div className="space-y-8">
      <SpendingChart spendingData={spendingData} />
      <CategoryChart
        categoryData={categoryData}
        onCategorySelect={onCategorySelect}
        onCategoryPeriodChange={onCategoryPeriodChange}
      />
    </div>
  )
}

export default ChartsSection
