"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus, RotateCcw } from 'lucide-react'

interface GameConfigurationProps {
  numberOfRackets: number
  numberOfCourts: number
  recommendedCourts: number
  canGenerateRound: boolean
  isFirstRound: boolean
  onRacketsChange: (value: number) => void
  onCourtsChange: (value: number) => void
  onGenerateRound: () => void
  onResetSession: () => void
}

export function GameConfiguration({
  numberOfRackets,
  numberOfCourts,
  recommendedCourts,
  canGenerateRound,
  isFirstRound,
  onRacketsChange,
  onCourtsChange,
  onGenerateRound,
  onResetSession
}: GameConfigurationProps) {
  const router = useRouter()

  const handleGenerateRound = () => {
    const result = onGenerateRound()
    if (result) {
      // Navigate to current page after successful round generation
      router.push('/current')
    }
  }
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="text-black">Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="rackets" className="text-black">Number of Rackets</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRacketsChange(Math.max(2, numberOfRackets - 1))}
              disabled={numberOfRackets <= 2}
              className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              id="rackets"
              type="number"
              min="2"
              value={numberOfRackets}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value >= 2) {
                  onRacketsChange(value)
                } else if (e.target.value === '') {
                  onRacketsChange(2)
                }
              }}
              className="border-gray-300 focus:border-black focus:ring-black text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRacketsChange(numberOfRackets + 1)}
              className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="courts" className="text-black">Number of Courts</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCourtsChange(Math.max(1, numberOfCourts - 1))}
              disabled={numberOfCourts <= 1}
              className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
            <Input
              id="courts"
              type="number"
              min="1"
              value={numberOfCourts}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                if (!isNaN(value) && value >= 1) {
                  onCourtsChange(value)
                } else if (e.target.value === '') {
                  onCourtsChange(1)
                }
              }}
              className="border-gray-300 focus:border-black focus:ring-black text-center"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onCourtsChange(numberOfCourts + 1)}
              className="h-10 w-10 p-0 border-gray-300 hover:bg-gray-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600">
            Recommended: {recommendedCourts} courts
          </p>
        </div>

        <Separator className="bg-gray-200" />

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={handleGenerateRound}
            disabled={!canGenerateRound}
            className="flex-1 bg-black hover:bg-gray-800 text-white text-sm sm:text-base"
          >
            {isFirstRound ? 'Generate First Round' : 'Generate Next Round'}
          </Button>
          <Button
            variant="outline"
            onClick={onResetSession}
            className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
        </div>

        {!canGenerateRound && (
          <Alert className="border-gray-300 bg-gray-50">
            <AlertDescription className="text-gray-700">
              You need at least 3 players to generate a round.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}