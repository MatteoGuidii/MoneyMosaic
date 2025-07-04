import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import { ThemeProvider } from './contexts/ThemeContext'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  )
}

export default App
