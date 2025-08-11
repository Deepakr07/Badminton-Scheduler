interface Player {
  name: string
  gamesPlayed: number
  lastPlayedRound: number
  partnerships: Record<string, number>
}

interface Match {
  court: number
  teamA: string[]
  teamB: string[]
}

/**
 * Distributes players optimally across courts for badminton matches
 * @param totalPlayers - Total number of players to distribute
 * @param numberOfCourts - Number of available courts
 * @returns Array where each index represents a court and the value is the number of players for that court
 */
export function distributePlayersOptimally(totalPlayers: number, numberOfCourts: number): number[] {
  if (totalPlayers < 2 || numberOfCourts < 1) {
    return []
  }

  const distribution: number[] = new Array(numberOfCourts).fill(0)

  // Prioritize 4-player matches (doubles), then 3-player, then 2-player
  let remainingPlayers = totalPlayers
  let courtIndex = 0

  // First pass: assign 4 players per court where possible
  while (remainingPlayers >= 4 && courtIndex < numberOfCourts) {
    distribution[courtIndex] = 4
    remainingPlayers -= 4
    courtIndex++
  }

  // Second pass: handle remaining players
  courtIndex = 0
  while (remainingPlayers > 0 && courtIndex < numberOfCourts) {
    if (remainingPlayers >= 3 && distribution[courtIndex] === 0) {
      distribution[courtIndex] = 3
      remainingPlayers -= 3
    } else if (remainingPlayers >= 2 && distribution[courtIndex] === 0) {
      distribution[courtIndex] = 2
      remainingPlayers -= 2
    } else if (remainingPlayers === 1 && distribution[courtIndex] > 0) {
      // Add the last player to an existing court (making it 5 players)
      distribution[courtIndex] += 1
      remainingPlayers -= 1
    }
    courtIndex++
  }

  // Filter out courts with 0 players
  return distribution.filter(count => count > 0)
}

/**
 * Calculates partnership score between two players (lower is better)
 */
function getPartnershipScore(player1: Player, player2: Player): number {
  return (player1.partnerships[player2.name] || 0) + (player2.partnerships[player1.name] || 0)
}

/**
 * Generates optimal team pairings that minimize repeated partnerships and opponents
 */
export function generateOptimalPairings(players: Player[], playerDistribution: number[], previousRounds: any[] = []): Match[] {
  // First, create all possible court assignments
  const courtAssignments = generateCourtAssignments(players, playerDistribution, previousRounds)

  // Find the best assignment that minimizes both partnerships and opponent repetition
  const bestAssignment = findBestCourtAssignment(courtAssignments, players, previousRounds)

  return bestAssignment
}

/**
 * Generates different ways to assign players to courts with proper court rotation
 */
function generateCourtAssignments(players: Player[], playerDistribution: number[], previousRounds: any[]): Player[][][] {
  const assignments: Player[][][] = []
  const totalPlayers = playerDistribution.reduce((sum, count) => sum + count, 0)

  if (totalPlayers !== players.length) {
    // Simple assignment if player count doesn't match
    return [assignPlayersSequentially(players, playerDistribution)]
  }

  // Get court history for intelligent assignment
  const courtHistory = getCourtHistory(players, previousRounds)

  // Generate court-rotation focused assignments
  for (let attempt = 0; attempt < 15; attempt++) {
    const assignment = generateCourtRotationAssignment(players, playerDistribution, courtHistory, attempt)
    assignments.push(assignment)
  }

  // Add some random assignments for variety
  for (let attempt = 0; attempt < 5; attempt++) {
    const shuffledPlayers = [...players]
    shuffleWithCourtHistory(shuffledPlayers, previousRounds)
    const assignment = assignPlayersSequentially(shuffledPlayers, playerDistribution)
    assignments.push(assignment)
  }

  return assignments
}

/**
 * Generates a court assignment focused on rotating players across different courts
 */
