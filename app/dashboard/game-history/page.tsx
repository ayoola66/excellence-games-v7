"use client";

import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/lib/theme-context";

interface GameHistoryItem {
  id: string;
  gameType: string;
  result: "win" | "loss" | "draw";
  score: number;
  duration: string;
  date: string;
}

export default function GameHistoryPage() {
  const { data: session } = useSession();
  const { theme } = useTheme();

  // This would normally come from an API
  const recentGames: GameHistoryItem[] = [];

  // Create empty placeholder games to fill the 3x3 grid
  const emptyGames = Array(9 - recentGames.length).fill(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-foreground">Game History</h1>
        <div className="text-sm text-muted-foreground">
          Showing last 9 games
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentGames.map((game) => (
          <Card key={game.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-foreground">
                  {game.gameType}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    game.result === "win"
                      ? "bg-green-500/10 text-green-500"
                      : game.result === "loss"
                        ? "bg-red-500/10 text-red-500"
                        : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {game.result.charAt(0).toUpperCase() + game.result.slice(1)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span>Score:</span>
                  <span className="font-medium">{game.score}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{game.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>Played:</span>
                  <span>{new Date(game.date).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Empty state cards */}
        {recentGames.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">
                  No games played yet
                </h3>
                <p className="text-muted-foreground">
                  Start playing to see your game history here!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {recentGames.length > 0 &&
          emptyGames.map((_, index) => (
            <Card key={`empty-${index}`}>
              <CardContent className="p-6 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <svg
                    className="w-8 h-8 mx-auto mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="text-sm">Play more games</span>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );
}
