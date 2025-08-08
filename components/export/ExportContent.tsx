"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download } from 'lucide-react'
import { Round } from "@/types/badminton"

interface ExportContentProps {
  rounds: Round[]
  onExportCSV: () => void
}

export function ExportContent({ rounds, onExportCSV }: ExportContentProps) {
  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Download className="w-5 h-5" />
          Export Game Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          Export your game history to a CSV file for record keeping or analysis.
        </p>
        
        {rounds.length > 0 ? (
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>Your export will include:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>{rounds.length} rounds of game data</li>
                <li>Team compositions for each match</li>
                <li>Court assignments</li>
                <li>Resting players for each round</li>
              </ul>
            </div>
            
            <Button 
              onClick={onExportCSV}
              className="bg-black hover:bg-gray-800 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download CSV
            </Button>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No game data to export yet.</p>
            <p className="text-sm text-gray-400 mt-1">Play some rounds first!</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}