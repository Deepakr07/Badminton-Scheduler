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
 * Generates different ways to assign players to courts
 */
function generateCourtAssignments(players: Player[], playerDistribution: number[], previousRounds: any[]): Player[][][] {
  const assignments: Player[][][] = []
  const totalPlayers = playerDistribution.reduce((sum, count) => sum + count, 0)
  
  if (totalPlayers !== players.length) {
    // Simple assignment if player count doesn't match
    return [assignPlayersSequentially(players, playerDistribution)]
  }
  
  // Generate multiple random assignments for variety
  for (let attempt = 0; attempt < Math.min(20, factorial(Math.min(players.length, 8))); attempt++) {
    const shuffledPlayers = [...players]
    
    // Smart shuffle that considers court history
    shuffleWithCourtHistory(shuffledPlayers, previousRounds)
    
    const assignment = assignPlayersSequentially(shuffledPlayers, playerDistribution)
    assignments.push(assignment)
  }
  
  return assignments
}

/**
 * Shuffles players while considering their court history
 */
function shuffleWithCourtHistory(players: Player[], previousRounds: any[]) {
  // Get court history for each player
  const courtHistory = getCourtHistory(players, previousRounds)
  
  // Fisher-Yates shuffle with court bias
  for (let i = players.length - 1; i > 0; i--) {
    // Bias selection towards players who haven't been on the same courts recently
    let j = Math.floor(Math.random() * (i + 1))
    
    // Add some bias to avoid court stickiness
    if (Math.random() < 0.3) { // 30% chance to apply court bias
      const playerCourtCounts = courtHistory[players[i].name] || {}
      const candidateCourtCounts = courtHistory[players[j].name] || {}
      
      // Try to find a better swap candidate
      for (let k = 0; k <= i; k++) {
        const altCourtCounts = courtHistory[players[k].name] || {}
        if (hasLessCourtOverlap(playerCourtCounts, altCourtCounts, candidateCourtCounts)) {
          j = k
          break
        }
      }
    }
    
    [players[i], players[j]] = [players[j], players[i]]
  }
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