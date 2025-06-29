require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const { GoogleGenAI } = require("@google/genai");

// --- CONFIGURAÇÃO INICIAL ---
const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Permite conexões de qualquer cliente
    methods: ["GET", "POST"]
  }
});

// --- INICIALIZAÇÃO OPCIONAL DA API ---
let ai;
if (process.env.API_KEY) {
    console.log("API_KEY encontrada. A IA Gemini será usada para gerar palavras.");
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
} else {
    console.log("API_KEY não encontrada no arquivo .env. Usando lista de palavras de fallback.");
}

// --- CONSTANTES E LÓGICA DE JOGO ---

const teamTranslations = { RED: 'Vermelha', BLUE: 'Azul' };
const WORDS_TO_GENERATE = 25;
const GRID_SIZE = 25;
const NUM_RED_AGENTS = 8;
const NUM_BLUE_AGENTS = 8;
const NUM_BYSTANDERS = 7;
const NUM_ASSASSINS = 1;

const fallbackWords = [
    "RIO", "PONTE", "FLORESTA", "CASTELO", "LUA", "ESTRELA", "MONTANHA", "DRAGÃO", "ESPADA", "ESCUDO",
    "REI", "RAINHA", "MAGO", "FANTASMA", "TESOURO", "MAPA", "NAVIO", "PIRATA", "ILHA", "OCEANO",
    "DESERTO", "CASCATA", "TEMPESTADE", "RAIO", "VULCÃO", "PLANETA", "GALÁXIA", "FOGUETE", "ALIEN", "ROBÔ",
    "COMPUTADOR", "LIVRO", "POÇÃO", "FEITIÇO", "GIGANTE", "ANÃO", "ELFO", "GUERREIRO", "ARCO", "FLECHA"
];

async function fetchCodenamesWords(themes) {
  if (!ai) {
    console.log("Buscando palavras da lista de fallback.");
    return shuffleArray(fallbackWords).slice(0, WORDS_TO_GENERATE);
  }

  const themeInstructions = themes 
    ? `As palavras devem estar relacionadas aos seguintes temas: ${themes}.`
    : 'As palavras devem ser diversas e cobrir uma variedade de tópicos.';
  
  const prompt = `Gere um array JSON de ${WORDS_TO_GENERATE} substantivos únicos, de uma só palavra, comuns em português, adequados para um jogo de adivinhação de palavras como Codenames. ${themeInstructions} Todas as palavras devem estar em maiúsculas. Garanta que a saída seja apenas uma string de array JSON válida. Formato de exemplo: ["CACHORRO", "CARRO", "RIO", "LIVRO", "ÁRVORE"]`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
        config: { responseMimeType: "application/json", temperature: 1, },
    });
    
    let jsonStr = response.text.trim();
    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
    }
    const parsedData = JSON.parse(jsonStr);

    if (Array.isArray(parsedData) && parsedData.length >= WORDS_TO_GENERATE && parsedData.every(item => typeof item === 'string')) {
       return parsedData.slice(0, WORDS_TO_GENERATE).map(word => word.toUpperCase());
    } else {
        throw new Error("Invalid data format from AI.");
    }
  } catch (error) {
    console.error("Error fetching words from Gemini API, usando fallback:", error);
    return shuffleArray(fallbackWords).slice(0, WORDS_TO_GENERATE);
  }
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function startGame(currentState, words) {
  const startingTeam = Math.random() < 0.5 ? 'RED' : 'BLUE';
  
  const redAgents = startingTeam === 'RED' ? NUM_RED_AGENTS + 1 : NUM_RED_AGENTS;
  const blueAgents = startingTeam === 'BLUE' ? NUM_BLUE_AGENTS + 1 : NUM_BLUE_AGENTS;

  const types = [
    ...Array(redAgents).fill('RED'),
    ...Array(blueAgents).fill('BLUE'),
    ...Array(NUM_BYSTANDERS).fill('BYSTANDER'),
    ...Array(NUM_ASSASSINS).fill('ASSASSIN')
  ];

  const shuffledTypes = shuffleArray(types);
  const shuffledWords = shuffleArray(words);

  const cards = Array.from({ length: GRID_SIZE }, (_, i) => ({
    word: shuffledWords[i],
    type: shuffledTypes[i],
    revealed: false,
  }));

  return {
    ...currentState,
    gamePhase: 'IN_PROGRESS',
    cards,
    currentTurn: startingTeam,
    startingTeam,
    scores: { 'RED': redAgents, 'BLUE': blueAgents },
    winner: null,
    isGameOver: false,
    message: `É a vez da Equipe ${teamTranslations[startingTeam]} dar a pista.`,
    turnEndTime: null,
  };
}