function generateCourtRotationAssignment(
  players: Player[],
  playerDistribution: number[],
  courtHistory: Record<string, Record<number, number>>,
  attemptNumber: number
): Player[][] {
  const numberOfCourts = playerDistribution.length
  const assignment: Player[][] = Array.from({ length: numberOfCourts }, () => [])
  const availablePlayers = [...players]

  // Create court preference ranking for each player
  const playerCourtPreferences = players.map(player => {
    const playerHistory = courtHistory[player.name] || {}
    const courtUsage = Array.from({ length: numberOfCourts }, (_, i) => ({
      court: i + 1,
      usage: playerHistory[i + 1] || 0
    })).sort((a, b) => a.usage - b.usage) // Least used courts first

    return {
      player,
      preferredCourts: courtUsage.map(c => c.court),
      leastUsedCourt: courtUsage[0].court,
      mostUsedCourt: courtUsage[courtUsage.length - 1].court
    }
  })

  // Sort players by court imbalance (players with most imbalanced court usage get priority)
  const sortedByImbalance = playerCourtPreferences.sort((a, b) => {
    const aHistory = courtHistory[a.player.name] || {}
    const bHistory = courtHistory[b.player.name] || {}

    const aImbalance = calculateCourtImbalance(aHistory, numberOfCourts)
    const bImbalance = calculateCourtImbalance(bHistory, numberOfCourts)

    return bImbalance - aImbalance // Higher imbalance first
  })

  // Assign players to courts based on their court rotation needs
  for (let courtIndex = 0; courtIndex < numberOfCourts; courtIndex++) {
    const playersNeeded = playerDistribution[courtIndex]
    const courtNumber = courtIndex + 1

    // Find players who need this court most
    const candidatesForThisCourt = sortedByImbalance
      .filter(p => availablePlayers.includes(p.player))
      .sort((a, b) => {
        const aHistory = courtHistory[a.player.name] || {}
        const bHistory = courtHistory[b.player.name] || {}

        const aUsageOnThisCourt = aHistory[courtNumber] || 0
        const bUsageOnThisCourt = bHistory[courtNumber] || 0

        // Prefer players who have used this court less
        if (aUsageOnThisCourt !== bUsageOnThisCourt) {
          return aUsageOnThisCourt - bUsageOnThisCourt
        }

        // Secondary sort by overall court imbalance
        const aImbalance = calculateCourtImbalance(aHistory, numberOfCourts)
        const bImbalance = calculateCourtImbalance(bHistory, numberOfCourts)
        return bImbalance - aImbalance
      })

    // Assign players to this court
    for (let i = 0; i < Math.min(playersNeeded, candidatesForThisCourt.length); i++) {
      const selectedPlayer = candidatesForThisCourt[i].player
      assignment[courtIndex].push(selectedPlayer)

      // Remove from available players
      const playerIndex = availablePlayers.indexOf(selectedPlayer)
      if (playerIndex > -1) {
        availablePlayers.splice(playerIndex, 1)
      }
    }
  }

  // Handle any remaining players (shouldn't happen with proper distribution)
  let courtIndex = 0
  while (availablePlayers.length > 0 && courtIndex < numberOfCourts) {
    if (assignment[courtIndex].length < 5) { // Max 5 players per court
      assignment[courtIndex].push(availablePlayers.shift()!)
    } else {
      courtIndex++
    }
  }

  // Add some randomization based on attempt number to create variety
  if (attemptNumber > 0) {
    // Randomly swap some players between courts for variety
    const swapCount = Math.min(2, Math.floor(attemptNumber / 3))
    for (let swap = 0; swap < swapCount; swap++) {
      performRandomCourtSwap(assignment, courtHistory, numberOfCourts)
    }
  }

  return assignment
}

/**
 * Calculates court usage imbalance for a player
 */
