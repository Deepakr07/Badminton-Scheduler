"use client"

import { PlayerManagement } from "./PlayerManagement"
import { GameConfiguration } from "./GameConfiguration"
import { Player } from "@/types/badminton"

interface SetupContentProps {
  players: Player[]
  numberOfRackets: number
  numberOfCourts: number
  recommendedCourts: number
  rounds: any[]
  onAddPlayer: (name: string) => boolean
  onRemovePlayer: (name: string) => void
  onRacketsChange: (value: number) => void
  onCourtsChange: (value: number) => void
  onGenerateRound: () => void
  onResetSession: () => void
}

export function SetupContent({
  players,
  numberOfRackets,
  numberOfCourts,
  recommendedCourts,
  rounds,
  onAddPlayer,
  onRemovePlayer,
  onRacketsChange,
  onCourtsChange,
  onGenerateRound,
  onResetSession
}: SetupContentProps) {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <PlayerManagement
        players={players}
        onAddPlayer={onAddPlayer}
        onRemovePlayer={onRemovePlayer}
      />
      <GameConfiguration
        numberOfRackets={numberOfRackets}
        numberOfCourts={numberOfCourts}
        recommendedCourts={recommendedCourts}
        canGenerateRound={players.length >= 3}
        isFirstRound={rounds.length === 0}
        onRacketsChange={onRacketsChange}
        onCourtsChange={onCourtsChange}
        onGenerateRound={onGenerateRound}
        onResetSession={onResetSession}
      />
    </div>
  )
}