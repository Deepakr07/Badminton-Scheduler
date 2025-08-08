"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Clock, Trophy, Download } from 'lucide-react'

interface NavigationProps {
  activeTab: string
  onTabChange: (value: string) => void
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="bg-gray-100 border border-gray-200 rounded-md p-1.5">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-transparent border-0 p-0 h-auto">
        <TabsTrigger
          value="setup"
          className="flex items-center justify-center gap-1 text-xs text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black transition-all rounded-sm px-1.5 py-1.5 min-w-0 m-0.5"
        >
          <Settings className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Setup</span>
        </TabsTrigger>
        <TabsTrigger
          value="current"
          className="flex items-center justify-center gap-1 text-xs text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black transition-all rounded-sm px-1.5 py-1.5 min-w-0 m-0.5"
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate hidden sm:inline">Current Round</span>
          <span className="truncate sm:hidden">Current</span>
        </TabsTrigger>
        <TabsTrigger
          value="history"
          className="flex items-center justify-center gap-1 text-xs text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black transition-all rounded-sm px-1.5 py-1.5 min-w-0 m-0.5"
        >
          <Trophy className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">History</span>
        </TabsTrigger>
        <TabsTrigger
          value="export"
          className="flex items-center justify-center gap-1 text-xs text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black transition-all rounded-sm px-1.5 py-1.5 min-w-0 m-0.5"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">Export</span>
        </TabsTrigger>
      </TabsList>
    </div>
  )
}