# API 명세서

**Chatting Room 명세**
| Method | Endpoint | 인증 | 설명 | Request Body | Response |
|--------|----------|------|------|--------------|----------|
| GET | `/api/chatroom` | ❌ 불필요 | 모든 채팅방 조회 | - | `200 OK` + ChatRoom 배열 |
| POST | `/api/chatroom` | ❌ 불필요 | 새 채팅방 생성 | `"채팅방 이름"` (text/plain) | `201 Created` + ChatRoom 객체 |