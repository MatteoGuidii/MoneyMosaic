import { useState, useEffect } from 'react'
import { apiService } from '../../../services/apiService'
import { BudgetData } from '../../../services/types'
import { BudgetFormData } from '../types'
import { useToast } from '../../../hooks/useToast'

export const useBudgetData = () => {
  const [budgets, setBudgets] = useState<BudgetData[]>([])
  const [loading, setLoading] = useState(true)
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const { success, error: showError } = useToast()

  const loadBudgets = async () => {
    try {
      setLoading(true)
      const budgetData = await apiService.fetchBudgetData()
      setBudgets(budgetData)
    } catch (error) {
      console.error('Error loading budgets:', error)
      showError('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      const categories = await apiService.fetchCategories()
      setAvailableCategories(categories)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const createOrUpdateBudget = async (formData: BudgetFormData, isEditing: boolean) => {
    try {
      if (!formData.category || formData.amount <= 0) {
        showError('Please enter a valid category and amount')
        return false
      }

      await apiService.createOrUpdateBudget(formData.category, formData.amount)
      success(isEditing ? 'Budget updated successfully' : 'Budget created successfully')
      loadBudgets()
      return true
    } catch (error) {
      console.error('Error saving budget:', error)
      showError('Failed to save budget')
      return false
    }
  }

  const deleteBudget = async (category: string) => {
    try {
      await apiService.deleteBudget(category)
      success('Budget deleted successfully')
      loadBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      showError('Failed to delete budget')
    }
  }

  useEffect(() => {
    loadBudgets()
    loadCategories()
  }, [])

  return {
    budgets,
    loading,
    availableCategories,
    createOrUpdateBudget,
    deleteBudget,
    loadBudgets
  }
}
