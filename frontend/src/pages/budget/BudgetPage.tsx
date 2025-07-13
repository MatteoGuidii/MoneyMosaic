import React from 'react'
import { BudgetData } from '../../services/types'
import { BudgetHeader, BudgetSummary, BudgetForm, BudgetList } from './components'
import { useBudgetData, useBudgetForm } from './hooks'
import { calculateBudgetSummary } from './utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import ToastContainer from '../../components/ui/ToastContainer'
import { useToast } from '../../hooks/useToast'

const BudgetPage: React.FC = () => {
  const { toasts, dismissToast } = useToast()
  const { budgets, loading, availableCategories, createOrUpdateBudget, deleteBudget } = useBudgetData()
  const {
    showAddForm,
    editingCategory,
    formData,
    setFormData,
    sliderMax,
    resetForm,
    startEditing,
    startAdding,
    getAvailableCategories
  } = useBudgetForm(availableCategories, budgets)

  const handleSaveBudget = async () => {
    const success = await createOrUpdateBudget(formData, !!editingCategory)
    if (success) {
      resetForm()
    }
  }

  const handleEditBudget = (budget: BudgetData) => {
    startEditing(budget.category, budget.budgeted)
  }

  const handleDeleteBudget = async (category: string) => {
    await deleteBudget(category)
  }

  const budgetSummary = calculateBudgetSummary(budgets)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      
      <BudgetHeader onAddBudget={startAdding} />
      
      <BudgetSummary summary={budgetSummary} />
      
      <BudgetForm
        formData={formData}
        setFormData={setFormData}
        showAddForm={showAddForm}
        editingCategory={editingCategory}
        availableCategories={getAvailableCategories()}
        sliderMax={sliderMax}
        onSave={handleSaveBudget}
        onCancel={resetForm}
      />
      
      <BudgetList
        budgets={budgets}
        onEdit={handleEditBudget}
        onDelete={handleDeleteBudget}
      />
    </div>
  )
}

export default BudgetPage
