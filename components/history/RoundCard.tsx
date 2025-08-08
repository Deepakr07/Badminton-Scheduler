"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trophy } from 'lucide-react'
import { Round } from "@/types/badminton"
import { MatchCard } from "./MatchCard"
import { RestingPlayersCard } from "./RestingPlayersCard"

interface RoundCardProps {
    round: Round
}

export function RoundCard({ round }: RoundCardProps) {
    return (
        <Card className="border-gray-200">
            <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Round {round.round}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {round.matches.map((match) => (
                        <MatchCard key={match.court} match={match} />
                    ))}
                </div>
                <RestingPlayersCard restingPlayers={round.resting} />
            </CardContent>
        </Card>
    )
}