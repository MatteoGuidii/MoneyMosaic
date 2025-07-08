import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface AccountDistributionData {
  type: string
  balance: number
  percentage: number
  color: string
  count: number
}

interface AccountDistributionChartProps {
  data: AccountDistributionData[]
}

const AccountDistributionChart: React.FC<AccountDistributionChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0
    }).format(value)
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{data.type}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Balance: {formatCurrency(data.balance)}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accounts: {data.count}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {data.percentage.toFixed(1)}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap gap-4 justify-center mt-4">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {entry.type}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-500">
              ({entry.count})
            </span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            outerRadius={80}
            innerRadius={40}
            paddingAngle={2}
            dataKey="balance"
            nameKey="type"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default AccountDistributionChart
