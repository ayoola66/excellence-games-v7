'use client';

import React from 'react';
import Image from 'next/image';
import { ASSETS } from '@/lib/constants';
import { motion } from 'framer-motion';

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  type: string;
}

interface GameTypeTagProps {
  type: string;
}

const GameTypeTag = ({ type }: GameTypeTagProps) => {
  const getTypeColor = () => {
    switch (type.toLowerCase()) {
      case 'quiz':
        return 'bg-blue-100 text-blue-800';
      case 'puzzle':
        return 'bg-green-100 text-green-800';
      case 'strategy':
        return 'bg-purple-100 text-purple-800';
      case 'action':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor()}`}>
      {type}
    </span>
  );
};

interface PlayButtonProps {
  gameId: string;
}

const PlayButton = ({ gameId }: PlayButtonProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
      onClick={() => window.location.href = `/game/${gameId}`}
    >
      Play Now
    </motion.button>
  );
};

interface GameGridProps {
  games: Game[];
}

export function GameGrid({ games }: GameGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {games.map((game) => (
        <motion.div
          key={game.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-xl overflow-hidden"
        >
          <div className="relative aspect-video">
            <Image
              src={game.thumbnail || ASSETS.IMAGES.PLACEHOLDER}
              alt={game.title}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold">{game.title}</h3>
            <p className="text-gray-600 mt-2 line-clamp-2">{game.description}</p>
            <div className="mt-4 flex justify-between items-center">
              <GameTypeTag type={game.type} />
              <PlayButton gameId={game.id} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
} 