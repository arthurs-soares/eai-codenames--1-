import { io } from 'socket.io-client';

// !! AÇÃO NECESSÁRIA !!
// Substitua esta URL pela URL do seu servidor.
// Para testes locais: 'http://localhost:3001'
// Para jogar com amigos pela internet: 'http://SEU_IP_PÚBLICO:3001'
const SERVER_URL = 'https://eai-codenames-1.onrender.com';

export const socket = io(SERVER_URL, {
    // Forçar WebSocket para evitar erros de polling (XHR poll error)
    transports: ['websocket'],
    // Estas opções ajudam a evitar alguns problemas comuns de conexão
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

// Você pode adicionar ouvintes de eventos de conexão aqui para depuração, se desejar
socket.on('connect', () => {
  console.log('Conectado ao servidor de jogo!', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado do servidor:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Erro de conexão:', err.message);
});