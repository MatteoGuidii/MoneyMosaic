import React from 'react'
import { PaginationInfo } from '../types'

interface TablePaginationProps extends PaginationInfo {
  onPageChange: (page: number) => void
}

/**
 * Pagination component for table navigation
 */
const TablePagination: React.FC<TablePaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange
}) => {
  if (totalPages <= 1) return null

  const startItem = ((currentPage - 1) * itemsPerPage) + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    const startPage = Math.max(1, Math.min(totalPages - maxPagesToShow + 1, currentPage - 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          Showing {startItem} to {endItem} of {totalItems} transactions
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          {getPageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                pageNum === currentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              {pageNum}
            </button>
          ))}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default TablePagination
