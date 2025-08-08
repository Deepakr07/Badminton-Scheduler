"use client"

import { useState, useEffect } from 'react'
import { Player, Match, Round, BadmintonData } from "@/types/badminton"

export function useBadmintonData() {
  const [players, setPlayers] = useState<Player[]>([])
  const [numberOfRackets, setNumberOfRackets] = useState(8)
  const [numberOfCourts, setNumberOfCourts] = useState(2)
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentRound, setCurrentRound] = useState(0)

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('badminton-pwa-data')
    if (savedData) {
      try {
        const data = JSON.parse(savedData)
        const loadedRounds = data.rounds || []
        const loadedCurrentRound = data.currentRound || 0

        // Validate data consistency
        if (loadedCurrentRound > loadedRounds.length) {
          console.warn('Data inconsistency detected, fixing currentRound')
          setCurrentRound(loadedRounds.length)
        } else {
          setCurrentRound(loadedCurrentRound)
        }

        setPlayers(data.players || [])
        setNumberOfRackets(data.numberOfRackets || 8)
        setNumberOfCourts(data.numberOfCourts || 2)
        setRounds(loadedRounds)
      } catch (error) {
        console.error('Error loading localStorage data:', error)
        localStorage.removeItem('badminton-pwa-data')
      }
    }
  }, [])

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data = {
      players,
      numberOfRackets,
      numberOfCourts,
      rounds,
      currentRound
    }
    localStorage.setItem('badminton-pwa-data', JSON.stringify(data))
  }, [players, numberOfRackets, numberOfCourts, rounds, currentRound])

  // Manual save function for immediate persistence
  const saveToLocalStorage = () => {
    const data = {
      players,
      numberOfRackets,
      numberOfCourts,
      rounds,
      currentRound
    }
    localStorage.setItem('badminton-pwa-data', JSON.stringify(data))
  }

  // Check for data inconsistencies and fix them
  useEffect(() => {
    fixDataInconsistency()
  }, [players, rounds])

  const fixDataInconsistency = () => {
    const hasPlayedGames = players.some(p => p.gamesPlayed > 0)
    const hasRounds = rounds.length > 0

    if (hasPlayedGames && !hasRounds) {
      console.warn('Fixing data inconsistency: resetting player stats')
      setPlayers(players.map(p => ({ ...p, gamesPlayed: 0, lastPlayedRound: 0 })))
      setCurrentRound(0)
    }
  }

  const getRecommendedCourts = () => {
    if (players.length < 3) return 0

    const maxByPlayers = Math.floor(players.length / 3)
    const maxByRackets = Math.floor(numberOfRackets / 3)

    let recommendedCourts = Math.min(3, maxByPlayers, maxByRackets)

    if (players.length >= 7 && numberOfRackets >= 7) {
      recommendedCourts = Math.max(2, recommendedCourts)
    }

    if (players.length >= 11 && numberOfRackets >= 11) {
      recommendedCourts = Math.max(3, recommendedCourts)
    }

    return recommendedCourts
  }

  const addPlayer = (name: string) => {
    if (name.trim() && !players.find(p => p.name === name.trim())) {
      setPlayers([...players, {
        name: name.trim(),
        gamesPlayed: 0,
        lastPlayedRound: 0
      }])
      return true
    }
    return false
  }

  const removePlayer = (playerName: string) => {
    setPlayers(players.filter(p => p.name !== playerName))
  }

  const generateNextRound = () => {
    if (players.length < 3) return null

    // Sort players by least games played, then least recently played
    const sortedPlayers = [...players].sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed
      }
      return a.lastPlayedRound - b.lastPlayedRound
    })

    // Shuffle players within the same priority group to avoid repeated pairings
    const shuffleWithinPriorityGroups = (players: Player[]) => {
      const groups = new Map<string, Player[]>()
      
      // Group players by their priority (gamesPlayed + lastPlayedRound)
      players.forEach(player => {
        const key = `${player.gamesPlayed}-${player.lastPlayedRound}`
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(player)
      })

      // Shuffle each group and combine
      const shuffledPlayers: Player[] = []
      for (const [key, group] of Array.from(groups.entries()).sort()) {
        // Fisher-Yates shuffle for each group
        const shuffledGroup = [...group]
        for (let i = shuffledGroup.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffledGroup[i], shuffledGroup[j]] = [shuffledGroup[j], shuffledGroup[i]]
        }
        shuffledPlayers.push(...shuffledGroup)
      }
      
      return shuffledPlayers
    }

    const shuffledSortedPlayers = shuffleWithinPriorityGroups(sortedPlayers)

    // Calculate how many players can actually play based on courts
    // Each court needs at least 2 players and at most 4 players
    const maxPlayersPerRound = numberOfCourts * 4
    const minPlayersPerRound = numberOfCourts * 2

    // Calculate actual players to assign considering racket limitations
    let playersToAssign = Math.min(players.length, numberOfRackets, maxPlayersPerRound)

    // Ensure we don't assign fewer players than minimum required for courts
    if (playersToAssign < minPlayersPerRound && players.length >= minPlayersPerRound) {
      playersToAssign = minPlayersPerRound
    }

    // Calculate optimal distribution for courts
    const distributePlayersOptimally = (totalPlayers: number, totalCourts: number) => {
      if (totalPlayers < 2) return []
      
      const distribution: number[] = []
      let remainingPlayers = totalPlayers
      let remainingCourts = totalCourts

      // First, try to fill courts with 4 players each (2v2 matches)
      while (remainingCourts > 0 && remainingPlayers >= 4) {
        distribution.push(4)
        remainingPlayers -= 4
        remainingCourts--
      }

      // Handle remaining players
      if (remainingPlayers > 0 && remainingCourts > 0) {
        if (remainingPlayers >= 2) {
          // If we have 2 or 3 players left and a court available
          if (remainingPlayers === 3) {
            // 1v2 match (not ideal but acceptable)
            distribution.push(3)
            remainingPlayers -= 3
          } else if (remainingPlayers === 2) {
            // 1v1 match
            distribution.push(2)
            remainingPlayers -= 2
          }
        }
      }

      // If we still have remaining players, they need to be distributed or rest
      // For now, any remaining players will rest
      return distribution
    }

    const playerDistribution = distributePlayersOptimally(playersToAssign, numberOfCourts)
    const actualPlayingPlayers = playerDistribution.reduce((sum, players) => sum + players, 0)
    
    console.log(`Round generation: ${players.length} total players, ${actualPlayingPlayers} playing, ${playerDistribution.length} courts used, ${players.length - actualPlayingPlayers} resting`)
    console.log(`Court distribution: ${playerDistribution.join(', ')} players per court`)

    // Divide players into playing and resting groups based on actual distribution
    const playingPlayers = shuffledSortedPlayers.slice(0, actualPlayingPlayers)
    const restingPlayers = shuffledSortedPlayers.slice(actualPlayingPlayers)

    const matches: Match[] = []
    let playerIndex = 0

    for (let court = 0; court < playerDistribution.length; court++) {
      const playersForThisCourt = playerDistribution[court]

      if (playersForThisCourt >= 2) {
        const courtPlayers = playingPlayers.slice(playerIndex, playerIndex + playersForThisCourt)
        playerIndex += playersForThisCourt

        // Shuffle players for random team assignment (Fisher-Yates)
        const shuffled = [...courtPlayers]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        if (playersForThisCourt === 4) {
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name, shuffled[3].name]
          })
        } else if (playersForThisCourt === 3) {
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name]
          })
        } else if (playersForThisCourt === 2) {
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name],
            teamB: [shuffled[1].name]
          })
        }
      }
    }

    // Create new round data with resting players
    const newRound: Round = {
      round: currentRound + 1,
      matches,
      resting: restingPlayers.map(p => p.name)
    }

    // Update player stats ONLY for those who are actually playing (in matches)
    const playersInMatches = new Set<string>()
    matches.forEach(match => {
      match.teamA.forEach(player => playersInMatches.add(player))
      match.teamB.forEach(player => playersInMatches.add(player))
    })

    const updatedPlayers = players.map(player => {
      if (playersInMatches.has(player.name)) {
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

    return newRound
  }

  const resetSession = () => {
    setPlayers(players.map(p => ({ ...p, gamesPlayed: 0, lastPlayedRound: 0 })))
    setRounds([])
    setCurrentRound(0)
    localStorage.removeItem('badminton-pwa-data')
  }

  const getCurrentRoundData = () => {
    if (currentRound === 0 || currentRound > rounds.length) {
      return null
    }
    return rounds[currentRound - 1]
  }

  const exportToCSV = () => {
    let csv = 'Round,Court,Team A Player 1,Team A Player 2,Team B Player 1,Team B Player 2,Resting Players\n'

    rounds.forEach(round => {
      round.matches.forEach((match, index) => {
        const restingList = index === 0 ? round.resting.join('; ') : ''
        csv += `${round.round},${match.court},${match.teamA[0]},${match.teamA[1] || ''},${match.teamB[0]},${match.teamB[1] || ''},${restingList}\n`
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

  return {
    players,
    numberOfRackets,
    numberOfCourts,
    rounds,
    currentRound,
    setNumberOfRackets,
    setNumberOfCourts,
    getRecommendedCourts,
    addPlayer,
    removePlayer,
    generateNextRound,
    resetSession,
    getCurrentRoundData,
    exportToCSV
  }
}