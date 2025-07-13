import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { PieChartIcon } from 'lucide-react'
import { CategoryChartProps } from '../types'
import { formatCurrency, generateCategoryOptions, filterCategoryData, CHART_COLORS } from '../utils'
import { useCategoryChart } from '../hooks'
import ChartContainer from './ChartContainer'
import CategoryList from './CategoryList'

/**
 * Category spending pie chart component
 */
const CategoryChart: React.FC<CategoryChartProps> = ({ 
  categoryData, 
  onCategorySelect,
  onCategoryPeriodChange 
}) => {
  const {
    categoryPeriod,
    selectedCategory,
    handleCategoryPeriodChange,
    handleCategorySelectionChange
  } = useCategoryChart(onCategoryPeriodChange)

  const filteredData = filterCategoryData(categoryData, selectedCategory)
  const categoryOptions = generateCategoryOptions(categoryData)

  const chartIcon = <div className="w-5 h-5 border-2 border-white rounded-full border-dashed"></div>

  const actions = (
    <>
      <select
        value={selectedCategory}
        onChange={(e) => handleCategorySelectionChange(e.target.value)}
        className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        {categoryOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <select
        value={categoryPeriod}
        onChange={(e) => handleCategoryPeriodChange(e.target.value)}
        className="text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      >
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
        <option value="180">Last 6 months</option>
      </select>
    </>
  )

  const emptyState = (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
      <PieChartIcon className="w-12 h-12 mb-4 opacity-30" />
      <h4 className="text-lg font-medium mb-2">No Category Data</h4>
      <p className="text-sm text-center">
        Connect your bank accounts to see spending breakdown by category
      </p>
    </div>
  )

  const pieChart = (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={140}
          paddingAngle={2}
          dataKey="amount"
          onClick={(data) => onCategorySelect(data.category)}
          className="cursor-pointer"
        >
          {filteredData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value: number) => formatCurrency(value)} 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  )

  return (
    <ChartContainer
      title="Spending by Category"
      subtitle="Category breakdown"
      icon={chartIcon}
      actions={actions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80">
          {filteredData.length > 0 ? pieChart : emptyState}
        </div>
        <CategoryList
          categoryData={filteredData}
          selectedCategory={selectedCategory}
          onCategorySelect={onCategorySelect}
          colors={CHART_COLORS}
        />
      </div>
    </ChartContainer>
  )
}

export default CategoryChart
