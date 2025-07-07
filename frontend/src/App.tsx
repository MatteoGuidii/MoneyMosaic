import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/ui/Layout'
import LoadingSpinner from './components/ui/LoadingSpinner'
import './index.css'

// Lazy load pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Transactions = lazy(() => import('./pages/Transactions'))
const Accounts = lazy(() => import('./pages/Accounts'))
const Investments = lazy(() => import('./pages/Investments'))

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
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/investments" element={<Investments />} />
              </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
