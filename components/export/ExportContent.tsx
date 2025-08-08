"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Download } from 'lucide-react'
import { Round, Player } from "@/types/badminton"

interface ExportContentProps {
  rounds: Round[]
  players: Player[]
  numberOfCourts: number
  onExportCSV: () => void
}

export function ExportContent({ rounds, players, numberOfCourts, onExportCSV }: ExportContentProps) {
  const totalMatches = rounds.reduce((acc, round) => acc + round.matches.length, 0)

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-black">
          <Download className="w-5 h-5 text-black" />
          Export Game Sheet
        </CardTitle>
        <CardDescription className="text-gray-600">
          Download your complete game history and player statistics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-black">Session Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Players:</span>
                <span className="font-medium text-black">{players.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rounds Played:</span>
                <span className="font-medium text-black">{rounds.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Courts Used:</span>
                <span className="font-medium text-black">{numberOfCourts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Matches:</span>
                <span className="font-medium text-black">{totalMatches}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-black">Player Statistics</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {players
                .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
                .map((player) => (
                  <div key={player.name} className="flex justify-between text-sm">
                    <span className="text-gray-600">{player.name}</span>
                    <span className="font-medium text-black">{player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={onExportCSV}
            disabled={rounds.length === 0}
            className="flex items-center gap-2 bg-black hover:bg-gray-800 text-white text-sm sm:text-base w-full sm:w-auto"
          >
            <Download className="w-4 h-4" />
            Export as CSV
          </Button>
        </div>

        {rounds.length === 0 && (
          <Alert className="border-gray-300 bg-gray-50">
            <AlertDescription className="text-gray-700">
              No game data to export. Play some rounds first!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}