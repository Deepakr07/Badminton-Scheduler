"use client"

import { Match } from "@/types/badminton"

interface MatchCardProps {
  match: Match
}

export function MatchCard({ match }: MatchCardProps) {
  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="font-semibold text-center mb-2 text-black">
        Court {match.court}
      </div>
      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium text-black">Team A:</span> 
          <span className="text-gray-700 ml-1">{match.teamA.join(', ')}</span>
        </div>
        <div>
          <span className="font-medium text-black">Team B:</span> 
          <span className="text-gray-700 ml-1">{match.teamB.join(', ')}</span>
        </div>
      </div>
    </div>
  )
}