/// <reference path="../../../types/window.d.ts" />
import { useState, useCallback } from 'react'

const waitForPlaid = (maxWaitTime = 5000): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && window.Plaid) {
      resolve()
      return
    }

    const startTime = Date.now()
    const checkInterval = setInterval(() => {
      if (typeof window !== 'undefined' && window.Plaid) {
        clearInterval(checkInterval)
        resolve()
      } else if (Date.now() - startTime > maxWaitTime) {
        clearInterval(checkInterval)
        reject(new Error('Plaid script failed to load within timeout'))
      }
    }, 100)
  })
}

export const usePlaidLink = () => {
  const [isPlaidReady, setIsPlaidReady] = useState(false)

  const initializePlaid = useCallback(async (linkToken: string) => {
    try {
      // Wait for Plaid to load
      await waitForPlaid()
      
      return new Promise<{ publicToken: string; metadata: any }>((resolve, reject) => {
        // Check if Plaid is loaded
        console.log('Checking Plaid availability:', {
          windowDefined: typeof window !== 'undefined',
          plaidDefined: typeof window !== 'undefined' && !!window.Plaid
        })
        
        if (typeof window !== 'undefined' && window.Plaid) {
          try {
            console.log('Creating Plaid handler with token:', linkToken.substring(0, 10) + '...')
            
            const handler = window.Plaid.create({
              token: linkToken,
              onSuccess: (public_token: string, metadata: any) => {
                console.log('Plaid onSuccess called:', { public_token: public_token.substring(0, 10) + '...', metadata })
                resolve({ publicToken: public_token, metadata })
              },
              onExit: (err: any) => {
                console.log('Plaid onExit called:', err)
                if (err) {
                  reject(new Error(err.display_message || 'Plaid Link failed'))
                } else {
                  reject(new Error('User cancelled the flow'))
                }
              },
              onEvent: (eventName: string, metadata: any) => {
                console.log('Plaid event:', eventName, metadata)
              }
            })
            
            console.log('Opening Plaid handler...')
            handler.open()
            setIsPlaidReady(true)
          } catch (error) {
            console.error('Error initializing Plaid Link:', error)
            reject(new Error('Failed to initialize Plaid Link'))
          }
        } else {
          console.error('Plaid is not loaded. Window:', typeof window, 'Plaid:', typeof window !== 'undefined' ? !!window.Plaid : 'N/A')
          reject(new Error('Plaid is not loaded'))
        }
      })
    } catch (error) {
      console.error('Error waiting for Plaid to load:', error)
      throw new Error('Plaid script failed to load')
    }
  }, [])

  const exchangeToken = useCallback(async (publicToken: string, metadata: any) => {
    try {
      const response = await fetch('/api/token/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          public_token: publicToken,
          institution: metadata.institution
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Token exchange failed')
      }
      
      return data
    } catch (error) {
      console.error('Error exchanging token:', error)
      throw error
    }
  }, [])

  return {
    isPlaidReady,
    initializePlaid,
    exchangeToken
  }
}
