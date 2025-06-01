import React from "react";

type GameCardProps = {
  title: string;
  thumbnail: string;
  isPremium?: boolean;
  onClick: () => void;
};

const GameCard: React.FC<GameCardProps> = ({ title, thumbnail, isPremium, onClick }) => (
  <div
    className="rounded-lg shadow-lg bg-white dark:bg-gray-900 p-4 flex flex-col items-center cursor-pointer hover:bg-blue-50 transition"
    onClick={onClick}
  >
    <img src={thumbnail} alt={title} className="w-32 h-32 object-cover rounded-md mb-2" />
    <div className="flex items-center gap-2">
      <h3 className="font-bold text-lg">{title}</h3>
      {isPremium && <span className="text-xs bg-yellow-300 text-yellow-900 px-2 py-1 rounded">Premium</span>}
    </div>
  </div>
);

export default GameCard;