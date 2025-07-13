import React, { useEffect, useState } from 'react'

const DebugTransactions: React.FC = () => {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        console.log('Fetching transactions from /api/transactions...')
        
        const response = await fetch('/api/transactions?range=180&limit=10')
        console.log('Response status:', response.status)
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const result = await response.json()
        console.log('Response data:', result)
        setData(result)
      } catch (err) {
        console.error('Error fetching transactions:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">Debug Transactions</h1>
      <div className="mb-4">
        <strong>Total transactions:</strong> {data?.total || 0}
      </div>
      <div className="mb-4">
        <strong>Returned transactions:</strong> {data?.transactions?.length || 0}
      </div>
      <div>
        <h2 className="text-lg mb-2">First 5 transactions:</h2>
        <pre className="bg-gray-100 p-4 overflow-auto text-sm">
          {JSON.stringify(data?.transactions?.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default DebugTransactions
