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

    const sortedPlayers = [...players].sort((a, b) => {
      if (a.gamesPlayed !== b.gamesPlayed) {
        return a.gamesPlayed - b.gamesPlayed
      }
      return a.lastPlayedRound - b.lastPlayedRound
    })

    // Calculate how many players can play based on courts and rackets
    const maxPlayersByRackets = numberOfRackets
    const maxPlayersByCourts = numberOfCourts * 4 // Maximum 4 players per court

    // Determine actual players to assign and courts to use
    let playersToAssign = Math.min(players.length, maxPlayersByRackets, maxPlayersByCourts)
    let courtsToUse = numberOfCourts

    // Adjust for court limitations - each court can handle 2-4 players optimally
    if (courtsToUse === 1) {
      // Single court scenarios
      if (playersToAssign > 4) {
        playersToAssign = 4 // Maximum 4 players on 1 court (2v2)
      }
    } else if (courtsToUse === 2) {
      // Two court scenarios
      if (playersToAssign === 5) {
        // 5 players, 2 courts: use both courts (3 + 2)
        courtsToUse = 2
      } else if (playersToAssign > 8) {
        playersToAssign = 8 // Maximum 8 players on 2 courts
      }
    }

    console.log(`Round generation: ${players.length} total players, ${playersToAssign} playing, ${courtsToUse} courts, ${players.length - playersToAssign} resting`)

    const playingPlayers = sortedPlayers.slice(0, playersToAssign)
    const restingPlayers = sortedPlayers.slice(playersToAssign)

    // Improved court distribution logic - prioritize optimal court filling
    const distributePlayersOptimally = (totalPlayers: number, totalCourts: number) => {
      const distribution: number[] = []
      let remainingPlayers = totalPlayers

      // Priority 1: Fill courts with 4 players first (optimal 2v2)
      for (let court = 0; court < totalCourts && remainingPlayers >= 4; court++) {
        distribution.push(4)
        remainingPlayers -= 4
      }

      // Priority 2: Handle remaining players
      if (remainingPlayers > 0 && distribution.length < totalCourts) {
        if (remainingPlayers >= 2) {
          // If we have at least 2 players left and available courts, create singles match (1v1)
          distribution.push(remainingPlayers)
        } else if (remainingPlayers === 1 && distribution.length > 0) {
          // If only 1 player left, add to the last court (making it 5 players - 3v2)
          distribution[distribution.length - 1] += 1
        }
      }

      return distribution
    }

    const playerDistribution = distributePlayersOptimally(playingPlayers.length, courtsToUse)
    console.log(`Court distribution: ${playerDistribution.join(', ')} players per court`)

    const matches: Match[] = []
    let playerIndex = 0

    for (let court = 0; court < playerDistribution.length; court++) {
      const playersForThisCourt = playerDistribution[court]

      if (playersForThisCourt >= 2) {
        const courtPlayers = playingPlayers.slice(playerIndex, playerIndex + playersForThisCourt)
        playerIndex += playersForThisCourt

        // Shuffle for random team assignment
        const shuffled = [...courtPlayers]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }

        if (playersForThisCourt === 4) {
          // Optimal 2v2 match
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name, shuffled[3].name]
          })
        } else if (playersForThisCourt === 3) {
          // 2v1 match
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name],
            teamB: [shuffled[2].name]
          })
        } else if (playersForThisCourt === 2) {
          // 1v1 singles match
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name],
            teamB: [shuffled[1].name]
          })
        } else if (playersForThisCourt === 5) {
          // Special case: 5 players on one court (3v2)
          matches.push({
            court: court + 1,
            teamA: [shuffled[0].name, shuffled[1].name, shuffled[2].name],
            teamB: [shuffled[3].name, shuffled[4].name]
          })
        }
      }
    }

    const newRound: Round = {
      round: currentRound + 1,
      matches,
      resting: restingPlayers.map(p => p.name)
    }

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