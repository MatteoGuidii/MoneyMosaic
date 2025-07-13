import React, { useState } from 'react'
import { dispatchAppEvent, APP_EVENTS } from '../utils/app-events'

declare global {
  interface Window {
    Plaid: {
      create: (config: {
        token: string
        onSuccess: (publicToken: string, metadata: any) => void
        onExit: (error: any) => void
        onEvent: (eventName: string, metadata: any) => void
      }) => {
        open: () => void
      }
    }
  }
}

const PlaidTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Ready to test Plaid Link')
  const [linkToken, setLinkToken] = useState<string>('')

  const createLinkToken = async () => {
    try {
      setStatus('Creating link token...')
      const response = await fetch('/api/link/token/create', { method: 'POST' })
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get link token')
      }
      
      setLinkToken(data.link_token)
      setStatus('Link token created: ' + data.link_token.substring(0, 20) + '...')
    } catch (error: any) {
      setStatus('Error: ' + error.message)
    }
  }

  const testPlaidLink = async () => {
    if (!linkToken) {
      setStatus('Please create link token first')
      return
    }

    try {
      setStatus('Waiting for Plaid to load...')
      
      // Wait for Plaid to be available
      let attempts = 0
      const maxAttempts = 50
      
      while (attempts < maxAttempts) {
        if (typeof window !== 'undefined' && window.Plaid) {
          break
        }
        await new Promise(resolve => setTimeout(resolve, 100))
        attempts++
      }
      
      if (!window.Plaid) {
        setStatus('ERROR: Plaid script did not load after 5 seconds')
        return
      }
      
      setStatus('Plaid loaded, creating handler...')
      console.log('Creating Plaid handler with token:', linkToken.substring(0, 20) + '...')
      
      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: (publicToken: string, metadata: any) => {
          setStatus('SUCCESS: Public token received: ' + publicToken.substring(0, 20) + '...')
          console.log('Plaid success:', { publicToken, metadata })
        },
        onExit: (error: any) => {
          if (error) {
            setStatus('EXIT with error: ' + (error.display_message || error.message || 'Unknown error'))
            console.log('Plaid exit error:', error)
          } else {
            setStatus('EXIT: User cancelled')
            console.log('Plaid exit: user cancelled')
          }
        },
        onEvent: (eventName: string, metadata: any) => {
          console.log('Plaid event:', eventName, metadata)
          setStatus('Event: ' + eventName)
        }
      })
      
      setStatus('Opening Plaid Link modal...')
      console.log('Calling handler.open()...')
      handler.open()
      setStatus('Plaid Link modal should now be open!')
      
    } catch (error: any) {
      setStatus('ERROR: ' + error.message)
      console.error('Plaid test error:', error)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Plaid Link Test</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold mb-2">Status:</h2>
          <p className="bg-gray-100 p-3 rounded text-sm">{status}</p>
        </div>
        
        <div className="space-x-4">
          <button
            onClick={createLinkToken}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            1. Create Link Token
          </button>
          
          <button
            onClick={testPlaidLink}
            disabled={!linkToken}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:bg-gray-400"
          >
            2. Test Plaid Link
          </button>
          
          <button
            onClick={() => {
              dispatchAppEvent(APP_EVENTS.BANK_CONNECTION_CHANGED)
              setStatus('Triggered bank connection change event')
            }}
            className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          >
            3. Test Event System
          </button>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Debug Info:</h2>
          <div className="bg-gray-100 p-3 rounded text-sm">
            <p>Window defined: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
            <p>Plaid defined: {typeof window !== 'undefined' && window.Plaid ? 'Yes' : 'No'}</p>
            <p>Plaid create function: {typeof window !== 'undefined' && window.Plaid && typeof window.Plaid.create === 'function' ? 'Yes' : 'No'}</p>
            <p>Link token: {linkToken ? linkToken.substring(0, 30) + '...' : 'Not created'}</p>
            <p>Current URL: {typeof window !== 'undefined' ? window.location.href : 'Unknown'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlaidTest
