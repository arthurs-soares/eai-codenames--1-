
import React, { useState, useEffect } from 'react';
import { GameState, Player } from '../types';

interface GameStatusProps {
  gameState: GameState;
}

const TurnTimer: React.FC<{ endTime: number | null, duration: number | null }> = ({ endTime, duration }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!endTime || !duration) {
      setTimeLeft(0);
      return;
    }

    const calculateRemaining = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
    };

    calculateRemaining();
    const interval = setInterval(calculateRemaining, 500);

    return () => clearInterval(interval);
  }, [endTime, duration]);
  
  if (!duration || !endTime) return null;

  const percentage = (timeLeft / (duration * 1000)) * 100;

  return (
    <div className="w-full max-w-2xl px-2">
      <div className="text-center text-sm text-slate-400 mb-1">Tempo Restante: {Math.ceil(timeLeft / 1000)}s</div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div 
          className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500 ease-linear"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
};


export const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  const { scores, currentTurn, startingTeam, message, isGameOver, turnEndTime, turnTimerDuration } = gameState;
  
  const ScorePill: React.FC<{ team: Player; score: number; isTurn: boolean; isStarting: boolean }> = ({ team, score, isTurn, isStarting }) => {
    const color = team === Player.RED ? 'bg-red-600' : 'bg-blue-600';
    const ringColor = team === Player.RED ? 'ring-red-400' : 'ring-blue-400';
    const teamName = team === Player.RED ? 'EQUIPE VERMELHA' : 'EQUIPE AZUL';

    return (
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full text-white transition-all duration-300 ${color} ${isTurn && !isGameOver ? `ring-4 ${ringColor}` : 'opacity-70'}`}>
        <span className="font-display text-4xl font-bold">{score}</span>
        <div className="text-left">
          <span className="block font-bold text-lg leading-tight">{teamName}</span>
          {isStarting && <span className="text-xs opacity-80 leading-tight block">Começa</span>}
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full max-w-7xl flex flex-col items-center gap-4 my-4">
      <div className="flex flex-row justify-center items-center gap-4 sm:gap-6">
        <ScorePill team={Player.RED} score={scores.RED} isTurn={currentTurn === Player.RED} isStarting={startingTeam === Player.RED}/>
        <ScorePill team={Player.BLUE} score={scores.BLUE} isTurn={currentTurn === Player.BLUE} isStarting={startingTeam === Player.BLUE} />
      </div>
       {!isGameOver && (
         <>
          <p className="text-center text-lg h-8 text-yellow-300 font-semibold">{message || `É a vez da Equipe ${currentTurn === Player.RED ? 'Vermelha' : 'Azul'}.`}</p>
          <TurnTimer endTime={turnEndTime} duration={turnTimerDuration} />
         </>
      )}
    </div>
  );
};