function calculateCourtImbalance(playerCourtHistory: Record<number, number>, numberOfCourts: number): number {
  const usageCounts = Array.from({ length: numberOfCourts }, (_, i) =>
    playerCourtHistory[i + 1] || 0
  )

  const max = Math.max(...usageCounts)
  const min = Math.min(...usageCounts)
  const avg = usageCounts.reduce((sum, count) => sum + count, 0) / numberOfCourts

  // Return imbalance score (higher = more imbalanced)
  return (max - min) + Math.abs(max - avg) + Math.abs(min - avg)
}

/**
 * Performs a random beneficial swap between courts
 */
function performRandomCourtSwap(
  assignment: Player[][],
  courtHistory: Record<string, Record<number, number>>,
  numberOfCourts: number
) {
  const court1 = Math.floor(Math.random() * numberOfCourts)
  const court2 = Math.floor(Math.random() * numberOfCourts)

  if (court1 === court2 || assignment[court1].length === 0 || assignment[court2].length === 0) {
    return
  }

  const player1Index = Math.floor(Math.random() * assignment[court1].length)
  const player2Index = Math.floor(Math.random() * assignment[court2].length)

  const player1 = assignment[court1][player1Index]
  const player2 = assignment[court2][player2Index]

  // Check if swap would be beneficial
  const player1History = courtHistory[player1.name] || {}
  const player2History = courtHistory[player2.name] || {}

  const currentScore =
    (player1History[court1 + 1] || 0) + (player2History[court2 + 1] || 0)
  const swappedScore =
    (player1History[court2 + 1] || 0) + (player2History[court1 + 1] || 0)

  // Perform swap if it reduces court stickiness
  if (swappedScore < currentScore) {
    assignment[court1][player1Index] = player2
    assignment[court2][player2Index] = player1
  }
}

/**
 * Shuffles players while considering their court history for better court rotation
 */
function shuffleWithCourtHistory(players: Player[], previousRounds: any[]) {
  // Get court history for each player
  const courtHistory = getCourtHistory(players, previousRounds)

  // Create court preference groups based on usage
  const courtPreferences = createCourtPreferenceGroups(players, courtHistory)

  // Shuffle players with strong court rotation bias
  const shuffledPlayers = [...players]

  // Apply multiple passes of intelligent shuffling
  for (let pass = 0; pass < 3; pass++) {
    for (let i = shuffledPlayers.length - 1; i > 0; i--) {
      let bestJ = i
      let bestScore = Infinity

      // Look for the best swap candidate within a reasonable range
      const searchRange = Math.min(i + 1, 6) // Search up to 6 positions

      for (let j = Math.max(0, i - searchRange); j < i; j++) {
        const score = calculateCourtRotationScore(
          shuffledPlayers[i],
          shuffledPlayers[j],
          i,
          j,
          courtHistory
        )

        if (score < bestScore) {
          bestScore = score
          bestJ = j
        }
      }

      // Perform the swap if beneficial
      if (bestJ !== i) {
        [shuffledPlayers[i], shuffledPlayers[bestJ]] = [shuffledPlayers[bestJ], shuffledPlayers[i]]
      }
    }
  }

  // Copy shuffled order back to original array
  for (let i = 0; i < players.length; i++) {
    players[i] = shuffledPlayers[i]
  }
}

/**
 * Creates court preference groups to identify which players need court rotation
 */
function createCourtPreferenceGroups(players: Player[], courtHistory: Record<string, Record<number, number>>) {
  return players.map(player => {
    const playerCourtHistory = courtHistory[player.name] || {}
    const courtUsage = Object.entries(playerCourtHistory)
      .map(([court, count]) => ({ court: parseInt(court), count }))
      .sort((a, b) => b.count - a.count) // Most used courts first

    return {
      player,
      mostUsedCourt: courtUsage[0]?.court || 1,
      courtBalance: courtUsage.length > 1 ? courtUsage[0].count - courtUsage[courtUsage.length - 1].count : 0
    }
  })
}

/**
 * Calculates a score for court rotation benefit of swapping two players
 */
