"use client"

import { PageHeader } from "@/components/PageHeader"
import { PageLayout } from "@/components/PageLayout"
import { Navigation } from "@/components/Navigation"
import { SetupContent } from "@/components/setup"
import { useBadmintonContext } from "@/contexts/BadmintonContext"
import { useRouter } from "next/navigation"

export default function SetupPage() {
  const {
    players,
    numberOfRackets,
    numberOfCourts,
    rounds,
    getRecommendedCourts,
    addPlayer,
    removePlayer,
    setNumberOfRackets,
    setNumberOfCourts,
    generateNextRound,
    resetSession
  } = useBadmintonContext()

  const router = useRouter()

  const handleGenerateRound = () => {
    const newRound = generateNextRound()
    if (newRound) {
      router.push('/current')
    }
  }

  return (
    <PageLayout>
      <PageHeader />
      <Navigation />
      <div className="mt-6 sm:mt-8">
        <SetupContent
          players={players}
          numberOfRackets={numberOfRackets}
          numberOfCourts={numberOfCourts}
          recommendedCourts={getRecommendedCourts()}
          rounds={rounds}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onRacketsChange={setNumberOfRackets}
          onCourtsChange={setNumberOfCourts}
          onGenerateRound={handleGenerateRound}
          onResetSession={resetSession}
        />
      </div>
    </PageLayout>
  )
}