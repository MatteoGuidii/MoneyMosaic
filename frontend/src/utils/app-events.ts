// Event names for application-wide events
export const APP_EVENTS = {
  BANK_CONNECTION_CHANGED: 'bankConnectionChanged',
  DATA_SYNC_COMPLETED: 'dataSyncCompleted',
  ACCOUNT_UPDATED: 'accountUpdated',
} as const

// Utility functions for dispatching custom events
export const dispatchAppEvent = (eventName: string, detail?: any) => {
  window.dispatchEvent(new CustomEvent(eventName, { detail }))
}

export const addAppEventListener = (eventName: string, handler: (event: CustomEvent) => void) => {
  window.addEventListener(eventName, handler as EventListener)
  return () => window.removeEventListener(eventName, handler as EventListener)
}

// Helper hooks for common event patterns
export const useAppEvent = (eventName: string, handler: (event: CustomEvent) => void, deps: React.DependencyList = []) => {
  React.useEffect(() => {
    const cleanup = addAppEventListener(eventName, handler)
    return cleanup
  }, deps)
}

// For React imports
import React from 'react'