function calculateCourtRotationScore(
  player1: Player,
  player2: Player,
  pos1: number,
  pos2: number,
  courtHistory: Record<string, Record<number, number>>
): number {
  // Estimate which courts these positions would likely be assigned to
  const estimatedCourt1 = Math.floor(pos1 / 4) + 1 // Rough estimate
  const estimatedCourt2 = Math.floor(pos2 / 4) + 1

  const player1History = courtHistory[player1.name] || {}
  const player2History = courtHistory[player2.name] || {}

  // Current assignment score (higher = worse)
  const currentScore =
    (player1History[estimatedCourt1] || 0) * (player1History[estimatedCourt1] || 0) +
    (player2History[estimatedCourt2] || 0) * (player2History[estimatedCourt2] || 0)

  // Swapped assignment score
  const swappedScore =
    (player1History[estimatedCourt2] || 0) * (player1History[estimatedCourt2] || 0) +
    (player2History[estimatedCourt1] || 0) * (player2History[estimatedCourt1] || 0)

  // Return improvement score (negative means beneficial swap)
  return swappedScore - currentScore
}

/**
 * Assigns players to courts sequentially
 */
function assignPlayersSequentially(players: Player[], playerDistribution: number[]): Player[][] {
  const assignment: Player[][] = []
  let playerIndex = 0

  for (const courtSize of playerDistribution) {
    assignment.push(players.slice(playerIndex, playerIndex + courtSize))
    playerIndex += courtSize
  }

  return assignment
}

/**
 * Finds the best court assignment considering partnerships, opponents, and court rotation
 */
function findBestCourtAssignment(assignments: Player[][][], allPlayers: Player[], previousRounds: any[]): Match[] {
  let bestScore = Infinity
  let bestMatches: Match[] = []

  for (const assignment of assignments) {
    const matches = createMatchesFromAssignment(assignment)
    const score = calculateAssignmentScore(matches, allPlayers, previousRounds)

    if (score < bestScore) {
      bestScore = score
      bestMatches = matches
    }
  }

  return bestMatches
}

/**
 * Creates matches from a court assignment
 */
function createMatchesFromAssignment(assignment: Player[][]): Match[] {
  const matches: Match[] = []

  assignment.forEach((courtPlayers, courtIndex) => {
    if (courtPlayers.length >= 2) {
      if (courtPlayers.length === 4) {
        const bestPairing = findBestDoublesTeams(courtPlayers)
        matches.push({
          court: courtIndex + 1,
          teamA: bestPairing.teamA,
          teamB: bestPairing.teamB
        })
      } else if (courtPlayers.length === 3) {
        const bestPair = findBestPair(courtPlayers)
        const remaining = courtPlayers.find(p => !bestPair.includes(p))!
        matches.push({
          court: courtIndex + 1,
          teamA: bestPair.map(p => p.name),
          teamB: [remaining.name]
        })
      } else if (courtPlayers.length === 2) {
        matches.push({
          court: courtIndex + 1,
          teamA: [courtPlayers[0].name],
          teamB: [courtPlayers[1].name]
        })
      } else if (courtPlayers.length === 5) {
        const bestTriple = findBestTriple(courtPlayers)
        const remaining = courtPlayers.filter(p => !bestTriple.includes(p))
        matches.push({
          court: courtIndex + 1,
          teamA: bestTriple.map(p => p.name),
          teamB: remaining.map(p => p.name)
        })
      }
    }
  })

  return matches
}

/**
 * Calculates a score for an assignment (lower is better)
 */
