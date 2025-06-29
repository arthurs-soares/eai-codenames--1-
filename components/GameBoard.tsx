
import React from 'react';
import { CardData } from '../types';
import { Card } from './Card';

interface GameBoardProps {
  cards: CardData[];
  isSpymasterView: boolean;
  isGameOver: boolean;
  onCardClick: (index: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({ cards, isSpymasterView, isGameOver, onCardClick }) => {
  return (
    <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4 p-4 bg-slate-800/50 rounded-lg shadow-2xl w-full">
      {cards.map((card, index) => (
        <Card
          key={card.word}
          cardData={card}
          isSpymasterView={isSpymasterView}
          isGameOver={isGameOver}
          onClick={() => onCardClick(index)}
        />
      ))}
    </div>
  );
};
