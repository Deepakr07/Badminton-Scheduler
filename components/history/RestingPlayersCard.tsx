"use client"

interface RestingPlayersCardProps {
  restingPlayers: string[]
}

export function RestingPlayersCard({ restingPlayers }: RestingPlayersCardProps) {
  if (restingPlayers.length === 0) return null

  return (
    <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
      <div className="text-sm">
        <span className="font-medium text-black">Resting:</span> 
        <span className="text-gray-700 ml-1">{restingPlayers.join(', ')}</span>
      </div>
    </div>
  )
}