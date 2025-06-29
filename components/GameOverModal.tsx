
import React from 'react';
import { Player } from '../types';

interface GameOverModalProps {
  winner: Player | null;
  startingTeam: Player;
  onNewGame: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ winner, onNewGame }) => {
  if (!winner) return null;

  const winnerColor = winner === Player.RED ? 'text-red-500' : 'text-blue-500';
  const winnerBg = winner === Player.RED ? 'bg-red-500/20' : 'bg-blue-500/20';
  const winnerBorder = winner === Player.RED ? 'border-red-500' : 'border-blue-500';
  const winnerName = winner === Player.RED ? 'VERMELHA' : 'AZUL';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className={`relative bg-slate-800 border-2 ${winnerBorder} rounded-xl shadow-2xl p-8 max-w-lg w-full text-center transform transition-all animate-in-fade-in animate-in-zoom-in-95`}>
        <h2 className="font-display text-6xl font-bold mb-2">FIM DE JOGO</h2>
        <p className={`font-display text-5xl font-bold ${winnerColor} mb-6`}>
          EQUIPE {winnerName} VENCE!
        </p>
        <button
          onClick={onNewGame}
          className="bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-3 px-8 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};

// Simple animation keyframes for CDN tailwind
if (typeof window !== 'undefined') {
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes fade-in { 
        from { opacity: 0; } to { opacity: 1; } 
      }
      @keyframes zoom-in-95 { 
        from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } 
      }
      .animate-in-fade-in { animation: fade-in 0.3s ease-out; }
      .animate-in-zoom-in-95 { animation: zoom-in-95 0.3s ease-out; }
    `;
    document.head.appendChild(styleSheet);
}