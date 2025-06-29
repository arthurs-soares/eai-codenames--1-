
import React, { useState, useMemo } from 'react';
import { WORDS_TO_GENERATE } from '../constants';

export interface LobbySettings {
    themes: string;
    timerDuration: number | null;
}

interface LobbyProps {
  onJoinGame: (gameId: string) => void;
  onCreateGame: (settings: LobbySettings) => void;
  onCreateGameWithCustomWords: (words: string[], settings: LobbySettings) => void;
  isLoading: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({ onCreateGame, onJoinGame, onCreateGameWithCustomWords, isLoading }) => {
  const [gameIdInput, setGameIdInput] = useState('');
  const [customWordsInput, setCustomWordsInput] = useState('');
  const [themesInput, setThemesInput] = useState('');
  const [timerDuration, setTimerDuration] = useState<string>('0');

  const customWords = useMemo(() => {
    return customWordsInput
      .split(/[\s,]+/) // Split by whitespace or commas
      .map(word => word.trim())
      .filter(word => word.length > 0);
  }, [customWordsInput]);

  const isCustomWordsValid = customWords.length === WORDS_TO_GENERATE;

  const getSettings = (): LobbySettings => ({
      themes: themesInput.trim(),
      timerDuration: Number(timerDuration) > 0 ? Number(timerDuration) : null,
  });

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (gameIdInput.trim()) {
      onJoinGame(gameIdInput.trim().toUpperCase());
    }
  };
  
  const handleCreateWithCustom = () => {
    if (isCustomWordsValid) {
      onCreateGameWithCustomWords(customWords, getSettings());
    }
  };
  
  const handleCreateRandom = () => {
      onCreateGame(getSettings());
  }

  return (
    <div className="w-full max-w-md mx-auto text-center animate-in-fade-in">
      <h1 className="text-6xl lg:text-7xl font-bold text-white font-display tracking-wide mb-8">EAI CODENAMES</h1>
      <div className="bg-slate-800/50 p-6 md:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-display text-yellow-300 mb-6">Criar ou Entrar em um Jogo</h2>
        
        {/* Game Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left mb-6">
            <div>
                <label htmlFor="themes" className="block text-sm font-medium text-slate-300 mb-1">Temas (se a API estiver configurada)</label>
                <input
                    type="text"
                    id="themes"
                    value={themesInput}
                    onChange={(e) => setThemesInput(e.target.value)}
                    placeholder="ex: espaço, filmes, animais"
                    className="w-full bg-slate-200 text-slate-900 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                />
            </div>
            <div>
                 <label htmlFor="timer" className="block text-sm font-medium text-slate-300 mb-1">Cronômetro de Turno</label>
                 <select
                    id="timer"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(e.target.value)}
                    className="w-full bg-slate-200 text-slate-900 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                 >
                     <option value="0">Sem Cronômetro</option>
                     <option value="30">30 segundos</option>
                     <option value="60">60 segundos</option>
                     <option value="90">90 segundos</option>
                 </select>
            </div>
        </div>
        
        {/* Create with Random/AI Words */}
        <button
          onClick={handleCreateRandom}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-8 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-wait"
        >
          {isLoading ? 'Criando...' : 'Criar Jogo (Palavras Aleatórias)'}
        </button>
        
        {/* Custom Words Section */}
        <details className="mt-4 text-left group">
            <summary className="cursor-pointer text-slate-400 hover:text-white transition-colors">
                Usar Palavras Personalizadas...
            </summary>
            <div className="mt-4 bg-slate-900/50 p-4 rounded-lg">
                <p className="text-sm text-slate-300 mb-2">
                    Cole exatamente {WORDS_TO_GENERATE} palavras, separadas por espaços ou vírgulas.
                </p>
                <textarea
                    value={customWordsInput}
                    onChange={(e) => setCustomWordsInput(e.target.value)}
                    placeholder="CASTELO, FLORESTA, ÁGUIA, DIAMANTE..."
                    rows={5}
                    className="w-full bg-slate-200 text-slate-900 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
                    aria-label="Custom words input"
                />
                <div className="flex justify-between items-center mt-2">
                    <p className={`text-sm font-bold ${isCustomWordsValid ? 'text-green-400' : 'text-yellow-400'}`}>
                        {customWords.length} / {WORDS_TO_GENERATE} palavras
                    </p>
                    <button
                        onClick={handleCreateWithCustom}
                        disabled={!isCustomWordsValid || isLoading}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Criar com estas palavras
                    </button>
                </div>
            </div>
        </details>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-slate-600" />
          <span className="px-4 text-slate-400">OU</span>
          <hr className="flex-grow border-slate-600" />
        </div>
        
        {/* Join Game */}
        <form onSubmit={handleJoin}>
          <p className="text-lg mb-2">Entrar em um jogo existente:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={gameIdInput}
              onChange={(e) => setGameIdInput(e.target.value)}
              placeholder="INSERIR CÓDIGO"
              className="flex-grow bg-slate-200 text-slate-900 font-bold tracking-widest text-center text-xl p-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
              maxLength={4}
              aria-label="Game Code"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-purple-500/50">
              Entrar
            </button>
          </div>
        </form>

        <p className="text-xs text-slate-500 mt-6 px-4">
          Para jogar em rede, inicie o servidor na pasta 'server' e acesse a aplicação cliente no navegador.
        </p>
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
      .animate-in-fade-in { animation: fade-in 0.5s ease-out; }
    `;
    document.head.appendChild(styleSheet);
}
