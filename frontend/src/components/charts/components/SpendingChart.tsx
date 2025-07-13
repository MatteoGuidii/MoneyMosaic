import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { SpendingChartProps } from '../types'
import { formatCurrency, formatDate } from '../utils'
import ChartContainer from './ChartContainer'

/**
 * Spending vs Income line chart component
 */
const SpendingChart: React.FC<SpendingChartProps> = ({ spendingData }) => {
  const chartIcon = <div className="w-5 h-5 border-2 border-white rounded-full"></div>

  const emptyState = (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <TrendingUp className="w-12 h-12 mb-4 opacity-30" />
      <h4 className="text-lg font-medium mb-2">No Transaction Data</h4>
      <p className="text-sm text-center">
        Connect your bank accounts to see spending vs income trends
      </p>
    </div>
  )

  const chart = (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={spendingData}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatDate}
          className="text-sm"
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={formatCurrency}
          className="text-sm"
          axisLine={false}
          tickLine={false}
        />
        <Tooltip 
          formatter={(value: number) => [formatCurrency(value), '']}
          labelFormatter={(label: string) => formatDate(label)}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Legend />
        <Line 
          type="monotone" 
          dataKey="spending" 
          stroke="#ef4444" 
          strokeWidth={3}
          name="Spending"
          dot={{ fill: '#ef4444', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, fill: '#ef4444' }}
        />
        <Line 
          type="monotone" 
          dataKey="income" 
          stroke="#10b981" 
          strokeWidth={3}
          name="Income"
          dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
          activeDot={{ r: 7, fill: '#10b981' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )

  return (
    <ChartContainer
      title="Spending vs Income"
      subtitle="Financial flow analysis"
      icon={chartIcon}
    >
      <div className="h-80">
        {spendingData.length > 0 ? chart : emptyState}
      </div>
    </ChartContainer>
  )
}

export default SpendingChart
