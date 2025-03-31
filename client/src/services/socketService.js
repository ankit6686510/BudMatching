import { io } from 'socket.io-client';
import { receiveNewMessage } from '../store/slices/messageSlice';

let socket;
let dispatch;

export const initializeSocket = (userId, storeDispatch) => {
  // Clean up any existing socket first
  disconnectSocket();
  
  dispatch = storeDispatch;
  
  const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
  
  try {
    // Create socket connection
    socket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });
    
    // Socket event listeners
    socket.on('connect', () => {
      console.log('Socket connected');
      // Join user's room for private messages
      socket.emit('join', userId);
    });
    
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
    
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    socket.on('newMessage', (message) => {
      // Dispatch action to store new message in Redux
      if (dispatch) {
        dispatch(receiveNewMessage(message));
      }
    });
    
    return socket;
  } catch (error) {
    console.error('Socket initialization error:', error);
    return null;
  }
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const sendPrivateMessage = (to, message) => {
  if (socket) {
    socket.emit('private-message', { to, message });
  }
};

export const sendTypingStatus = (to, isTyping) => {
  if (socket) {
    socket.emit('typing', { to, isTyping });
  }
};

export const getSocket = () => socket; 