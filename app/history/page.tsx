"use client"

import { PageHeader } from "@/components/PageHeader"
import { PageLayout } from "@/components/PageLayout"
import { Navigation } from "@/components/Navigation"
import { HistoryList } from "@/components/history"
import { useBadmintonContext } from "@/contexts/BadmintonContext"

export default function HistoryPage() {
  const { rounds } = useBadmintonContext()

  return (
    <PageLayout>
      <PageHeader />
      <Navigation />
      <div className="mt-6 sm:mt-8">
        <HistoryList rounds={rounds} />
      </div>
    </PageLayout>
  )
}