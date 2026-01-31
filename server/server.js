const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

/** ✅ GitHub Pages 주소 명시 */
const ALLOWED_ORIGIN = "https://gbfc2030-ops.github.io";

app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGIN,
    methods: ["GET", "POST"]
  }
});

const users = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_request', (nickname) => {
    users[socket.id] = nickname;
    socket.broadcast.emit(
      'system_message',
      `'${nickname}'님이 익명 채팅에 입장했습니다.`
    );
  });

  socket.on('send_message', (data) => {
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

/** Render가 자동으로 PORT 주입 */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
