"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import adminApi from "@/lib/admin-api-client";
import { Game } from "@/types/game";

const GameList = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await adminApi.getGames();
        console.log("Games API response:", response);

        // Handle different possible response structures
        let gamesArray: Game[] = [];

        if (response.data) {
          // If response has data property, check if it's an array or has nested data
          if (Array.isArray(response.data)) {
            gamesArray = response.data;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            gamesArray = response.data.data;
          }
        } else if (Array.isArray(response)) {
          // If response is directly an array
          gamesArray = response;
        }

        console.log("Extracted games array:", gamesArray);
        setGames(gamesArray);
      } catch (err: any) {
        console.error("Error fetching games:", err);
        toast({
          title: "Error",
          description: err.message || "Failed to fetch games.",
          variant: "destructive",
        });

        // If auth error, redirect to login
        if (err.response?.status === 401) {
          window.location.href = "/admin/login";
          return;
        }

        // Set empty games list if there's an error
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  // Add safety check to ensure games is always an array
  const safeGames = Array.isArray(games) ? games : [];

  if (safeGames.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No games found.</p>
        <Link href="/admin/games/new">
          <Button>Create Your First Game</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Games</h2>
        <Link href="/admin/games/new">
          <Button>Add New Game</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {safeGames.map((game) => (
          <Card key={game.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{game.title}</CardTitle>
              <CardDescription>{game.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {game.thumbnail && (
                <div className="mb-4">
                  <Image
                    src={game.thumbnail}
                    alt={game.title}
                    width={200}
                    height={120}
                    className="w-full h-32 object-cover rounded"
                  />
                </div>
              )}
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Type: <span className="font-medium">{game.type}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-medium">{game.status}</span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="space-x-2">
              <Link href={`/admin/games/${game.id}`}>
                <Button variant="outline" size="sm">
                  Edit
                </Button>
              </Link>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GameList;
