"use client";

import GameList from "./components/GameList";

const GamesPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Games Management</h1>
      <GameList />
    </div>
  );
};

export default GamesPage;
