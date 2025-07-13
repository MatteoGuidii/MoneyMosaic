import React from 'react'
import { Save, X } from 'lucide-react'
import { BudgetFormData } from '../types'
import { formatCurrency, getPresetAmounts } from '../utils'

interface BudgetFormProps {
  formData: BudgetFormData
  setFormData: (data: BudgetFormData) => void
  showAddForm: boolean
  editingCategory: string | null
  availableCategories: string[]
  sliderMax: number
  onSave: () => Promise<void>
  onCancel: () => void
}

const BudgetForm: React.FC<BudgetFormProps> = ({
  formData,
  setFormData,
  showAddForm,
  editingCategory,
  availableCategories,
  sliderMax,
  onSave,
  onCancel
}) => {

  if (!showAddForm) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {editingCategory ? 'Edit Budget' : 'Add New Budget'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Category
          </label>
          {editingCategory ? (
            <input
              type="text"
              value={formData.category}
              disabled
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          ) : (
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">Select a category</option>
              {availableCategories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Budget Amount
          </label>
          
          {/* Range Slider */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={sliderMax}
              step="25"
              value={Math.min(formData.amount, sliderMax)}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${(Math.min(formData.amount, sliderMax) / sliderMax) * 100}%, #e5e7eb ${(Math.min(formData.amount, sliderMax) / sliderMax) * 100}%, #e5e7eb 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>$0</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">
                {formatCurrency(formData.amount)}
              </span>
              <span>{formatCurrency(sliderMax)}</span>
            </div>
            <div className="text-center mt-1">
              <span className="text-xs text-gray-400 dark:text-gray-500">
                Suggested range for {formData.category || 'this category'}
              </span>
            </div>
            
            {/* Quick Preset Buttons */}
            {formData.category && (
              <div className="flex justify-center gap-2 mt-3">
                {getPresetAmounts(sliderMax).map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setFormData({ ...formData, amount })}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      formData.amount === amount
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {formatCurrency(amount)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Number Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              $
            </div>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              placeholder="Enter budget amount"
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          <X className="w-4 h-4 inline mr-2" />
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Save className="w-4 h-4 inline mr-2" />
          Save Budget
        </button>
      </div>
    </div>
  )
}

export default BudgetForm
