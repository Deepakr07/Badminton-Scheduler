"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Match } from "@/types/badminton"

interface CurrentMatchCardProps {
  match: Match
}

export function CurrentMatchCard({ match }: CurrentMatchCardProps) {
  return (
    <Card className="bg-gray-50 border-gray-200">
      <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
        <CardTitle className="text-center text-base sm:text-lg text-black">
          Court {match.court}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
        <div className="text-center">
          <div className="font-semibold text-black mb-1 text-sm sm:text-base">Team A</div>
          <div className="flex flex-wrap justify-center gap-1">
            {match.teamA.map(player => (
              <Badge
                key={player}
                variant="secondary"
                className="bg-white text-black border border-gray-300 text-xs sm:text-sm px-3 py-1 font-medium min-h-[24px] flex items-center justify-center"
              >
                {player}
              </Badge>
            ))}
          </div>
        </div>
        <div className="text-center text-xs sm:text-sm font-medium text-gray-500 my-2">VS</div>
        <div className="text-center">
          <div className="font-semibold text-black mb-1 text-sm sm:text-base">Team B</div>
          <div className="flex flex-wrap justify-center gap-1">
            {match.teamB.map(player => (
              <Badge
                key={player}
                variant="secondary"
                className="bg-white text-black border border-gray-300 text-xs sm:text-sm px-3 py-1 font-medium min-h-[24px] flex items-center justify-center"
              >
                {player}
              </Badge>
            ))}
          </div>
          {match.teamB.length === 1 && (
            <div className="text-xs text-gray-500 mt-1">(Single Player)</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}