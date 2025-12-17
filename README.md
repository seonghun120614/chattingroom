# Chatting Room

간단한 채팅방 생성만 구현한 어플리케이션

### API 명세서

[API 명세서 문서](docs/02-api-spec.md) 참고

### Execution

1. Back Application Build

```bash
cd back
chmod +x ./script/build.sh
./script/build.sh
```

2. Docker Compose
```docker
docker-compose up -d
```

> back service 가 뜨는데 오래 걸릴 수 있습니다.

3. HTTP 요청 테스트
```bash
# GET - 모든 채팅방 조회
curl -i -X GET http://localhost:8080/api/chatroom \
  -H "Accept: application/json"

# POST - 새 채팅방 생성
curl -i -X POST http://localhost:8080/api/chatroom \
  -H "Content-Type: text/plain" \
  -H "Accept: application/json" \
  -d "새로운 채팅방"
```

> 서비스 종료: `docker-compose down -v`

### LICENSE

[MIT License](LICENSE) Copyright (c) 2024 seonghun