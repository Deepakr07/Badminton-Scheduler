"use client"

import { ReactNode } from 'react'

interface PageLayoutProps {
  children: ReactNode
  className?: string
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className={`min-h-screen bg-white p-2 sm:p-4 pt-4 sm:pt-8 ${className}`}>
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {children}
      </div>
    </div>
  )
}