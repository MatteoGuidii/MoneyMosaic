import { useState, useCallback } from 'react'
import { Toast } from '../components/ui/Toast'

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = {
      id,
      message,
      type,
      duration
    }

    setToasts(prev => [...prev, toast])
    return id
  }, [])

  const dismissToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const success = useCallback((message: string, duration?: number) => 
    showToast(message, 'success', duration), [showToast])

  const error = useCallback((message: string, duration?: number) => 
    showToast(message, 'error', duration), [showToast])

  const warning = useCallback((message: string, duration?: number) => 
    showToast(message, 'warning', duration), [showToast])

  const info = useCallback((message: string, duration?: number) => 
    showToast(message, 'info', duration), [showToast])

  return {
    toasts,
    showToast,
    dismissToast,
    success,
    error,
    warning,
    info
  }
}
