import { Server } from 'socket.io';
import Message from './models/Message.js';
import Chat from './models/Chat.js';

export const initializeSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: '*', // Allow all origins temporarily for testing
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
    }
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    
    // Join a room for private messaging
    socket.on('join', (userId) => {
      socket.join(userId);
      console.log(`User ${socket.id} joined room: ${userId}`);
    });
    
    // Handle private messages
    socket.on('private-message', async ({ chatId, message, senderId, receiverId }) => {
      try {
        // Save message to database
        const newMessage = new Message({
          chat: chatId,
          sender: senderId,
          content: message,
        });
        
        await newMessage.save();
        
        // Update chat with last message
        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: newMessage._id,
          updatedAt: Date.now()
        });
        
        // Emit to sender and receiver
        io.to(senderId).emit('new-message', newMessage);
        io.to(receiverId).emit('new-message', newMessage);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // Handle typing indicators
    socket.on('typing', ({ to, isTyping }) => {
      io.to(to).emit('typing', isTyping);
    });
    
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
}; 