import React, { useState, useEffect, useRef } from 'react'
import LoadingSpinner from './ui/LoadingSpinner'

interface LazyChartProps {
  children: React.ReactNode
  className?: string
  height?: number
  threshold?: number
}

const LazyChart: React.FC<LazyChartProps> = ({ 
  children, 
  className = '', 
  height = 300, 
  threshold = 100 
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isIntersecting, setIsIntersecting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true)
          // Add a small delay to ensure smooth loading
          setTimeout(() => {
            setIsVisible(true)
          }, 100)
        }
      },
      {
        threshold: 0.1,
        rootMargin: `${threshold}px`
      }
    )

    if (chartRef.current) {
      observer.observe(chartRef.current)
    }

    return () => {
      if (chartRef.current) {
        observer.unobserve(chartRef.current)
      }
    }
  }, [threshold])

  return (
    <div 
      ref={chartRef} 
      className={`${className} transition-opacity duration-300`}
      style={{ minHeight: height }}
    >
      {!isIntersecting ? (
        <div 
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg animate-pulse"
          style={{ height }}
        >
          <div className="text-gray-400 dark:text-gray-500">
            <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : !isVisible ? (
        <div 
          className="flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg"
          style={{ height }}
        >
          <LoadingSpinner size="small" />
        </div>
      ) : (
        <div className="animate-fade-in">
          {children}
        </div>
      )}
    </div>
  )
}

export default LazyChart
