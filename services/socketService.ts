import { io } from 'socket.io-client';

// !! AÇÃO NECESSÁRIA !!
// Substitua esta URL pela URL PÚBLICA do seu servidor no Render.
// Exemplo: 'https://eai-codenames-server.onrender.com'
const SERVER_URL = 'https://eai-codenames-1.onrender.com';

export const socket = io(SERVER_URL, {
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Conectado ao servidor de jogo!', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Desconectado do servidor:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Erro de conexão:', err.message);
});
