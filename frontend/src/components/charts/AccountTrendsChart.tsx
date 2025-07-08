import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface BalanceTrendsData {
  date: string
  totalBalance: number
  checkingBalance: number
  savingsBalance: number
  creditBalance: number
}

interface AccountTrendsChartProps {
  data: BalanceTrendsData[]
}

const AccountTrendsChart: React.FC<AccountTrendsChartProps> = ({ data }) => {
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
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
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

  return (
    <div className="h-80">
      {data.every(d => d.totalBalance === 0 && d.checkingBalance === 0 && d.savingsBalance === 0) ? (
        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
          <div className="text-center">
            <p className="text-lg font-medium">No Account Data</p>
            <p className="text-sm">Connect your accounts to see balance trends</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              tickFormatter={formatCurrency}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="totalBalance"
              stackId="1"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.6}
              name="Total Balance"
            />
            <Area
              type="monotone"
              dataKey="checkingBalance"
              stackId="2"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
              name="Checking"
            />
            <Area
              type="monotone"
              dataKey="savingsBalance"
              stackId="3"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
              name="Savings"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default AccountTrendsChart
