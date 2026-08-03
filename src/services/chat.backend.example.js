/**
 * BACKEND EXAMPLE - Node.js + Express + Socket.io
 * 
 * Đây là ví dụ về cách implement backend cho tính năng chat
 * Sử dụng Express và Socket.io
 */

// npm install express socket.io jsonwebtoken

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"]
  }
});

app.use(express.json());

// In-memory storage (thay bằng database thực tế)
const users = new Map(); // userId -> socket
const conversations = new Map(); // conversationId -> { users, messages }

// Middleware xác thực JWT
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// WebSocket authentication
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  const userId = socket.handshake.query.userId;

  if (!token || !userId) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.userId = parseInt(userId);
    socket.user = decoded;
    next();
  });
});

// WebSocket connection
io.on('connection', (socket) => {
    
  // Lưu socket của user
  users.set(socket.userId, socket);

  // Broadcast user online status
  socket.broadcast.emit('status', {
    type: 'status',
    payload: {
      userId: socket.userId,
      isOnline: true
    }
  });

  // Xử lý tin nhắn
  socket.on('message', async (data) => {
    try {
      const { type, payload } = JSON.parse(data);
      
      if (type === 'message') {
        const { receiverId, content } = payload;
        
        // Lưu tin nhắn vào database
        const message = {
          id: Date.now(), // Thay bằng ID từ database
          conversationId: getConversationId(socket.userId, receiverId),
          senderId: socket.userId,
          receiverId: receiverId,
          content: content,
          createdAt: new Date().toISOString()
        };

        // TODO: Lưu vào database
        // await db.messages.create(message);

        // Gửi tin nhắn cho người nhận
        const receiverSocket = users.get(receiverId);
        if (receiverSocket) {
          receiverSocket.emit('message', {
            type: 'message',
            payload: message
          });
        }

        // Gửi lại cho người gửi (confirmation)
        socket.emit('message', {
          type: 'message',
          payload: message
        });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Xử lý typing indicator
  socket.on('typing', (data) => {
    try {
      const { type, payload } = JSON.parse(data);
      
      if (type === 'typing') {
        const { receiverId, isTyping } = payload;
        const receiverSocket = users.get(receiverId);
        
        if (receiverSocket) {
          receiverSocket.emit('typing', {
            type: 'typing',
            payload: {
              userId: socket.userId,
              isTyping: isTyping
            }
          });
        }
      }
    } catch (error) {
      console.error('Error handling typing:', error);
    }
  });

  // Xử lý disconnect
  socket.on('disconnect', () => {
        users.delete(socket.userId);

    // Broadcast user offline status
    socket.broadcast.emit('status', {
      type: 'status',
      payload: {
        userId: socket.userId,
        isOnline: false
      }
    });
  });
});

// REST API Endpoints

// Lấy danh sách cuộc trò chuyện
app.get('/api/chat/conversations', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: Query từ database
    // const conversations = await db.conversations.findAll({
    //   where: { userId: userId },
    //   include: ['user', 'lastMessage']
    // });

    // Mock data
    const conversations = [
      {
        id: 1,
        userId: 2,
        user: {
          id: 2,
          name: 'Nguyễn Văn A',
          avatar: '/images/default-avatar.svg',
          isOnline: users.has(2)
        },
        lastMessage: {
          content: 'Xin chào!',
          createdAt: new Date().toISOString()
        },
        unreadCount: 0
      }
    ];

    res.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Lấy lịch sử tin nhắn
app.get('/api/chat/conversations/:id/messages', authenticateToken, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    // TODO: Query từ database
    // const messages = await db.messages.findAll({
    //   where: { conversationId: conversationId },
    //   order: [['createdAt', 'DESC']],
    //   limit: limit,
    //   offset: offset
    // });

    // Mock data
    const messages = [];

    res.json({
      messages: messages.reverse(),
      pagination: {
        page,
        limit,
        total: 0
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Tạo cuộc trò chuyện mới
app.post('/api/chat/conversations', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const { userId } = req.body;

    // TODO: Tạo hoặc lấy conversation từ database
    // let conversation = await db.conversations.findOne({
    //   where: {
    //     [Op.or]: [
    //       { userId1: currentUserId, userId2: userId },
    //       { userId1: userId, userId2: currentUserId }
    //     ]
    //   }
    // });
    //
    // if (!conversation) {
    //   conversation = await db.conversations.create({
    //     userId1: currentUserId,
    //     userId2: userId
    //   });
    // }

    // Mock data
    const conversation = {
      id: Date.now(),
      userId: userId,
      user: {
        id: userId,
        name: 'User ' + userId,
        avatar: '/images/default-avatar.svg',
        isOnline: users.has(userId)
      }
    };

    res.json({ conversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Failed to create conversation' });
  }
});

// Đánh dấu đã đọc
app.put('/api/chat/conversations/:id/read', authenticateToken, async (req, res) => {
  try {
    const conversationId = parseInt(req.params.id);
    const userId = req.user.id;

    // TODO: Update database
    // await db.messages.update(
    //   { isRead: true },
    //   {
    //     where: {
    //       conversationId: conversationId,
    //       receiverId: userId,
    //       isRead: false
    //     }
    //   }
    // );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

// Tìm kiếm người dùng
app.get('/api/chat/users/search', authenticateToken, async (req, res) => {
  try {
    const query = req.query.q;
    const currentUserId = req.user.id;

    if (!query) {
      return res.json({ users: [] });
    }

    // TODO: Query từ database
    // const users = await db.users.findAll({
    //   where: {
    //     id: { [Op.ne]: currentUserId },
    //     name: { [Op.like]: `%${query}%` }
    //   },
    //   limit: 10
    // });

    // Mock data
    const searchResults = [
      {
        id: 2,
        name: 'Nguyễn Văn A',
        avatar: '/images/default-avatar.svg'
      }
    ];

    res.json({ users: searchResults });
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

// Helper function
function getConversationId(userId1, userId2) {
  // Tạo ID duy nhất cho conversation giữa 2 users
  return userId1 < userId2 
    ? `${userId1}-${userId2}` 
    : `${userId2}-${userId1}`;
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  });

/**
 * DATABASE SCHEMA EXAMPLE (PostgreSQL/MySQL)
 * 
 * CREATE TABLE conversations (
 *   id SERIAL PRIMARY KEY,
 *   user_id_1 INTEGER NOT NULL,
 *   user_id_2 INTEGER NOT NULL,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 *   UNIQUE(user_id_1, user_id_2)
 * );
 * 
 * CREATE TABLE messages (
 *   id SERIAL PRIMARY KEY,
 *   conversation_id INTEGER REFERENCES conversations(id),
 *   sender_id INTEGER NOT NULL,
 *   receiver_id INTEGER NOT NULL,
 *   content TEXT NOT NULL,
 *   is_read BOOLEAN DEFAULT FALSE,
 *   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 * );
 * 
 * CREATE INDEX idx_messages_conversation ON messages(conversation_id);
 * CREATE INDEX idx_messages_created_at ON messages(created_at);
 */
