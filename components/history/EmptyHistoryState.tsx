"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Clock } from 'lucide-react'

export function EmptyHistoryState() {
  return (
    <Card className="border-gray-200">
      <CardContent className="text-center py-12">
        <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Game History</h3>
        <p className="text-gray-500">Start playing to see your game history here!</p>
      </CardContent>
    </Card>
  )
}