import React from 'react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { ChartData, AssetAllocation, SectorAllocation } from '../types/investment-types'
import { formatCurrency, formatDate, CHART_COLORS } from '../utils/investment-utils'

interface PortfolioChartsProps {
  chartData: ChartData
  assetAllocation: AssetAllocation[]
  sectorAllocation: SectorAllocation[]
}

const PortfolioCharts: React.FC<PortfolioChartsProps> = ({
  chartData,
  assetAllocation,
  sectorAllocation
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {formatCurrency(item.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const ReturnsTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded shadow">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(label)}
          </p>
          <p className="text-sm" style={{ color: payload[0].color }}>
            Return: {formatCurrency(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Portfolio Performance Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Portfolio Performance
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData.portfolioData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#8b5cf6" 
                strokeWidth={2}
                name="Portfolio Value"
                dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="costBasis" 
                stroke="#94a3b8" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Cost Basis"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Asset Allocation
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={assetAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {assetAllocation.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Returns */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Daily Returns
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData.dailyReturns}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDate}
                className="text-xs"
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                className="text-xs"
              />
              <Tooltip content={<ReturnsTooltip />} />
              <Bar 
                dataKey="return" 
                fill="#06b6d4"
                name="Daily Return"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sector Allocation
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={sectorAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage?.toFixed(1)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {sectorAllocation.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value as number)} />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default PortfolioCharts
