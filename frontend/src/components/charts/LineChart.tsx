import React from 'react'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface TransactionTrendsData {
  date: string
  income: number
  spending: number
}

interface LineChartProps {
  data: TransactionTrendsData[]
}

const LineChart: React.FC<LineChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  // If no data or all data points are empty (all zeros), show empty state
  const hasData = data && data.length > 0 && 
    data.some(item => item.income > 0 || item.spending > 0)

  if (!hasData) {
    return (
      <div className="w-full h-64 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
        <TrendingUp className="w-12 h-12 mb-4 opacity-30" />
        <h4 className="text-lg font-medium mb-2">No Transaction Data</h4>
        <p className="text-sm text-center">
          Connect your bank accounts to see transaction trends
        </p>
      </div>
    )
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis 
            dataKey="date" 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            className="text-xs text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="income" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Income"
            dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          />
          <Line 
            type="monotone" 
            dataKey="spending" 
            stroke="#ef4444" 
            strokeWidth={2}
            name="Spending"
            dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
          />

        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default LineChart
