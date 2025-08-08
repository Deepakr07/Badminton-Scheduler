"use client"

import { PageHeader } from "@/components/PageHeader"
import { PageLayout } from "@/components/PageLayout"
import { Navigation } from "@/components/Navigation"
import { CurrentRoundContent } from "@/components/current"
import { useBadmintonContext } from "@/contexts/BadmintonContext"

export default function CurrentPage() {
  const { rounds, currentRound, generateNextRound, players } = useBadmintonContext()

  const getCurrentRoundData = () => {
    if (currentRound === 0 || currentRound > rounds.length) {
      return null
    }
    return rounds[currentRound - 1]
  }

  const handleGenerateRound = () => {
    generateNextRound()
    // No need to navigate since we're already on the current page
    // The component will automatically re-render with the new round data
  }

  return (
    <PageLayout>
      <PageHeader />
      <Navigation />
      <div className="mt-6 sm:mt-8">
        <CurrentRoundContent
          currentRound={getCurrentRoundData()}
          onGenerateRound={handleGenerateRound}
          canGenerate={players.length >= 3}
          isFirstRound={rounds.length === 0}
        />
      </div>
    </PageLayout>
  )
}