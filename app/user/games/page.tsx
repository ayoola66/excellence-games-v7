"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { LoadingState } from "@/components/ui/loading-state";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// Types for our games data
type GameStatus = "premium" | "free" | "installed";

interface Game {
  id: string;
  title: string;
  coverImage: string;
  status: GameStatus;
}

type FilterType = "all" | "installed" | "premium";

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await fetch("/api/games");
        if (!response.ok) {
          throw new Error("Failed to fetch games");
        }
        const data = await response.json();
        setGames(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchGames();
  }, []);

  const filteredGames = games.filter((game) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "installed") return game.status === "installed";
    if (activeFilter === "premium") return game.status === "premium";
    return false;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingState message="Loading games..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title={`Error: ${error}`}
          description="Please try refreshing the page"
          className="text-red-500"
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8">
        <Button
          variant={activeFilter === "all" ? "default" : "outline"}
          onClick={() => setActiveFilter("all")}
        >
          All Games
        </Button>
        <Button
          variant={activeFilter === "installed" ? "default" : "outline"}
          onClick={() => setActiveFilter("installed")}
        >
          Installed
        </Button>
        <Button
          variant={activeFilter === "premium" ? "default" : "outline"}
          onClick={() => setActiveFilter("premium")}
        >
          Premium
        </Button>
      </div>

      {/* Games Grid */}
      {filteredGames.length === 0 ? (
        <EmptyState
          title="No games available yet"
          description="Check back later for new additions to our game library"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="group relative overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="aspect-[4/3] relative">
                <Image
                  src={game.coverImage}
                  alt={game.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {game.title}
                </h3>
                <Badge
                  variant={
                    game.status === "premium"
                      ? "default"
                      : game.status === "installed"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {game.status.charAt(0).toUpperCase() + game.status.slice(1)}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
