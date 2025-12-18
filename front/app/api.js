// app/api.js

// 브라우저에서 현재 호스트 사용
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // 클라이언트 사이드: 현재 호스트 사용
        return `${window.location.protocol}//${window.location.hostname}:8080/api`;
    }
    // 서버 사이드: Docker 내부 네트워크 (예: docker-compose에서 back 서비스)
    return 'http://back:8080/api';
};
  
const API_BASE_URL = getBaseURL();
  
// 채팅방 목록 조회: GET /api/chatroom
export async function getChatRooms() {
    const res = await fetch(`${API_BASE_URL}/chatroom`, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
        },
    });
  
    if (!res.ok) {
        throw new Error(`채팅방 목록 조회 실패: ${res.status}`);
    }
  
    return res.json(); // List<ChatRoom> 형태의 JSON 반환
}
  
// 채팅방 생성: POST /api/chatroom (text/plain)
export async function createChatRoom(roomName) {
    const res = await fetch(`${API_BASE_URL}/chatroom`, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain',
            'Accept': 'application/json',
        },
        body: roomName,
    });
  
    if (!res.ok) {
        throw new Error(`채팅방 생성 실패: ${res.status}`);
    }
  
    return res.json(); // 생성된 ChatRoom 객체 반환
}