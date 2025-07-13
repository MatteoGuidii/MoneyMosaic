import React, { useState } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  AnalyticsHeader,
  PeriodSelector,
  SummaryCards,
  SpendingAlerts,
  CategoryTrends,
  TopMerchants,
  SavingsOpportunities,
  CategoryAnalysisModal
} from './components'
import { useAnalyticsData } from './hooks'

const AnalyticsPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const { loading, data, loadCategoryAnalysis } = useAnalyticsData(selectedPeriod)

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    loadCategoryAnalysis(category)
  }

  const handleCloseModal = () => {
    setSelectedCategory(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <AnalyticsHeader />
      
      <PeriodSelector 
        selectedPeriod={selectedPeriod} 
        onPeriodChange={setSelectedPeriod} 
      />

      {data.summary && (
        <SummaryCards 
          summary={data.summary} 
          selectedPeriod={selectedPeriod} 
        />
      )}

      {data.alerts && <SpendingAlerts alerts={data.alerts} />}

      {data.trends && (
        <CategoryTrends 
          trends={data.trends} 
          onCategorySelect={handleCategorySelect} 
        />
      )}

      <TopMerchants merchants={data.trends?.topMerchants || []} />

      <SavingsOpportunities 
        opportunities={data.insights?.savingsOpportunities || []} 
      />

      <CategoryAnalysisModal
        isOpen={!!selectedCategory}
        category={selectedCategory}
        analysis={data.categoryAnalysis}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default AnalyticsPage
