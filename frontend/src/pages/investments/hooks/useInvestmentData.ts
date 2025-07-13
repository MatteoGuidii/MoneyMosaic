import { useState, useEffect, useCallback, useMemo } from 'react'
import { apiService, Investment as ApiInvestment } from '../../../services/apiService'
import { PortfolioSummary, SectorAllocation, InvestmentFilters } from '../types/investment-types'
import { getSector } from '../utils/investment-utils'

export const useInvestmentData = () => {
  const [investments, setInvestments] = useState<ApiInvestment[]>([])
  const [investmentSummary, setInvestmentSummary] = useState<any>(null)
  const [investmentAccounts, setInvestmentAccounts] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const loadInvestments = useCallback(async () => {
    try {
      setLoading(true)
      const { investments: investmentData, accounts: accountData, summary: summaryData } = await apiService.fetchInvestmentData()
      
      setInvestments(investmentData)
      setInvestmentAccounts(accountData)
      setInvestmentSummary(summaryData)
    } catch (error) {
      console.error('Error loading investments:', error)
      setInvestments([])
      setInvestmentAccounts({})
      setInvestmentSummary({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInvestments()
  }, [loadInvestments])

  const portfolioSummary = useMemo((): PortfolioSummary => {
    const summary = {
      totalValue: investmentSummary?.totalValue || investmentAccounts?.totalValue || investments.reduce((sum, inv) => sum + inv.marketValue, 0),
      totalCostBasis: investmentSummary?.totalCostBasis || investments.reduce((sum, inv) => sum + (inv.costBasis || inv.quantity * inv.marketPrice * 0.9), 0),
      unrealizedPL: investmentSummary?.totalDayChange || investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
      unrealizedPLPercent: 0,
      todayReturn: investmentSummary?.totalDayChange || investments.reduce((sum, inv) => sum + inv.dayChange * inv.quantity, 0),
      todayReturnPercent: investmentSummary?.totalDayChangePercent || 0,
      cashBalance: 5430.25
    }

    summary.unrealizedPL = summary.totalValue - summary.totalCostBasis
    summary.unrealizedPLPercent = summary.totalCostBasis > 0 ? 
      (summary.unrealizedPL / summary.totalCostBasis) * 100 : 0
    summary.todayReturnPercent = summary.totalValue > 0 ? 
      (summary.todayReturn / summary.totalValue) * 100 : 0

    return summary
  }, [investments, investmentSummary, investmentAccounts])

  const sectorAllocation = useMemo((): SectorAllocation[] => {
    const sectors = investmentSummary?.sectorAllocation?.map((item: any) => ({
      name: item.sector,
      value: item.value,
      percentage: item.percentage
    })) || 
    investments.reduce((acc: SectorAllocation[], inv) => {
      const sector = inv.sector || getSector(inv.companyName)
      
      const existing = acc.find(item => item.name === sector)
      if (existing) {
        existing.value += inv.marketValue
      } else {
        acc.push({ name: sector, value: inv.marketValue, percentage: 0 })
      }
      return acc
    }, [])

    if (Array.isArray(sectors) && portfolioSummary.totalValue > 0) {
      sectors.forEach(sector => {
        sector.percentage = (sector.value / portfolioSummary.totalValue) * 100
      })
    }

    return sectors
  }, [investments, investmentSummary, portfolioSummary.totalValue])

  const sectors = useMemo(() => {
    return ['All', ...Array.from(new Set(investments.map(inv => getSector(inv.companyName, inv.sector))))]
  }, [investments])

  return {
    investments,
    investmentSummary,
    investmentAccounts,
    portfolioSummary,
    sectorAllocation,
    sectors,
    loading,
    loadInvestments
  }
}

export const useInvestmentFilters = (investments: ApiInvestment[]) => {
  const [filters, setFilters] = useState<InvestmentFilters>({
    searchTerm: '',
    filterSector: 'All',
    currentPage: 1
  })

  useEffect(() => {
    setFilters(prev => ({ ...prev, currentPage: 1 }))
  }, [filters.searchTerm, filters.filterSector])

  const filteredInvestments = useMemo(() => {
    return investments.filter(investment => {
      const matchesSearch = investment.symbol.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                           investment.companyName.toLowerCase().includes(filters.searchTerm.toLowerCase())
      const matchesSector = filters.filterSector === 'All' || getSector(investment.companyName, investment.sector) === filters.filterSector
      return matchesSearch && matchesSector
    })
  }, [investments, filters.searchTerm, filters.filterSector])

  const updateFilters = useCallback((newFilters: Partial<InvestmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  return {
    filters,
    filteredInvestments,
    updateFilters
  }
}