function calculateAssignmentScore(matches: Match[], allPlayers: Player[], previousRounds: any[]): number {
  let score = 0

  // Partnership repetition penalty
  matches.forEach(match => {
    // Penalty for repeated partnerships within teams
    if (match.teamA.length > 1) {
      for (let i = 0; i < match.teamA.length; i++) {
        for (let j = i + 1; j < match.teamA.length; j++) {
          const player1 = allPlayers.find(p => p.name === match.teamA[i])!
          const player2 = allPlayers.find(p => p.name === match.teamA[j])!
          score += getPartnershipScore(player1, player2) * 10 // Heavy penalty for partnerships
        }
      }
    }

    if (match.teamB.length > 1) {
      for (let i = 0; i < match.teamB.length; i++) {
        for (let j = i + 1; j < match.teamB.length; j++) {
          const player1 = allPlayers.find(p => p.name === match.teamB[i])!
          const player2 = allPlayers.find(p => p.name === match.teamB[j])!
          score += getPartnershipScore(player1, player2) * 10
        }
      }
    }
  })

  // Opponent repetition penalty
  const opponentHistory = getOpponentHistory(allPlayers, previousRounds)
  matches.forEach(match => {
    match.teamA.forEach(playerA => {
      match.teamB.forEach(playerB => {
        const opponentCount = (opponentHistory[playerA] && opponentHistory[playerA][playerB]) || 0
        score += opponentCount * 5 // Medium penalty for repeated opponents
      })
    })
  })

  // Court stickiness penalty
  const courtHistory = getCourtHistory(allPlayers, previousRounds)
  matches.forEach(match => {
    const courtNum = match.court
    const allPlayersInMatch = [...match.teamA, ...match.teamB]

    allPlayersInMatch.forEach(playerName => {
      const playerCourtHistory = courtHistory[playerName] || {}
      const timesOnThisCourt = playerCourtHistory[courtNum] || 0
      score += timesOnThisCourt * 3 // Penalty for court stickiness
    })
  })

  return score
}

/**
 * Finds the best pair of players with lowest partnership score
 */
function findBestPair(players: Player[]): Player[] {
  let bestScore = Infinity
  let bestPair: Player[] = []

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      const score = getPartnershipScore(players[i], players[j])
      if (score < bestScore) {
        bestScore = score
        bestPair = [players[i], players[j]]
      }
    }
  }

  return bestPair
}

/**
 * Finds the best triple of players with lowest total partnership score
 */
function findBestTriple(players: Player[]): Player[] {
  let bestScore = Infinity
  let bestTriple: Player[] = []

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      for (let k = j + 1; k < players.length; k++) {
        const score = getPartnershipScore(players[i], players[j]) +
          getPartnershipScore(players[i], players[k]) +
          getPartnershipScore(players[j], players[k])
        if (score < bestScore) {
          bestScore = score
          bestTriple = [players[i], players[j], players[k]]
        }
      }
    }
  }

  return bestTriple
}

/**
 * Finds optimal team pairing for 4 players in doubles format
 */
function findBestDoublesTeams(players: Player[]): { teamA: string[], teamB: string[] } {
  const [p1, p2, p3, p4] = players

  // Three possible pairings for doubles:
  // Option 1: (p1,p2) vs (p3,p4)
  // Option 2: (p1,p3) vs (p2,p4)  
  // Option 3: (p1,p4) vs (p2,p3)

  const option1Score = getPartnershipScore(p1, p2) + getPartnershipScore(p3, p4)
  const option2Score = getPartnershipScore(p1, p3) + getPartnershipScore(p2, p4)
  const option3Score = getPartnershipScore(p1, p4) + getPartnershipScore(p2, p3)

  if (option1Score <= option2Score && option1Score <= option3Score) {
    return { teamA: [p1.name, p2.name], teamB: [p3.name, p4.name] }
  } else if (option2Score <= option3Score) {
    return { teamA: [p1.name, p3.name], teamB: [p2.name, p4.name] }
  } else {
    return { teamA: [p1.name, p4.name], teamB: [p2.name, p3.name] }
  }
}

/**
 * Gets court history for all players from previous rounds
 */
