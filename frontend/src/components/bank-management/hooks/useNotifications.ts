import { useState, useCallback } from 'react'

export const useNotifications = () => {
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const showError = useCallback((message: string) => {
    setError(message)
    setSuccessMessage(null)
  }, [])

  const showSuccess = useCallback((message: string) => {
    setSuccessMessage(message)
    setError(null)
  }, [])

  const clearNotifications = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  return {
    error,
    successMessage,
    showError,
    showSuccess,
    clearNotifications
  }
}
