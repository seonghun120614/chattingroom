// app/page.js
'use client';

import { useEffect, useState } from 'react';
import { getChatRooms, createChatRoom } from './api';

export default function HomePage() {
  const [rooms, setRooms] = useState([]);
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState(null);

  // 페이지 로드시 방 목록 불러오기
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getChatRooms();
        setRooms(data);
      } catch (err) {
        console.error(err);
        setError('채팅방 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;

    try {
      setCreating(true);
      setError(null);
      const newRoom = await createChatRoom(roomName.trim());
      setRooms((prev) => [...prev, newRoom]);
      setRoomName('');
    } catch (err) {
      console.error(err);
      setError('채팅방 생성 중 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main style={{ maxWidth: 600, margin: '40px auto', padding: 16, fontFamily: 'sans-serif' }}>
      <h1>채팅방 리스트</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
        <label style={{ display: 'block', marginBottom: 8 }}>
          새 채팅방 이름
        </label>
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="예: 자유 채팅방"
          style={{
            width: '100%',
            padding: '8px 12px',
            marginBottom: 12,
            borderRadius: 4,
            border: '1px solid #ccc',
          }}
        />
        <button
          type="submit"
          disabled={creating}
          style={{
            padding: '8px 16px',
            borderRadius: 4,
            border: 'none',
            backgroundColor: creating ? '#9ca3af' : '#2563eb',
            color: '#fff',
            cursor: creating ? 'default' : 'pointer',
          }}
        >
          {creating ? '생성 중...' : '채팅방 생성'}
        </button>
      </form>

      {loading && <p>채팅방 목록을 불러오는 중...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!loading && rooms.length === 0 && <p>아직 생성된 채팅방이 없습니다.</p>}

      <ul style={{ listStyle: 'none', padding: 0 }}>
        {rooms.map((room) => (
          <li
            key={room.id}
            style={{
              padding: '8px 12px',
              borderRadius: 4,
              border: '1px solid #e5e7eb',
              marginBottom: 8,
            }}
          >
            <span>[ ID: {room.id} ] <strong>{room.roomName.split(".")[0]}</strong> {room.createdAt}</span>
          </li>
        ))}
      </ul>
    </main>
  );
}