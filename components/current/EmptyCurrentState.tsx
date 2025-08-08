"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trophy } from 'lucide-react'

interface EmptyCurrentStateProps {
  onGenerateRound: () => void
  canGenerate: boolean
  isFirstRound: boolean
}

export function EmptyCurrentState({ onGenerateRound, canGenerate, isFirstRound }: EmptyCurrentStateProps) {
  return (
    <Card className="border-gray-200">
      <CardContent className="text-center py-12">
        <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Round</h3>
        <p className="text-gray-500 mb-4">Generate your first round to get started!</p>
        <Button 
          onClick={onGenerateRound} 
          disabled={!canGenerate} 
          className="bg-black hover:bg-gray-800 text-white"
        >
          {isFirstRound ? 'Generate First Round' : 'Generate Next Round'}
        </Button>
      </CardContent>
    </Card>
  )
}