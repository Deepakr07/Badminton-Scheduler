"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from 'lucide-react'

interface PageHeaderProps {
  title?: string
  description?: string
  showDescription?: boolean
}

export function PageHeader({ 
  title = "Badminton Rotation Manager", 
  description = "Fair player rotation and game scheduling for your badminton group",
  showDescription = false 
}: PageHeaderProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="text-center px-3 sm:px-6 py-4 sm:py-6">
        <CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-black flex items-center justify-center gap-1 sm:gap-2">
          <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black" />
          <span className="hidden md:inline">{title}</span>
          <span className="hidden sm:inline md:hidden">Badminton Manager</span>
          <span className="sm:hidden">Badminton</span>
        </CardTitle>
        {showDescription && (
          <CardDescription className="text-gray-600 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
            <span className="hidden sm:inline">{description}</span>
            <span className="sm:hidden">Player rotation manager</span>
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}