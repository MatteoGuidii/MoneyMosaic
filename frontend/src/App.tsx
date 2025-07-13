import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/ui/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import './index.css'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Investments = lazy(() => import('./pages/Investments'))
const Budget = lazy(() => import('./pages/Budget'))
const PlaidTest = lazy(() => import('./pages/PlaidTest'))

function App() {
  return (
    <ThemeProvider>
      <Router future={{ 
        v7_relativeSplatPath: true,
        v7_startTransition: true 
      }}>
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-neutral-50 to-stone-50 dark:from-zinc-950 dark:via-neutral-950 dark:to-stone-950">
          <Layout>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="large" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/plaid-test" element={<PlaidTest />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
