"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

interface Game {
  id: string;
  name: string;
  description: string;
  type: "STRAIGHT" | "NESTED";
  imageUrl: string;
}

const demoGames: Game[] = [
  {
    id: "1",
    name: "Excellence UK Edition",
    description: "The classic board game that builds character and connection",
    type: "STRAIGHT",
    imageUrl: "/images/Excellence-Games-Logo-Black.png",
  },
  {
    id: "2",
    name: "Excellence Black Edition",
    description: "Premium version with exclusive content and materials",
    type: "NESTED",
    imageUrl: "/images/Excellence-Games-Logo-Gold.png",
  },
  {
    id: "3",
    name: "Targeted",
    description: "Fast-paced game of strategy and social dynamics",
    type: "STRAIGHT",
    imageUrl: "/images/Targeted-logo.png",
  },
];

export default function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isGameStarted, setIsGameStarted] = useState(false);

  const startGame = (game: Game) => {
    setSelectedGame(game);
    setIsGameStarted(true);
  };

  return (
    <div className="container mx-auto py-8">
      {!isGameStarted ? (
        <div className="space-y-8">
          <h1 className="text-3xl font-bold text-center text-foreground mb-8">
            Available Games
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoGames.map((game) => (
              <Card key={game.id}>
                <div className="relative h-48">
                  <Image
                    src={game.imageUrl}
                    alt={game.name}
                    fill
                    className="object-contain p-4"
                  />
                </div>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-2">
                    {game.name}
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    {game.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{game.type}</Badge>
                    <Button onClick={() => startGame(game)}>Play Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : selectedGame ? (
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              {selectedGame.name}
            </h1>
            <Button variant="outline" onClick={() => setIsGameStarted(false)}>
              Back to Games
            </Button>
          </div>
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                Game interface will be implemented here
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
