import React from 'react'
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface CategoryBreakdownData {
  category: string
  amount: number
  percentage: number
  color: string
}

interface PieChartProps {
  data: CategoryBreakdownData[]
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
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
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-white">{data.category}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatCurrency(data.amount)} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }: any) => {
    if (percentage < 5) return null // Don't show labels for small slices
    
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${percentage.toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="w-full">
      <div className="w-full h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsPieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </RechartsPieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-sm">
        {data.map((entry, index) => (
          <div key={`legend-${index}`} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-700 dark:text-gray-300 truncate">
              {entry.category}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-auto">
              {entry.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PieChart
