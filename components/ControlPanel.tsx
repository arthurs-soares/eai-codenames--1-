
import React from 'react';
import { Player } from '../types';

interface ControlPanelProps {
  onNewGame: () => void;
  isSpymasterView: boolean;
  onToggleSpymasterView: () => void;
  onEndTurn: () => void;
  isGameOver: boolean;
  currentTurn: Player;
}

const Button: React.FC<React.PropsWithChildren<{ onClick: () => void; className?: string; disabled?: boolean }>> = ({ onClick, children, className = '', disabled = false }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ onNewGame, isSpymasterView, onToggleSpymasterView, onEndTurn, isGameOver, currentTurn }) => {
  return (
    <div className="flex flex-wrap gap-2 items-center justify-center mt-4 md:mt-0">
      <Button onClick={onNewGame} className="bg-green-600 hover:bg-green-700 focus:ring-green-500 text-white">
        Novo Jogo
      </Button>
      <Button onClick={onToggleSpymasterView} className={`${isSpymasterView ? 'bg-purple-600' : 'bg-slate-600'} hover:bg-purple-700 focus:ring-purple-500 text-white`}>
        {isSpymasterView ? 'Visão de Operador' : 'Visão de Mestre-Espião'}
      </Button>
       <Button 
        onClick={onEndTurn} 
        disabled={isGameOver}
        className={`${currentTurn === Player.RED ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} focus:ring-yellow-400 text-white`}
      >
        Encerrar Turno
      </Button>
    </div>
  );
};