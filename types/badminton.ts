export interface Player {
  name: string
  gamesPlayed: number
  lastPlayedRound: number

  partnerships: Record<string, number> // tracks how many times played with each player
}

export interface Match {
  court: number
  teamA: string[]
  teamB: string[]
}

export interface Round {
  round: number
  matches: Match[]
  resting: string[]
}

export interface BadmintonData {
  players: Player[]
  numberOfRackets: number
  numberOfCourts: number
  rounds: Round[]
  currentRound: number
}