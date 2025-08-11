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
 * Generates optimal team pairings that minimize repeated partnerships
 */
export function generateOptimalPairings(players: Player[], playerDistribution: number[]): Match[] {
  const matches: Match[] = []
  const availablePlayers = [...players]
  
  for (let court = 0; court < playerDistribution.length; court++) {
    const playersForThisCourt = playerDistribution[court]
    
    if (playersForThisCourt >= 2) {
      const courtPlayers = availablePlayers.splice(0, playersForThisCourt)
      
      if (playersForThisCourt === 4) {
        // Find optimal pairing for 4 players (2v2)
        const bestPairing = findBestDoublesTeams(courtPlayers)
        matches.push({
          court: court + 1,
          teamA: bestPairing.teamA,
          teamB: bestPairing.teamB
        })
      } else if (playersForThisCourt === 3) {
        // For 3 players, pair the two with lowest partnership score
        const bestPair = findBestPair(courtPlayers)
        const remaining = courtPlayers.find(p => !bestPair.includes(p))!
        matches.push({
          court: court + 1,
          teamA: bestPair.map(p => p.name),
          teamB: [remaining.name]
        })
      } else if (playersForThisCourt === 2) {
        // Singles match
        matches.push({
          court: court + 1,
          teamA: [courtPlayers[0].name],
          teamB: [courtPlayers[1].name]
        })
      } else if (playersForThisCourt === 5) {
        // 5 players: make one team of 3, one team of 2
        const bestTriple = findBestTriple(courtPlayers)
        const remaining = courtPlayers.filter(p => !bestTriple.includes(p))
        matches.push({
          court: court + 1,
          teamA: bestTriple.map(p => p.name),
          teamB: remaining.map(p => p.name)
        })
      }
    }
  }
  
  return matches
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