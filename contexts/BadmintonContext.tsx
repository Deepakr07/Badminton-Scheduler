"use client"

import { createContext, useContext, ReactNode } from 'react'
import { useBadmintonData } from '@/hooks/useBadmintonData'
import { Player, Round } from '@/types/badminton'

interface BadmintonContextType {
  players: Player[]
  numberOfRackets: number
  numberOfCourts: number
  rounds: Round[]
  currentRound: number
  setNumberOfRackets: (value: number) => void
  setNumberOfCourts: (value: number) => void
  getRecommendedCourts: () => number
  addPlayer: (name: string) => boolean
  removePlayer: (name: string) => void
  generateNextRound: () => Round | null
  resetSession: () => void
  getCurrentRoundData: () => Round | null
  exportToCSV: () => void
}

const BadmintonContext = createContext<BadmintonContextType | undefined>(undefined)

interface BadmintonProviderProps {
  children: ReactNode
}

export function BadmintonProvider({ children }: BadmintonProviderProps) {
  const badmintonData = useBadmintonData()

  return (
    <BadmintonContext.Provider value={badmintonData}>
      {children}
    </BadmintonContext.Provider>
  )
}

export function useBadmintonContext() {
  const context = useContext(BadmintonContext)
  if (context === undefined) {
    throw new Error('useBadmintonContext must be used within a BadmintonProvider')
  }
  return context
}