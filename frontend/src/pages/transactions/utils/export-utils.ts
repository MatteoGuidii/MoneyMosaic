export const exportTransactionsToCSV = (transactions: any[], filters: any): void => {
  if (transactions.length === 0) {
    throw new Error('No transactions to export')
  }

  const csvData = transactions.map(t => ({
    Date: t.date,
    Description: t.name.replace(/,/g, ';'), // Replace commas to avoid CSV issues
    Amount: t.amount,
    Category: t.category,
    Account: t.account_name || t.account_id,
    Status: t.pending ? 'Pending' : 'Posted'
  }))
  
  const csvContent = [
    Object.keys(csvData[0]).join(','),
    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
  ].join('\n')
  
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `transactions_${filters.dateRange}_days.csv`
  a.click()
  window.URL.revokeObjectURL(url)
};