const createInitialGameState = (timerDuration, creatorId, creatorName, themes, customWords) => ({
  gamePhase: 'TEAM_SELECTION',
  redTeam: { players: [], spymasterId: null },
  blueTeam: { players: [], spymasterId: null },
  unassignedPlayers: [{ id: creatorId, name: creatorName }],
  message: "Aguardando jogadores entrarem nas equipes.",
  turnTimerDuration: timerDuration,
  themes,
  customWords,
});

const handleCardClickLogic = (gameState, index) => {
    let state = { ...gameState };
    if (!state.cards || state.currentTurn === undefined) return { newState: state, turnChanged: false };
    
    const newCards = [...state.cards];
    const clickedCard = newCards[index];

    if (clickedCard.revealed) return { newState: state, turnChanged: false };

    clickedCard.revealed = true;

    const newScores = { ...state.scores };
    let turnOver = false;
    let newTurn = state.currentTurn;
    let message = '';
    let isGameOver = false;
    let winner = null;
    
    const currentPlayerTeamCardType = state.currentTurn === 'RED' ? 'RED' : 'BLUE';

    if (clickedCard.type === 'ASSASSIN') {
      isGameOver = true;
      winner = state.currentTurn === 'RED' ? 'BLUE' : 'RED';
      message = `O assassino foi encontrado! A equipe ${teamTranslations[winner]} vence!`;
    } else if (clickedCard.type === 'BYSTANDER') {
      turnOver = true;
      message = 'Você encontrou um civil. Fim do turno.';
    } else if (clickedCard.type === currentPlayerTeamCardType) {
      newScores[state.currentTurn]--;
      message = 'Correto! Continue tentando.';
      if (newScores[state.currentTurn] === 0) {
        isGameOver = true;
        winner = state.currentTurn;
        message = `A equipe ${teamTranslations[winner]} encontrou todos os seus agentes! Eles venceram!`;
      }
    } else {
      turnOver = true;
      const otherTeam = state.currentTurn === 'RED' ? 'BLUE' : 'RED';
      newScores[otherTeam]--;
      message = `Essa palavra pertence à equipe ${teamTranslations[otherTeam]}! Fim do turno.`;
      if (newScores[otherTeam] === 0) {
        isGameOver = true;
        winner = otherTeam;
        message = `A equipe ${teamTranslations[winner]} encontrou todos os seus agentes! Eles venceram!`;
      }
    }

    if (turnOver) {
      newTurn = state.currentTurn === 'RED' ? 'BLUE' : 'RED';
      if(!isGameOver) {
          message += ` Agora é a vez da Equipe ${teamTranslations[newTurn]}.`;
      }
    }
    
    return {
        newState: {
            ...state,
            cards: newCards,
            scores: newScores,
            currentTurn: newTurn,
            isGameOver,
            winner,
            gamePhase: isGameOver ? 'GAME_OVER' : state.gamePhase,
            message,
        },
        turnChanged: turnOver,
    };
};

const handleEndTurnLogic = (gameState) => {
    if (gameState.currentTurn === undefined) return gameState;
    const newTurn = gameState.currentTurn === 'RED' ? 'BLUE' : 'RED';
    return {
        ...gameState,
        currentTurn: newTurn,
        message: `Turno passado para a Equipe ${teamTranslations[newTurn]}.`,
    };
};

function findAndRemovePlayer(state, playerId) {
    const teams = ['redTeam', 'blueTeam', 'unassignedPlayers'];
    let foundPlayer = null;
    let nextState = JSON.parse(JSON.stringify(state)); // Deep copy

    for (const key of teams) {
        let players = key === 'unassignedPlayers' ? nextState.unassignedPlayers : nextState[key].players;
        const playerIndex = players.findIndex(p => p.id === playerId);
        if (playerIndex > -1) {
            [foundPlayer] = players.splice(playerIndex, 1);
            if ((key === 'redTeam' || key === 'blueTeam') && nextState[key].spymasterId === playerId) {
                nextState[key].spymasterId = null;
            }
            break;
        }
    }
    return { player: foundPlayer, newState: nextState };
}

// --- GERENCIAMENTO DE ESTADO DO SERVIDOR ---
const games = {};
const gameTimeouts = {};
let playerCounter = 0;

