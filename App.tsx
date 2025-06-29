
import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { socket } from './services/socketService';
import { GameBoard } from './components/GameBoard';
import { ControlPanel } from './components/ControlPanel';
import { GameStatus } from './components/GameStatus';
import { LoadingSpinner } from './components/LoadingSpinner';
import { GameOverModal } from './components/GameOverModal';
import { Lobby, LobbySettings } from './components/Lobby';
import { TeamSelection } from './components/TeamSelection';

function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameId, setGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isSpymasterView, setIsSpymasterView] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleStateUpdate = (newGameState: GameState) => {
        console.log('Received state update:', newGameState);
        setGameState(newGameState);
        setIsLoading(false);
    };
    
    const handleGameCreated = ({ gameId, gameState, playerId }: { gameId: string, gameState: GameState, playerId: string }) => {
        setGameId(gameId);
        setPlayerId(playerId);
        setGameState(gameState);
        setIsLoading(false);
        // In a real app, this code would be shared with other players on the network
        alert(`Jogo criado! Compartilhe este código com outros na sua rede: ${gameId}`);
    };
    
    const handleGameJoined = ({ gameId, gameState, playerId }: { gameId: string, gameState: GameState, playerId: string }) => {
        setGameId(gameId);
        setPlayerId(playerId);
        setGameState(gameState);
        setIsLoading(false);
    };

    const handleError = (message: string) => {
        alert(`Erro: ${message}`);
        setIsLoading(false);
        setGameState(null);
        setGameId(null);
        setPlayerId(null);
    };

    socket.on('updateState', handleStateUpdate);
    socket.on('gameCreated', handleGameCreated);
    socket.on('gameJoined', handleGameJoined);
    socket.on('error', handleError);

    return () => {
      socket.off('updateState');
      socket.off('gameCreated');
      socket.off('gameJoined');
      socket.off('error');
    };
  }, []);

  const handleCreateGame = useCallback((settings: LobbySettings) => {
    setIsLoading(true);
    setIsSpymasterView(false);
    socket.emit('createGame', { 
        themes: settings.themes, 
        timerDuration: settings.timerDuration 
    });
  }, []);
  
  const handleCreateGameWithCustomWords = useCallback((words: string[], settings: LobbySettings) => {
    setIsLoading(true);
    setIsSpymasterView(false);
    socket.emit('createGame', { 
        customWords: words,
        timerDuration: settings.timerDuration
    });
  }, []);

  const handleJoinGame = useCallback((id: string) => {
    setIsLoading(true);
    setIsSpymasterView(false);
    socket.emit('joinGame', id);
  }, []);

  const handleCardClick = (index: number) => {
    socket.emit('cardClick', { gameId, cardIndex: index });
  };

  const handleEndTurn = () => {
    socket.emit('endTurn', { gameId });
  };
  
  const handleNewGameFromModal = () => {
      setGameState(null);
      setGameId(null);
      setPlayerId(null);
  };

  const handleBackToLobby = () => {
      setGameState(null);
      setGameId(null);
      setPlayerId(null);
  }
  
  const renderContent = () => {
      if (isLoading) {
          return <LoadingSpinner />;
      }

      if (!gameState || !gameId || !playerId) {
          return <Lobby onCreateGame={handleCreateGame} onJoinGame={handleJoinGame} onCreateGameWithCustomWords={handleCreateGameWithCustomWords} isLoading={isLoading} />;
      }
      
      switch(gameState.gamePhase) {
          case 'TEAM_SELECTION':
              return <TeamSelection gameState={gameState} gameId={gameId} playerId={playerId} onBackToLobby={handleBackToLobby} />;
          
          case 'IN_PROGRESS':
          case 'GAME_OVER':
              if (!gameState.cards || gameState.currentTurn === undefined) return <LoadingSpinner />;
              return (
                  <div className="w-full h-full flex flex-col items-center">
                       <header className="w-full max-w-7xl flex flex-col md:flex-row justify-between items-center mb-4">
                          <h1 className="text-5xl lg:text-6xl font-bold text-white font-display tracking-wide">EAI CODENAMES</h1>
                          {gameState && (
                            <ControlPanel
                              onNewGame={handleBackToLobby}
                              isSpymasterView={isSpymasterView}
                              onToggleSpymasterView={() => setIsSpymasterView(!isSpymasterView)}
                              onEndTurn={handleEndTurn}
                              isGameOver={!!gameState.isGameOver}
                              currentTurn={gameState.currentTurn}
                            />
                          )}
                        </header>
                        <main className="w-full max-w-7xl flex-grow flex flex-col items-center justify-center">
                          <GameStatus gameState={gameState} />
                          <GameBoard
                            cards={gameState.cards}
                            isSpymasterView={isSpymasterView}
                            onCardClick={handleCardClick}
                            isGameOver={!!gameState.isGameOver}
                          />
                        </main>
                         {gameState?.isGameOver && (
                            <GameOverModal winner={gameState.winner ?? null} onNewGame={handleNewGameFromModal} startingTeam={gameState.startingTeam}/>
                        )}
                  </div>
              );
          default:
            return <div>Erro: Fase de jogo desconhecida.</div>;
      }
  };

  return (
    <div className="bg-slate-900 text-slate-100 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {renderContent()}
    </div>
  );
}

export default App;