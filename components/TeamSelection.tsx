import React, { useState, useMemo, useEffect } from 'react';
import { GameState, Player, PlayerInfo, Team } from '../types';
import { socket } from '../services/socketService';

interface TeamSelectionProps {
  gameState: GameState;
  gameId: string;
  playerId: string;
  onBackToLobby: () => void;
}

const TeamColumn: React.FC<{
  team: Team;
  teamColor: Player;
  title: string;
  localPlayerId: string;
  localPlayerTeam: Player | null;
  gameId: string;
}> = ({ team, teamColor, title, localPlayerId, localPlayerTeam, gameId }) => {
  const spymaster = team.players.find(p => p.id === team.spymasterId);
  const operatives = team.players.filter(p => p.id !== team.spymasterId);
  const isLocalPlayerInTeam = localPlayerTeam === teamColor;
  
  const handleBecomeSpymaster = () => {
    socket.emit('becomeSpymaster', { gameId, playerId: localPlayerId });
  };
  
  const handleJoinTeam = () => {
    socket.emit('joinTeam', { gameId, playerId: localPlayerId, team: teamColor });
  };

  return (
    <div className={`flex-1 p-4 rounded-lg ${teamColor === Player.RED ? 'bg-red-900/50' : 'bg-blue-900/50'}`}>
      <h3 className={`font-display text-4xl mb-4 ${teamColor === Player.RED ? 'text-red-300' : 'text-blue-300'}`}>{title}</h3>
      
      {/* Spymaster Section */}
      <div className="mb-4 min-h-[80px] bg-black/20 p-3 rounded">
        <h4 className="text-lg font-bold text-yellow-300">Mestre-Espião</h4>
        {spymaster ? (
          <p className="text-xl font-semibold">{spymaster.name} {spymaster.id === localPlayerId && '(Você)'}</p>
        ) : (
          <p className="text-slate-400">Nenhum mestre-espião ainda</p>
        )}
      </div>

      {/* Operatives Section */}
      <div className="mb-4 min-h-[120px] bg-black/20 p-3 rounded">
        <h4 className="text-lg font-bold text-yellow-300">Operadores</h4>
        {operatives.length > 0 ? (
          <ul>
            {operatives.map(op => <li key={op.id} className="text-xl">{op.name} {op.id === localPlayerId && '(Você)'}</li>)}
          </ul>
        ) : (
           <p className="text-slate-400">Nenhum operador ainda</p>
        )}
      </div>

      {isLocalPlayerInTeam && team.spymasterId !== localPlayerId && (
        <button onClick={handleBecomeSpymaster} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-4 rounded transition-colors mb-2">
          Ser Mestre-Espião
        </button>
      )}

      {!isLocalPlayerInTeam && (
        <button onClick={handleJoinTeam} className={`w-full font-bold py-2 px-4 rounded transition-colors ${teamColor === Player.RED ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          Entrar na {title}
        </button>
      )}
    </div>
  );
};

export const TeamSelection: React.FC<TeamSelectionProps> = ({ gameState, gameId, playerId, onBackToLobby }) => {
  const { redTeam, blueTeam, unassignedPlayers, themes } = gameState;
  const [isStarting, setIsStarting] = useState(false);
  
  const me = useMemo(() => 
    [...redTeam.players, ...blueTeam.players, ...unassignedPlayers].find(p => p.id === playerId),
    [redTeam, blueTeam, unassignedPlayers, playerId]
  );
  
  const [nameInput, setNameInput] = useState(me?.name || '');

  useEffect(() => {
    setNameInput(me?.name || '');
  }, [me]);

  const localPlayerTeam = useMemo(() => {
    if (redTeam.players.some(p => p.id === playerId)) return Player.RED;
    if (blueTeam.players.some(p => p.id === playerId)) return Player.BLUE;
    return null;
  }, [redTeam, blueTeam, playerId]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value);
  };
  
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim() && nameInput !== me?.name) {
      socket.emit('setPlayerName', { gameId, playerId, name: nameInput.trim() });
    }
  };

  const isGameReady = useMemo(() => {
      return redTeam.spymasterId && blueTeam.spymasterId && redTeam.players.length >= 2 && blueTeam.players.length >= 2;
  }, [redTeam, blueTeam]);

  const handleStartGame = () => {
    if (isGameReady && !isStarting) {
      setIsStarting(true);
      // O cliente apenas solicita ao servidor para iniciar o jogo.
      // O servidor irá buscar as palavras (usando temas se houver) e criar o tabuleiro.
      socket.emit('requestStartGame', { gameId });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto text-center animate-in-fade-in">
      <h1 className="text-5xl lg:text-6xl font-bold text-white font-display tracking-wide mb-2">SELEÇÃO DE EQUIPES</h1>
      <p className="text-slate-400 mb-6">Código do Jogo: <span className="font-bold text-yellow-300 tracking-widest">{gameId}</span></p>

      {me && (
        <div className="bg-slate-800/50 p-4 rounded-xl shadow-lg mb-6">
          <form onSubmit={handleNameSubmit} className="flex items-center justify-center gap-2">
            <label htmlFor="name-input" className="text-lg">Seu Nome:</label>
            <input
              id="name-input"
              type="text"
              value={nameInput}
              onChange={handleNameChange}
              className="bg-slate-200 text-slate-900 p-2 rounded-lg focus:outline-none focus:ring-4 focus:ring-purple-500/50"
            />
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg">Definir Nome</button>
          </form>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-4 md:gap-6">
        <TeamColumn team={redTeam} teamColor={Player.RED} title="Equipe Vermelha" localPlayerId={playerId} localPlayerTeam={localPlayerTeam} gameId={gameId} />
        <TeamColumn team={blueTeam} teamColor={Player.BLUE} title="Equipe Azul" localPlayerId={playerId} localPlayerTeam={localPlayerTeam} gameId={gameId} />
      </div>

      {unassignedPlayers.length > 0 && (
          <div className="mt-4 p-3 bg-slate-800 rounded-lg">
              <h4 className="font-bold text-lg">Jogadores aguardando para entrar em uma equipe:</h4>
              <p>{unassignedPlayers.map(p => p.name).join(', ')}</p>
          </div>
      )}

      <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button 
            onClick={handleStartGame}
            disabled={!isGameReady || isStarting}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold text-xl py-4 px-12 rounded-lg transition-all focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600"
          >
              {isStarting ? 'Iniciando...' : (isGameReady ? 'Começar Jogo!' : 'Aguardando Times...')}
          </button>
          <button onClick={onBackToLobby} className="w-full sm:w-auto bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-6 rounded-lg">
              Voltar para o Lobby
          </button>
      </div>
      {!isGameReady && (
        <p className="text-yellow-400 mt-4">Cada equipe precisa de um Mestre-Espião e pelo menos um Operador para começar.</p>
      )}
    </div>
  );
};