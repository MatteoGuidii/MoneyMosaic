import { useState } from 'react'

/**
 * Hook for managing dropdown state in accounts table
 */
export const useAccountsDropdown = () => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const handleDropdownToggle = (accountId: string) => {
    setActiveDropdown(activeDropdown === accountId ? null : accountId)
  }

  const closeDropdown = () => {
    setActiveDropdown(null)
  }

  const isDropdownActive = (accountId: string): boolean => {
    return activeDropdown === accountId
  }

  return {
    activeDropdown,
    handleDropdownToggle,
    closeDropdown,
    isDropdownActive
  }
}
