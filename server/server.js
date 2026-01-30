const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors()); // 교차 출처 리소스 공유 허용 [4, 5]
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// 서버 메모리에 접속자 정보 임시 저장 (DB 미사용) [3]
const users = {}; 

io.on('connection', (socket) => {
  // 사용자가 닉네임을 설정하고 접속을 시도할 때 (조건 4)
  socket.on('join_request', (nickname) => {
    users[socket.id] = nickname;
    // 다른 사용자들에게 알림 전송 (Broadcasting) [6]
    socket.broadcast.emit('system_message', `'${nickname}'님이 저장되지 않는 채팅 신청이 왔습니다.`);
  });

  // 메시지 중계 (저장하지 않고 즉시 전달) [7, 8]
  socket.on('send_message', (data) => {
    const messageData = {
      id: Date.now(), // 휘발성 삭제를 위한 고유 ID
      nickname: users[socket.id] || '익명',
      text: data.text,
      time: new Date().toLocaleTimeString()
    };
    io.emit('receive_message', messageData);
  });

  // 연결 종료 시 메모리 정리 [9, 10]
  socket.on('disconnect', () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
