import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

// 배포 시에는 생성된 서버 URL을 넣어야 합니다 [13, 14]
const socket = io('https://chatapp-server.render.com');

function App() {
  const [nickname, setNickname] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // 메시지 수신 시 휘발성 로직 적용 (조건 3, 5) [15, 16]
    socket.on('receive_message', (data) => {
      setMessages((prev) => [...prev, data]);

      // 10초 후 메시지 자동 삭제 (상태에서 제거)
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== data.id));
      }, 10000); 
    });

    socket.on('system_message', (msg) => {
      alert(msg); // 채팅 신청 안내 (조건 4)
    });

    return () => socket.off();
  }, []);

  const handleJoin = () => {
    if (nickname.trim()) {
      socket.emit('join_request', nickname);
      setIsJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('send_message', { text: message });
      setMessage('');
    }
  };

  // 1. 로그인 전 화면 (조건 1)
  if (!isJoined) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <h2>익명 휘발성 채팅</h2>
        <input 
          placeholder="닉네임 입력" 
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          style={{ padding: '10px', marginBottom: '10px' }}
        />
        <button onClick={handleJoin} style={{ padding: '10px 20px' }}>채팅 입장</button>
      </div>
    );
  }

  // 2. 채팅 중 화면 (조건 2, 3, 5) [17, 18]
  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
      <h3>사용자: {nickname} (10초 후 메시지 소멸)</h3>
      <div style={{ border: '1px solid #ddd', height: '400px', overflowY: 'auto', padding: '10px', marginBottom: '10px' }}>
        {messages.map((m) => (
          <div key={m.id} style={{ margin: '10px 0', borderBottom: '1px dashed #eee' }}>
            <small>[{m.time}]</small> <strong>{m.nickname}</strong>: {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} style={{ display: 'flex' }}>
        <input 
          style={{ flex: 1, padding: '10px' }}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
        />
        <button type="submit" style={{ padding: '10px' }}>전송</button>
      </form>
    </div>
  );
}


export default App;

