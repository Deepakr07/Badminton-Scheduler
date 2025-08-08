"use client"

import { PageHeader } from "@/components/PageHeader"
import { PageLayout } from "@/components/PageLayout"
import { Navigation } from "@/components/Navigation"
import { ExportContent } from "@/components/export"
import { useBadmintonContext } from "@/contexts/BadmintonContext"

export default function ExportPage() {
  const { rounds, exportToCSV } = useBadmintonContext()

  return (
    <PageLayout>
      <PageHeader />
      <Navigation />
      <div className="mt-6 sm:mt-8">
        <ExportContent rounds={rounds} onExportCSV={exportToCSV} />
      </div>
    </PageLayout>
  )
}