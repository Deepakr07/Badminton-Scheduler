"use client"

import { Round } from "@/types/badminton"
import { RoundCard } from "./RoundCard"
import { EmptyHistoryState } from "./EmptyHistoryState"

interface HistoryListProps {
  rounds: Round[]
}

export function HistoryList({ rounds }: HistoryListProps) {
  if (rounds.length === 0) {
    return <EmptyHistoryState />
  }

  return (
    <div className="space-y-4">
      {rounds.map((round) => (
        <RoundCard key={round.round} round={round} />
      ))}
    </div>
  )
}