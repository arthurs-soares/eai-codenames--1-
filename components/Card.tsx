
import React from 'react';
import { CardData, CardType } from '../types';

interface CardProps {
  cardData: CardData;
  isSpymasterView: boolean;
  isGameOver: boolean;
  onClick: () => void;
}

const cardBaseStyle = "w-full aspect-[3/2] flex items-center justify-center p-2 rounded-lg text-center font-bold text-sm sm:text-base md:text-lg lg:text-xl uppercase transition-all duration-300 ease-in-out transform shadow-md font-display tracking-wider";
const revealedCardStyle = "text-white scale-100 cursor-default";
const unrevealedCardStyle = "bg-stone-200 text-stone-800 hover:bg-stone-300 hover:scale-105 cursor-pointer";

const typeColors = {
  bg: {
    [CardType.RED]: 'bg-red-600',
    [CardType.BLUE]: 'bg-blue-600',
    [CardType.BYSTANDER]: 'bg-yellow-200',
    [CardType.ASSASSIN]: 'bg-gray-900',
  },
  text: {
    [CardType.RED]: 'text-white',
    [CardType.BLUE]: 'text-white',
    [CardType.BYSTANDER]: 'text-gray-900',
    [CardType.ASSASSIN]: 'text-white',
  },
  spymaster: {
    [CardType.RED]: 'shadow-red-500/80',
    [CardType.BLUE]: 'shadow-blue-500/80',
    [CardType.BYSTANDER]: 'shadow-yellow-400/80',
    [CardType.ASSASSIN]: 'shadow-black/80',
  }
};

export const Card: React.FC<CardProps> = ({ cardData, isSpymasterView, isGameOver, onClick }) => {
  let cardStyle = '';

  if (cardData.revealed) {
    cardStyle = `${cardBaseStyle} ${revealedCardStyle} ${typeColors.bg[cardData.type]} ${typeColors.text[cardData.type]}`;
  } else {
    cardStyle = `${cardBaseStyle} ${unrevealedCardStyle}`;
    if (isSpymasterView || isGameOver) {
      cardStyle += ` shadow-inner-lg ${typeColors.spymaster[cardData.type]}`;
    }
  }

  return (
    <div className={cardStyle} onClick={!cardData.revealed && !isGameOver ? onClick : undefined}>
      <span>{cardData.word}</span>
    </div>
  );
};

const styles = {
    'shadow-inner-lg': {
        'box-shadow': 'inset 0 0 15px 5px var(--tw-shadow-color)'
    }
};

// A bit of a hack to get a custom shadow working with CDN tailwind
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
        .shadow-inner-lg { box-shadow: inset 0 0 15px 5px var(--tw-shadow-color) !important; }
    `;
    document.head.appendChild(styleSheet);
}
