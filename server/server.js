const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

// ✅ GitHub Pages + 로컬 개발 모두 허용
app.use(cors({
  origin: [
    'https://gbfc2030-ops.github.io', // GitHub Pages
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST']
}));

// ✅ health check (Render용)
app.get('/healthz', (req, res) => {
  res.send('OK');
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      'https://gbfc2030-ops.github.io',
      'http://localhost:5173',
      'http://localhost:3000'
    ],
    methods: ['GET', 'POST']
  }
});

// 메모리 기반 사용자 관리
const users = {};

io.on('connection', (socket) => {
  socket.on('join_request', (nickname) => {
    users[socket.id] = nickname;
    socket.broadcast.emit(
      'system_message',
      `'${nickname}'님이 채팅에 입장했습니다.`
    );
  });

socket.on('send_message', (data) => {
  console.log("📩 received:", data);

  io.emit('receive_message', {
    id: Date.now(),
    nickname: users[socket.id] || '익명',
    text: data.text,
    time: new Date().toLocaleTimeString()
  });
});

  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
