import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import LoadingSpinner from './components/LoadingSpinner'
import './index.css'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const BudgetsGoals = lazy(() => import('./pages/BudgetsGoals'))
const Investments = lazy(() => import('./pages/Investments'))
const Reports = lazy(() => import('./pages/Reports'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Settings = lazy(() => import('./pages/Settings'))

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Layout>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner size="large" />
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets-goals" element={<BudgetsGoals />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