function manageTurnCycle(gameId, newState) {
    if (gameTimeouts[gameId]) {
      clearTimeout(gameTimeouts[gameId]);
      delete gameTimeouts[gameId];
    }

    games[gameId] = newState;

    if (newState.isGameOver || !newState.turnTimerDuration) {
        newState.turnEndTime = null;
        io.to(gameId).emit('updateState', newState);
        return;
    }
    
    const durationMs = newState.turnTimerDuration * 1000;
    newState.turnEndTime = Date.now() + durationMs;

    gameTimeouts[gameId] = setTimeout(() => {
        const currentState = games[gameId];
        if (currentState && !currentState.isGameOver) {
            console.log(`[Game ${gameId}]: Turno expirado.`);
            const nextState = handleEndTurnLogic(currentState);
            manageTurnCycle(gameId, nextState);
        }
    }, durationMs);
    
    io.to(gameId).emit('updateState', newState);
}

// --- OUVINTES DE EVENTOS SOCKET.IO ---
io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    socket.on('createGame', ({ timerDuration, themes, customWords }) => {
        const gameId = Math.random().toString(36).substring(2, 6).toUpperCase();
        const playerId = `player_${playerCounter++}`;
        const playerName = `Jogador ${playerCounter}`;
        
        socket.join(gameId);
        const newGame = createInitialGameState(timerDuration, playerId, playerName, themes, customWords);
        games[gameId] = newGame;
        
        console.log(`[Game ${gameId}]: Jogo criado por ${playerName} (${playerId})`);
        socket.emit('gameCreated', { gameId, gameState: newGame, playerId });
    });

    socket.on('joinGame', (gameId) => {
        const normalizedGameId = gameId.toUpperCase();
        if (games[normalizedGameId]) {
            const game = games[normalizedGameId];
            const playerId = `player_${playerCounter++}`;
            const playerName = `Jogador ${playerCounter}`;
            
            socket.join(normalizedGameId);
            game.unassignedPlayers.push({ id: playerId, name: playerName });
            
            console.log(`[Game ${normalizedGameId}]: ${playerName} (${playerId}) entrou.`);
            socket.emit('gameJoined', { gameId: normalizedGameId, gameState: game, playerId });
            io.to(normalizedGameId).emit('updateState', game);
        } else {
            socket.emit('error', 'Jogo não encontrado.');
        }
    });

    socket.on('setPlayerName', ({ gameId, playerId, name }) => {
        const game = games[gameId];
        if (!game) return;
        const allPlayers = [...game.unassignedPlayers, ...game.redTeam.players, ...game.blueTeam.players];
        const player = allPlayers.find(p => p.id === playerId);
        if (player) {
            console.log(`[Game ${gameId}]: ${player.name} mudou o nome para ${name}`);
            player.name = name;
            io.to(gameId).emit('updateState', game);
        }
    });
    
    socket.on('joinTeam', ({ gameId, playerId, team }) => {
        let game = games[gameId];
        if (!game) return;
        const { player, newState } = findAndRemovePlayer(game, playerId);
        if(player) {
            if(team === 'RED') {
                newState.redTeam.players.push(player);
            } else {
                newState.blueTeam.players.push(player);
            }
            games[gameId] = newState;
            console.log(`[Game ${gameId}]: ${player.name} entrou na equipe ${team}`);
            io.to(gameId).emit('updateState', newState);
        }
    });

    socket.on('becomeSpymaster', ({ gameId, playerId }) => {
        const game = games[gameId];
        if (!game) return;
        const redPlayer = game.redTeam.players.find(p => p.id === playerId);
        if (redPlayer) {
            game.redTeam.spymasterId = playerId;
            console.log(`[Game ${gameId}]: ${redPlayer.name} é o novo mestre-espião vermelho.`);
        } else {
            const bluePlayer = game.blueTeam.players.find(p => p.id === playerId);
            if (bluePlayer) {
                game.blueTeam.spymasterId = playerId;
                console.log(`[Game ${gameId}]: ${bluePlayer.name} é o novo mestre-espião azul.`);
            }
        }
        io.to(gameId).emit('updateState', game);
    });

    socket.on('requestStartGame', async ({ gameId }) => {
        const game = games[gameId];
        if (game && game.gamePhase === 'TEAM_SELECTION') {
            try {
                let words;
                if (game.customWords && game.customWords.length === WORDS_TO_GENERATE) {
                    words = game