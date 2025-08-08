"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Download, Users, Trophy, Clock, Settings, Plus, Minus, RotateCcw } from 'lucide-react'
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Player {
  name: string
  gamesPlayed: number
  lastPlayedRound: number
}

interface Match {
  court: number
  teamA: string[]
  teamB: string[]
}

interface Round {
  round: number
  matches: Match[]
  resting: string[]
}

export default function BadmintonPWA() {
  const [players, setPlayers] = useState<Player[]>([])
  const [newPlayerName, setNewPlayerName] = useState('')
  const [numberOfRackets, setNumberOfRackets] = useState(8)
  const [numberOfCourts, setNumberOfCourts] = useState(2)
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [activeTab, setActiveTab] = useState('setup')

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('badminton-pwa-data')
    if (savedData) {
      const data = JSON.parse(savedData)
      setPlayers(data.players || [])
      setNumberOfRackets(data.numberOfRackets || 8)
      setNumberOfCourts(data.numberOfCourts || 2)
      setRounds(data.rounds || [])
      setCurrentRound(data.currentRound || 0)
      setActiveTab(data.activeTab || 'setup')
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data = {
      players,
      numberOfRackets,
      numberOfCourts,
      rounds,
      currentRound,
      activeTab
    }
    localStorage.setItem('badminton-pwa-data', JSON.stringify(data))
  }, [players, numberOfRackets, numberOfCourts, rounds, currentRound, activeTab])

  const getRecommendedCourts = () => {
    if (players.length < 3) return 0

    const maxByPlayers = Math.floor(players.length / 3) // Minimum 3 players per court (2v1)
    const maxByRackets = Math.floor(numberOfRackets / 3) // Minimum 3 rackets per court

    // Calculate optimal courts considering we can have 2v1 games
    let recommendedCourts = Math.min(3, maxByPlayers, maxByRackets)

    // Special cases for better utilization
    if (players.length >= 7 && numberOfRackets >= 7) {
      recommendedCourts = Math.max(2, recommendedCourts) // At least 2 courts for 7+ players
    }

    if (players.length >= 11 && numberOfRackets >= 11) {
      recommendedCourts = Math.max(3, recommendedCourts) // At least 3 courts for 11+ players
    }

    return recommendedCourts
  }

  const addPlayer = () => {
    if (newPlayerName.trim() && !players.find(p => p.name === newPlayerName.trim())) {
      setPlayers([...players, {
        name: newPlayerName.trim(),
        gamesPlayed: 0,
        lastPlayedRound: 0
      }])
      setNewPlayerName('')
    }
  }

  const removePlayer = (playerName: string) => {
    setPlayers(players.filter(p => p.name !== playerName))
  }

  const generateNextRound = () => {
    if (players.length < 3) return

    // Sort players by priority (games played, then last played round)
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed
      }
      return a.lastPlayedRound - b.lastPlayedRound
    })

    // Calculate how many players we can accommodate
    const totalRacketsAvailable = numberOfRackets
    const maxPlayersPerCourt = 4
    const minPlayersPerCourt = 3

    // Distribute players across courts optimally
    let playersToAssign = Math.min(players.length, totalRacketsAvailable)
    let courtsToUse = numberOfCourts

    // Adjust courts if we don't have enough players
    if (playersToAssign < courtsToUse * minPlayersPerCourt) {
      courtsToUse = Math.floor(playersToAssign / minPlayersPerCourt)
    }

    const playingPlayers = sortedPlayers.slice(0, playersToAssign)
    const restingPlayers = sortedPlayers.slice(playersToAssign)

    // Create matches with flexible player distribution
    const matches: Match[] = []
    let playerIndex = 0

    for (let court = 0; court < courtsToUse && playerIndex < playingPlayers.length; court++) {
      const remainingPlayers = playingPlayers.length - playerIndex
      const remainingCourts = courtsToUse - court

      // Determine how many players for this court
      let playersForThisCourt: number

      if (remainingCourts === 1) {
        // Last court gets all remaining players (3 or 4)
        playersForThisCourt = remainingPlayers
      } else {
        // Try to distribute evenly, preferring 4 players per court
        const avgPlayersPerRemainingCourt = remainingPlayers / remainingCourts
        playersForThisCourt = avgPlayersPerRemainingCourt >= 3.5 ? 4 : 3
      }

      // Ensure we don't exceed available players
      playersForThisCourt = Math.min(playersForThisCourt, remainingPlayers)

      if (playersForThisCourt >= 3) {
        const courtPlayers = playingPlayers.slice(playerIndex, playerIndex + playersForThisCourt)
        playerIndex += playersForThisCourt

        // Shuffle for random team assignment
        const shuffled = [...courtPlayers].sort(() => Math.random() - 0.5)

        if (playersForThisCourt === 4) {
          // Standard 2v2
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name, shuffled[3].name]
          })
        } else if (playersForThisCourt === 3) {
          // 2v1 format
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name] // Single player team
          })
        }
      }
    }

    const newRound: Round = {
      round: currentRound + 1,
      matches,
      resting: restingPlayers.map(p => p.name)
    }

    // Update player stats
    const updatedPlayers = players.map(player => {
      if (playingPlayers.find(p => p.name === player.name)) {
        return {
          ...player,
          gamesPlayed: player.gamesPlayed + 1,
          lastPlayedRound: currentRound + 1
        }
      }
      return player
    })

    setPlayers(updatedPlayers)
    setRounds([...rounds, newRound])
    setCurrentRound(currentRound + 1)
    setActiveTab('current') // Switch to current round tab
  }

  const resetSession = () => {
    setPlayers(players.map(p => ({ ...p, gamesPlayed: 0, lastPlayedRound: 0 })))
    setRounds([])
    setCurrentRound(0)
  }

  const exportToCSV = () => {
    let csv = 'Round,Court,Team A Player 1,Team A Player 2,Team B Player 1,Team B Player 2,Resting Players\n'

    rounds.forEach(round => {
      round.matches.forEach((match, index) => {
        const restingList = index === 0 ? round.resting.join('; ') : ''
        csv += `${round.round},${match.court},${match.teamA[0]},${match.teamA[1]},${match.teamB[0]},${match.teamB[1]},${restingList}\n`
      })
    })

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `badminton-games-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getCurrentRoundData = () => {
    return rounds[currentRound - 1]
  }

  const recommendedCourts = getRecommendedCourts()

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4 pt-4 sm:pt-8">
      <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card className="border-gray-200">
          <CardHeader className="text-center px-3 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-2xl md:text-3xl font-bold text-black flex items-center justify-center gap-1 sm:gap-2">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-black" />
              <span className="hidden md:inline">Badminton Rotation Manager</span>
              <span className="hidden sm:inline md:hidden">Badminton Manager</span>
              <span className="sm:hidden">Badminton</span>
            </CardTitle>
            <CardDescription className="text-gray-600 text-xs sm:text-sm md:text-base mt-1 sm:mt-2">
              <span className="hidden sm:inline">Fair player rotation and game scheduling for your badminton group</span>
              <span className="sm:hidden">Player rotation manager</span>
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100 border border-gray-200 p-1 rounded-lg">
            <TabsTrigger
              value="setup"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all rounded-md px-2 py-2 min-w-0"
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span className="truncate">Setup</span>
            </TabsTrigger>
            <TabsTrigger
              value="current"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all rounded-md px-2 py-2 min-w-0"
            >
              <Clock className="w-4 h-4 shrink-0" />
              <span className="truncate hidden sm:inline">Current Round</span>
              <span className="truncate sm:hidden">Current</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all rounded-md px-2 py-2 min-w-0"
            >
              <Trophy className="w-4 h-4 shrink-0" />
              <span className="truncate">History</span>
            </TabsTrigger>
            <TabsTrigger
              value="export"
              className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm transition-all rounded-md px-2 py-2 min-w-0"
            >
              <Download className="w-4 h-4 shrink-0" />
              <span className="truncate">Export</span>
            </TabsTrigger>
          </TabsList>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-6 mt-4 sm:mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Players Management */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-black">
                    <Users className="w-5 h-5 text-black" />
                    Players ({players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter player name"
                      value={newPlayerName}
                      onChange={(e) => setNewPlayerName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                    <Button onClick={addPlayer} size="icon" className="bg-black hover:bg-gray-800 text-white">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.map((player) => (
                      <div key={player.name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                          <span className="font-medium text-black text-sm sm:text-base truncate">{player.name}</span>
                          <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 border border-gray-300 shrink-0">
                            {player.gamesPlayed} games
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlayer(player.name)}
                          className="h-8 w-8 text-gray-500 hover:text-black hover:bg-gray-100 shrink-0 ml-2"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Configuration */}
              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="text-black">Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rackets" className="text-black">Number of Rackets</Label>
                    <Input
                      id="rackets"
                      type="number"
                      min="4"
                      value={numberOfRackets}
                      onChange={(e) => setNumberOfRackets(parseInt(e.target.value) || 4)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courts" className="text-black">Number of Courts</Label>
                    <Input
                      id="courts"
                      type="number"
                      min="1"
                      max="3"
                      value={numberOfCourts}
                      onChange={(e) => setNumberOfCourts(parseInt(e.target.value) || 1)}
                      className="border-gray-300 focus:border-black focus:ring-black"
                    />
                    <p className="text-sm text-gray-600">
                      Recommended: {recommendedCourts} courts
                    </p>
                  </div>

                  <Separator className="bg-gray-200" />

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      onClick={generateNextRound}
                      disabled={players.length < 3}
                      className="flex-1 bg-black hover:bg-gray-800 text-white text-sm sm:text-base"
                    >
                      Generate Next Round
                    </Button>
                    <Button
                      variant="outline"
                      onClick={resetSession}
                      className="flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50 text-sm sm:text-base"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </Button>
                  </div>

                  {players.length < 3 && (
                    <Alert className="border-gray-300 bg-gray-50">
                      <AlertDescription className="text-gray-700">
                        You need at least 3 players to generate a round.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Current Round Tab */}
          <TabsContent value="current" className="mt-4 sm:mt-6">
            {getCurrentRoundData() ? (
              <div className="space-y-6">
                <Card className="border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-center text-black">
                      Round {getCurrentRoundData().round}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                      {getCurrentRoundData().matches.map((match) => (
                        <Card key={match.court} className="bg-gray-50 border-gray-200">
                          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
                            <CardTitle className="text-center text-base sm:text-lg text-black">
                              Court {match.court}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2 sm:space-y-3 px-3 sm:px-6 pb-3 sm:pb-6">
                            <div className="text-center">
                              <div className="font-semibold text-black mb-1 text-sm sm:text-base">Team A</div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {match.teamA.map(player => (
                                  <Badge
                                    key={player}
                                    variant="secondary"
                                    className="bg-white text-black border border-gray-300 text-xs sm:text-sm px-3 py-1 font-medium min-h-[24px] flex items-center justify-center"
                                  >
                                    {player}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-center text-xs sm:text-sm font-medium text-gray-500 my-2">VS</div>
                            <div className="text-center">
                              <div className="font-semibold text-black mb-1 text-sm sm:text-base">Team B</div>
                              <div className="flex flex-wrap justify-center gap-1">
                                {match.teamB.map(player => (
                                  <Badge
                                    key={player}
                                    variant="secondary"
                                    className="bg-white text-black border border-gray-300 text-xs sm:text-sm px-3 py-1 font-medium min-h-[24px] flex items-center justify-center"
                                  >
                                    {player}
                                  </Badge>
                                ))}
                              </div>
                              {match.teamB.length === 1 && (
                                <div className="text-xs text-gray-500 mt-1">(Single Player)</div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {getCurrentRoundData().resting.length > 0 && (
                      <Card className="mt-6 bg-gray-50 border-gray-200">
                        <CardHeader>
                          <CardTitle className="text-center text-black">
                            Resting Players
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 justify-center">
                            {getCurrentRoundData().resting.map(player => (
                              <Badge key={player} variant="outline" className="border-gray-400 text-gray-700">
                                {player}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="text-center py-12">
                  <Trophy className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Active Round</h3>
                  <p className="text-gray-500 mb-4">Generate your first round to get started!</p>
                  <Button onClick={() => generateNextRound()} disabled={players.length < 3} className="bg-black hover:bg-gray-800 text-white">
                    Generate First Round
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-4 sm:mt-6">
            <div className="space-y-4">
              {rounds.length === 0 ? (
                <Card className="border-gray-200">
                  <CardContent className="text-center py-12">
                    <Clock className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Game History</h3>
                    <p className="text-gray-500">Start playing to see your game history here!</p>
                  </CardContent>
                </Card>
              ) : (
                rounds.map((round) => (
                  <Card key={round.round} className="border-gray-200">
                    <CardHeader>
                      <CardTitle className="text-black">Round {round.round}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {round.matches.map((match) => (
                          <div key={match.court} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="font-semibold text-center mb-2 text-black">Court {match.court}</div>
                            <div className="text-sm space-y-1">
                              <div>
                                <span className="font-medium text-black">Team A:</span> <span className="text-gray-700">{match.teamA.join(', ')}</span>
                              </div>
                              <div>
                                <span className="font-medium text-black">Team B:</span> <span className="text-gray-700">{match.teamB.join(', ')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {round.resting.length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <span className="font-medium text-black">Resting:</span> <span className="text-gray-700">{round.resting.join(', ')}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Export Tab */}
          <TabsContent value="export" className="mt-4 sm:mt-6">
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
                        <span className="font-medium text-black">{rounds.reduce((acc, round) => acc + round.matches.length, 0)}</span>
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
                            <span className="font-medium text-black">{player.gamesPlayed} games</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={exportToCSV}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
