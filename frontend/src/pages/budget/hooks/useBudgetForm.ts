import { useState, useEffect } from 'react'
import { BudgetFormData } from '../types'
import { getCategoryMax } from '../utils'
import { BudgetData } from '../../../services/types'

export const useBudgetForm = (availableCategories: string[], budgets: BudgetData[] = []) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [formData, setFormData] = useState<BudgetFormData>({ category: '', amount: 0 })
  const [sliderMax, setSliderMax] = useState(5000)

  // Update slider max when form data changes
  useEffect(() => {
    if (formData.category) {
      setSliderMax(getCategoryMax(formData.category))
    }
  }, [formData.category])

  const resetForm = () => {
    setFormData({ category: '', amount: 0 })
    setEditingCategory(null)
    setShowAddForm(false)
  }

  const startEditing = (category: string, amount: number) => {
    setFormData({ category, amount })
    setEditingCategory(category)
    setShowAddForm(true)
  }

  const startAdding = () => {
    setShowAddForm(true)
    setEditingCategory(null)
    setFormData({ category: '', amount: 0 })
  }

  const getAvailableCategories = () => {
    if (editingCategory) {
      return availableCategories.filter(cat => cat === editingCategory)
    }
    return availableCategories.filter(cat => !budgets.find(b => b.category === cat))
  }

  return {
    showAddForm,
    setShowAddForm,
    editingCategory,
    setEditingCategory,
    formData,
    setFormData,
    sliderMax,
    setSliderMax,
    resetForm,
    startEditing,
    startAdding,
    getAvailableCategories
  }
}
