"use client"

import { PageHeader } from "@/components/PageHeader"
import { PageLayout } from "@/components/PageLayout"
import { HistoryList } from "@/components/history"
import { useBadmintonData } from "@/hooks/useBadmintonData"

export default function HistoryPage() {
  const { rounds } = useBadmintonData()

  return (
    <PageLayout>
      <PageHeader />
      <div className="mt-6 sm:mt-8">
        <HistoryList rounds={rounds} />
      </div>
    </PageLayout>
  )
}