"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CurrentRestingPlayersProps {
  restingPlayers: string[]
}

export function CurrentRestingPlayers({ restingPlayers }: CurrentRestingPlayersProps) {
  if (restingPlayers.length === 0) return null

  return (
    <Card className="mt-6 bg-gray-50 border-gray-200">
      <CardHeader>
        <CardTitle className="text-center text-black">
          Resting Players
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 justify-center">
          {restingPlayers.map(player => (
            <Badge key={player} variant="outline" className="border-gray-400 text-gray-700">
              {player}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}