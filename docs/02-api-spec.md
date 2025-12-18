# API 명세서

## 1. 전체 다짐 목록 조회

| Method | Endpoint | 인증 | 설명 | Request Body | Response |
|--------|----------|------|------|--------------|----------|
| GET | `/api/chatroom` | ❌ 불필요 | 모든 채팅방 조회 | - | `200 OK` + ChatRoom 배열 |

## 2. 다짐 등록

| Method | Endpoint | 인증 | 설명 | Request Body | Response |
|--------|----------|------|------|--------------|----------|
| POST | `/api/chatroom` | ❌ 불필요 | 새 채팅방 생성 | `"채팅방 이름"` (text/plain) | `201 Created` + ChatRoom 객체 (`application/json`) |