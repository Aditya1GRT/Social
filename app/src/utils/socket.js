import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || undefined;

const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  autoConnect: false,
});

export default socket;
