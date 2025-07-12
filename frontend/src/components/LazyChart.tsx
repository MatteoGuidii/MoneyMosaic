import React, { Suspense } from 'react'
import LoadingSpinner from './ui/LoadingSpinner'

interface LazyChartProps {
  children: React.ReactNode
  height?: number
  className?: string
}

const LazyChart: React.FC<LazyChartProps> = ({ children, height, className }) => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className={className} style={{ height }}>
        {children}
      </div>
    </Suspense>
  )
}

export default LazyChart
