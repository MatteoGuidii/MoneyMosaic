import React from 'react'
import { SortAsc, SortDesc } from 'lucide-react'
import { SortField, SortDirection } from '../types'

interface SortIconProps {
  field: SortField
  currentField: SortField
  direction: SortDirection
}

/**
 * Icon component for displaying sort state
 */
const SortIcon: React.FC<SortIconProps> = ({ field, currentField, direction }) => {
  if (currentField !== field) {
    return <SortAsc className="w-4 h-4 opacity-30" />
  }
  
  return direction === 'asc' ? 
    <SortAsc className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : 
    <SortDesc className="w-4 h-4 text-blue-600 dark:text-blue-400" />
}

export default SortIcon
