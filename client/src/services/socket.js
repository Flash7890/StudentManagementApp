let socket = null;

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  // Lazy import so missing package never crashes initial render
  import('socket.io-client').then(({ io }) => {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    socket = io(SOCKET_URL, { withCredentials: true, transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', userId);
    });
    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });
  }).catch((err) => {
    console.warn('socket.io-client not available:', err);
  });

  // Return a stub while loading so callers don't crash
  return socket || { on: () => {}, emit: () => {}, connected: false };
};

export const disconnectSocket = () => {
  if (socket) {
    try { socket.disconnect(); } catch {}
    socket = null;
  }
};

export const getSocket = () => socket;