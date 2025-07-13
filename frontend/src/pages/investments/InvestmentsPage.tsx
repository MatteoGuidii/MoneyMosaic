import React, { useState, useMemo } from 'react'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import SyncButton from '../../components/SyncButton'
import { DateRange } from './types/investment-types'
import { DATE_RANGES, generateMockChartData, generateMockAssetAllocation } from './utils/investment-utils'
import { useInvestmentData, useInvestmentFilters } from './hooks/useInvestmentData'
import PortfolioSummaryCards from './components/PortfolioSummaryCards'
import PortfolioCharts from './components/PortfolioCharts'
import InvestmentFilters from './components/InvestmentFilters'
import InvestmentHoldingsTable from './components/InvestmentHoldingsTable'
import InvestmentModal from './components/InvestmentModal'
import EmptyState from './components/EmptyState'

const Investments: React.FC = () => {
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>(DATE_RANGES[1])
  const [selectedInvestment, setSelectedInvestment] = useState<any>(null)
  const [showInvestmentModal, setShowInvestmentModal] = useState(false)

  const {
    investments,
    investmentAccounts,
    portfolioSummary,
    sectorAllocation,
    sectors,
    loading,
    loadInvestments
  } = useInvestmentData()

  const { filters, filteredInvestments, updateFilters } = useInvestmentFilters(investments)

  const chartData = useMemo(() => generateMockChartData(portfolioSummary), [portfolioSummary])
  const assetAllocation = useMemo(() => generateMockAssetAllocation(portfolioSummary.totalValue), [portfolioSummary.totalValue])

  const handleInvestmentClick = (investment: any) => {
    setSelectedInvestment(investment)
    setShowInvestmentModal(true)
  }

  const handleCloseModal = () => {
    setShowInvestmentModal(false)
    setSelectedInvestment(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  if (investments.length === 0 && !investmentAccounts?.hasInvestmentAccounts) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your portfolio performance and holdings
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 sm:mt-0">
            <SyncButton 
              variant="button" 
              onSyncComplete={loadInvestments}
              investmentOnly={true}
            />
          </div>
        </div>
        <EmptyState investmentAccounts={investmentAccounts} portfolioSummary={portfolioSummary} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Investments</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Track your portfolio performance and holdings
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <SyncButton 
            variant="button" 
            onSyncComplete={loadInvestments}
            investmentOnly={true}
          />
        </div>
      </div>

      {/* Portfolio Summary */}
      <PortfolioSummaryCards portfolioSummary={portfolioSummary} />

      {/* Portfolio Charts */}
      <PortfolioCharts 
        chartData={chartData}
        assetAllocation={assetAllocation}
        sectorAllocation={sectorAllocation}
      />

      {/* Holdings Section */}
      {investments.length > 0 && (
        <>
          <InvestmentFilters
            filters={filters}
            sectors={sectors}
            selectedDateRange={selectedDateRange}
            onFiltersChange={updateFilters}
            onDateRangeChange={setSelectedDateRange}
          />

          <InvestmentHoldingsTable
            investments={filteredInvestments}
            currentPage={filters.currentPage}
            onPageChange={(page) => updateFilters({ currentPage: page })}
            onInvestmentClick={handleInvestmentClick}
          />
        </>
      )}

      {/* Investment Detail Modal */}
      <InvestmentModal
        investment={selectedInvestment}
        isOpen={showInvestmentModal}
        onClose={handleCloseModal}
      />
    </div>
  )
}

export default Investments
