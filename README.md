#개인정보보호를 위한 비노출 휘발성 익명 채팅 
(Cloudflare Pages Direct Upload + Supabase Realtime)

[프로젝트 트리 구조]
/volatile-chat-app
├── package.json (루트 설정)
├── .gitignore
├── server/
│   ├── package.json
│   └── server.js
└── client/
├── package.json
      └── src/
          └── App.jsx



파일명: client/src/App.jsx
배포 시 생성된 서버 URL을 넣어야 합니다
const socket = io('http://localhost:5000');

배포 및 실행 지침:
1. 이 모든 파일을 구조에 맞춰 생성하여 GitHub에 업로드합니다.
2. 백엔드(server): Render.com에 연결하여 Root Directory를 server로 설정하고 배포합니다.
3. 프론트엔드(client): Vercel.com에 연결하여 Root Directory를 client로 설정하고 배포합니다.
4. 배포된 백엔드 주소를 App.jsx의 socket 연결 부분에 업데이트하면 링크만으로 누구나 설치 없이 익명 채팅을 즐길 수 있습니다