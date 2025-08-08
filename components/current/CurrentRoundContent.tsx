"use client"

import { Round } from "@/types/badminton"
import { CurrentRoundDisplay } from "./CurrentRoundDisplay"
import { EmptyCurrentState } from "./EmptyCurrentState"

interface CurrentRoundContentProps {
  currentRound: Round | null
  onGenerateRound: () => void
  canGenerate: boolean
  isFirstRound: boolean
}

export function CurrentRoundContent({ 
  currentRound, 
  onGenerateRound, 
  canGenerate, 
  isFirstRound 
}: CurrentRoundContentProps) {
  if (!currentRound) {
    return (
      <EmptyCurrentState 
        onGenerateRound={onGenerateRound}
        canGenerate={canGenerate}
        isFirstRound={isFirstRound}
      />
    )
  }

  return <CurrentRoundDisplay round={currentRound} />
}