"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Minus } from 'lucide-react'
import { Player } from "@/types/badminton"

interface PlayerManagementProps {
    players: Player[]
    onAddPlayer: (name: string) => boolean
    onRemovePlayer: (name: string) => void
}

export function PlayerManagement({ players, onAddPlayer, onRemovePlayer }: PlayerManagementProps) {
    const [newPlayerName, setNewPlayerName] = useState('')

    const handleAddPlayer = () => {
        if (onAddPlayer(newPlayerName)) {
            setNewPlayerName('')
        }
    }

    return (
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
                        onKeyPress={(e) => e.key === 'Enter' && handleAddPlayer()}
                        className="border-gray-300 focus:border-black focus:ring-black"
                    />
                    <Button onClick={handleAddPlayer} size="icon" className="bg-black hover:bg-gray-800 text-white">
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {players.map((player) => (
                        <div key={player.name} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center gap-1 sm:gap-2 min-w-0 flex-1">
                                <span className="font-medium text-black text-sm sm:text-base truncate">{player.name}</span>
                                <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-800 border border-gray-300 shrink-0">
                                    {player.gamesPlayed} {player.gamesPlayed === 1 ? 'game' : 'games'}
                                </Badge>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => onRemovePlayer(player.name)}
                                className="h-8 w-8 text-gray-500 hover:text-black hover:bg-gray-100 shrink-0 ml-2"
                            >
                                <Minus className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}