"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, Clock, Trophy, Download } from 'lucide-react'

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: 'Setup', icon: Settings, value: 'setup' },
    { href: '/current', label: 'Current Round', shortLabel: 'Current', icon: Clock, value: 'current' },
    { href: '/history', label: 'History', icon: Trophy, value: 'history' },
    { href: '/export', label: 'Export', icon: Download, value: 'export' },
  ]

  const getActiveValue = () => {
    if (pathname === '/' || pathname === '/setup') return 'setup'
    if (pathname === '/current') return 'current'
    if (pathname === '/history') return 'history'
    if (pathname === '/export') return 'export'
    return 'setup'
  }

  const activeValue = getActiveValue()

  return (
    <div className="bg-gray-100 border border-gray-200 rounded-md p-1.5">
      <div className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent border-0 p-0 h-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeValue === item.value
          
          return (
            <Link
              key={item.value}
              href={item.href}
              className={`flex items-center justify-center gap-1 text-xs transition-all rounded-sm px-1.5 py-1.5 min-w-0 m-0.5 ${
                isActive 
                  ? 'bg-white text-black' 
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate hidden sm:inline">{item.label}</span>
              <span className="truncate sm:hidden">{item.shortLabel || item.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}