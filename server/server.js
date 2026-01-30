const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();

/**
 * ✅ 여기만 본인 프론트 주소로 맞추세요.
 * - GitHub Pages: https://gbfc2030-ops.github.io
 * - (프로젝트 경로 /chatapp 은 Origin에 포함되지 않습니다. Origin은 도메인까지만!)
 * - 개발용: http://localhost:5173 (Vite), http://localhost:3000 (CRA)
 */
const FRONTEND_ORIGINS = [
  "https://gbfc2030-ops.github.io",
  "http://localhost:5173",
  "http://localhost:3000",
];

// Origin 검사 함수
function isAllowedOrigin(origin) {
  // Postman/curl 등 origin 없는 요청은 허용 (필요시 false로 바꿔도 됨)
  if (!origin) return true;
  return FRONTEND_ORIGINS.includes(origin);
}

/** ✅ (1) Express CORS: REST 요청(있다면)용 */
app.use(
  cors({
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    credentials: false, // 쿠키 안쓰면 false 유지
  })
);

/** (선택) JSON 바디를 받을 일이 있으면 켜두세요 */
app.use(express.json());

const server = http.createServer(app);

/** ✅ (2) Socket.io CORS: 웹소켓/폴링 연결용 */
const io = new Server(server, {
  cors: {
    origin: (origin, cb) => {
      if (isAllowedOrigin(origin)) return cb(null, true);
      return cb(new Error("Socket CORS blocked: " + origin), false);
    },
    methods: ["GET", "POST"],
    credentials: false,
  },
});

/** 서버 메모리에 접속자 정보 임시 저장 (DB 미사용) */
const users = {};

io.on("connection", (socket) => {
  socket.on("join_request", (nickname) => {
    users[socket.id] = nickname;
    socket.broadcast.emit(
      "system_message",
      `'${nickname}'님이 저장되지 않는 채팅 신청이 왔습니다.`
    );
  });

  socket.on("send_message", (data) => {
    const messageData = {
      id: Date.now(),
      nickname: users[socket.id] || "익명",
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };
    io.emit("receive_message", messageData);
  });

  socket.on("disconnect", () => {
    delete users[socket.id];
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
