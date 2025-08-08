"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Round } from "@/types/badminton"
import { CurrentMatchCard } from "./CurrentMatchCard"
import { CurrentRestingPlayers } from "./CurrentRestingPlayers"

interface CurrentRoundDisplayProps {
  round: Round
}

export function CurrentRoundDisplay({ round }: CurrentRoundDisplayProps) {
  return (
    <div className="space-y-6">
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-black">
            Round {round.round}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {round.matches.map((match) => (
              <CurrentMatchCard key={match.court} match={match} />
            ))}
          </div>
          <CurrentRestingPlayers restingPlayers={round.resting} />
        </CardContent>
      </Card>
    </div>
  )
}