function getCourtHistory(players: Player[], previousRounds: any[]): Record<string, Record<number, number>> {
  const courtHistory: Record<string, Record<number, number>> = {}

  // Initialize court history for all players
  players.forEach(player => {
    courtHistory[player.name] = {}
  })

  // Count court usage from previous rounds
  previousRounds.forEach(round => {
    if (round.matches) {
      round.matches.forEach((match: Match) => {
        const courtNum = match.court
        const allPlayersInMatch = [...match.teamA, ...match.teamB]

        allPlayersInMatch.forEach(playerName => {
          if (!courtHistory[playerName]) {
            courtHistory[playerName] = {}
          }
          courtHistory[playerName][courtNum] = (courtHistory[playerName][courtNum] || 0) + 1
        })
      })
    }
  })

  return courtHistory
}

/**
 * Gets opponent history for all players from previous rounds
 */
function getOpponentHistory(players: Player[], previousRounds: any[]): Record<string, Record<string, number>> {
  const opponentHistory: Record<string, Record<string, number>> = {}

  // Initialize opponent history for all players
  players.forEach(player => {
    opponentHistory[player.name] = {}
  })

  // Count opponent matchups from previous rounds
  previousRounds.forEach(round => {
    if (round.matches) {
      round.matches.forEach((match: Match) => {
        // Each player in teamA has played against each player in teamB
        match.teamA.forEach(playerA => {
          match.teamB.forEach(playerB => {
            if (!opponentHistory[playerA]) {
              opponentHistory[playerA] = {}
            }
            if (!opponentHistory[playerB]) {
              opponentHistory[playerB] = {}
            }

            opponentHistory[playerA][playerB] = (opponentHistory[playerA][playerB] || 0) + 1
            opponentHistory[playerB][playerA] = (opponentHistory[playerB][playerA] || 0) + 1
          })
        })
      })
    }
  })

  return opponentHistory
}

/**
 * Checks if one court count distribution has less overlap than another
 */
function hasLessCourtOverlap(
  playerCounts: Record<number, number>,
  altCounts: Record<number, number>,
  candidateCounts: Record<number, number>
): boolean {
  // Calculate overlap scores (higher means more court stickiness)
  const getOverlapScore = (counts: Record<number, number>) => {
    return Object.values(counts).reduce((sum, count) => sum + count * count, 0)
  }

  const altScore = getOverlapScore(altCounts)
  const candidateScore = getOverlapScore(candidateCounts)

  return altScore < candidateScore
}

/**
 * Simple factorial function (capped for performance)
 */
function factorial(n: number): number {
  if (n <= 1) return 1
  if (n > 10) return 3628800 // Cap at 10! for performance

  let result = 1
  for (let i = 2; i <= n; i++) {
    result *= i
  }
  return result
}

/**
 * Updates partnership records for all players in a match
 */
export function updatePartnerships(players: Player[], matches: Match[]): Player[] {
  const updatedPlayers = [...players]

  matches.forEach(match => {
    // Update partnerships within teamA
    if (match.teamA.length > 1) {
      for (let i = 0; i < match.teamA.length; i++) {
        for (let j = i + 1; j < match.teamA.length; j++) {
          const player1 = updatedPlayers.find(p => p.name === match.teamA[i])!
          const player2 = updatedPlayers.find(p => p.name === match.teamA[j])!

          player1.partnerships[player2.name] = (player1.partnerships[player2.name] || 0) + 1
          player2.partnerships[player1.name] = (player2.partnerships[player1.name] || 0) + 1
        }
      }
    }

    // Update partnerships within teamB
    if (match.teamB.length > 1) {
      for (let i = 0; i < match.teamB.length; i++) {
        for (let j = i + 1; j < match.teamB.length; j++) {
          const player1 = updatedPlayers.find(p => p.name === match.teamB[i])!
          const player2 = updatedPlayers.find(p => p.name === match.teamB[j])!

          player1.partnerships[player2.name] = (player1.partnerships[player2.name] || 0) + 1
          player2.partnerships[player1.name] = (player2.partnerships[player1.name] || 0) + 1
        }
      }
    }
  })

  return updatedPlayers
}