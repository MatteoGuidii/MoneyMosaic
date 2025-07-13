import { Account } from '../../../services/types'

export const exportAccountsToCSV = (accounts: Account[]): void => {
  if (accounts.length === 0) {
    throw new Error('No accounts to export')
  }

  const csvData = accounts.map(account => ({
    Name: account.name,
    Type: account.type,
    Balance: account.balance,
    'Last Updated': account.lastUpdated
  }))

  const csvContent = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'accounts_summary.csv'
  a.click()
  window.URL.revokeObjectURL(url)
}

export const filterAccounts = (
  accounts: Account[],
  filters: {
    searchTerm: string
    selectedTypes: string[]
    selectedStatus: string
  }
): Account[] => {
  return accounts.filter(account => {
    const matchesSearch = !filters.searchTerm || 
      account.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    
    const matchesType = filters.selectedTypes.length === 0 || 
      filters.selectedTypes.includes(account.type)
    
    const matchesStatus = filters.selectedStatus === 'all' || (() => {
      const lastUpdate = new Date(account.lastUpdated)
      const now = new Date()
      const diffInHours = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60)
      
      switch (filters.selectedStatus) {
        case 'healthy': return diffInHours < 24
        case 'warning': return diffInHours >= 24 && diffInHours < 72
        case 'error': return diffInHours >= 72
        default: return true
      }
    })()

    return matchesSearch && matchesType && matchesStatus
  })
}
