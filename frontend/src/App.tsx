import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import LoadingSpinner from './components/LoadingSpinner'
import './index.css'

// Lazy load the Dashboard component
const Dashboard = lazy(() => import('./components/Dashboard'))

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <LoadingSpinner />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </Suspense>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
