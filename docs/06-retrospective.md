# 프로젝트 회고

## 1. 가장 막혔던 지점

막혔던 지점들만 정리하고 2번 차례에서 설명한다

1. `React` + `Next.js` 에서 클라이언트가 URI 의 Host 부분을 어떻게 가져가는지
2. Git Action 의 동작이 VM 과의 동작과 달리하는 지점이 생겨 `.env` 을 못가져 삽질 했던 경우

결국에는 서버(컨테이너) 간의 의사소통에서 가장 시간을 많이 할애

## 2. 이해가 부족하다고 느낀 부분

#### Front(Next + React) 의 요청 API URL 설정

**`use client`**

브라우저 기준이며 브라우저 측에서 요청을 보낼 때에는 시스템 외부이기 때문에 URI 가 localhost 혹은 외부 IP 로 가져가야 한다.

**`use client` 가 아닌 경우**

브라우저 기준이 아닌 시스템 내부에서의 보내는 경우이며 이 경우에는 Docker DNS 를 사용하여 보낼 수 있다.

다음은 두 경우를 모두 아우르는 API 설정 코드이다.

```javascript
const getBaseURL = () => {
    if (typeof window !== 'undefined') {
        // 클라이언트 사이드: 현재 호스트 사용
        return `${window.location.protocol}//${window.location.hostname}:8080/api`;
    }
    // 서버 사이드: Docker 내부 네트워크 (예: docker-compose에서 back 서비스)
    return 'http://back:8080/api';
};
```

window 객체는 브라우저에만 존재하기 때문에 해당 객체가 undefined 이면 달리 적용하게 된다.

```text
┌───────────────────────────────────┐
│  getBaseURL() 함수 호출             │
└─────────────────┬─────────────────┘
                  │
                  ▼
         window 객체 존재?
                  │
        ┌─────────┴─────────┐
        │                   │
      YES                  NO
 (브라우저/클라이언트)   (Next.js 서버)
        │                   │
        ▼                   ▼
  현재 브라우저 URL     Docker 서비스명
  정보로 URL 생성        'back' 사용
        │                   │
        ▼                   ▼
http://현재호스트:8080  http://back:8080
```

#### CORS DI 로 받기

**증상**
CORS 에 등록되어야 할 Allowed Origin 들은 보통 외부로 노출시키면 보안 상 적절치 않다.

**해결**
따라서 이를 `application.yml` 을 통해 받을 수 있다.

```yml
cors:
    allowed-origins: http://0.0.0.0:3000,http://0.0.0.0:80,...
```

불러올 땐 다음과 같이 불러올 수 있다

```java
@Value
private String origins;

// ...

cors.setAllowedCorsOrigins(origins.split(","))
```

#### Git Submodule이 깨져서 폴더가 원격 레포에 push 안 되는 문제 해결

**증상**
- 특정 폴더가 Git 원격 레포지토리에서 회색으로 표시되고 화살표 아이콘이 보임
- 해당 폴더를 push 해도 파일 내용이 올라가지 않고 빈 폴더만 보임
- GitHub 에서 폴더를 클릭하면 아무 내용도 없음

**원인**

```bash
fatal: No url found for submodule path '<submodule-name>' in .gitmodules
```

Git 이 해당 폴더를 submodule 로 인식하고 있지만, `.gitmodules` 파일에 제대로 등록되지 않아 깨진 상태이다.

**해결 방법**

1. **Submodule 상태 확인**

```bash
git submodule status
```
   
다음 에러가 뜨면 submodule이 깨진 상태:

```bash
fatal: No url found for submodule path '<submodule-name>' in .gitmodules
```

2. **중요 파일 백업 (필수!)**

```bash
# 혹시 모르니 해당 폴더 압축 백업
zip -r submodule-backup.zip path/to/submodule

# 혹은 tar 사용
```

3. **깨진 Submodule 제거**

```bash
git rm --cached path/to/submodule
```

이 명령어는 Git 캐시에서만 제거하고 실제 파일은 유지

4. **변경사항 확인**

```bash
git status
```

이제 submodule 내부 파일들이 전부 추적(tracking) 가능한 일반 파일로 표시됨

5. **커밋 및 푸시**

```bash
git add path/to/submodule
git commit -m "Fix: Remove broken submodule and add as regular files"
git push origin main
```

**결과**
위 명령어를 입력하면 캐시 되어 있는 submodule 내부의 git 흔적을 해지시킬 수 있다. 그런 후에 다시 `git status` 를 시키면 이제 submodule 로 되어 있던 내부 파일들이 전부 tracking 이 되어 다시 커밋할 수 있게 된다.

#### JPA Entity 의 Getter 부재 시 직렬화 문제점

엔티티의 특정 필드에 `@Getter` 가 없다면 해당 필드는 JSON 직렬화 시 포함되지 않게 된다.

따라서 front 에서 응답을 받았을 때는 해당 특정 필드를 가져올 수 없게 된다.

#### .env 파일이 제대로 적용되었는지 확인하는 방법

```docker
docker-compose config
```

#### bash script 특정 명령어의 다수 출력들에 대한 로깅

```bash
log_command() {
    log "$ $*"
    "$@" 2>&1 | while IFS= read -r line; do
        echo -e "${YELLOW}  → ${NC}${line}"
    done
    local exit_code=${PIPESTATUS[0]}
    return $exit_code
}

log_command (여러 개의 출력을 하는 명령)
```

> Bash 에서 파이프(|) 로 연결된 명령어들의 종료 상태 코드를 배열로 저장하는 특수 변수  
> `PIPESTATUS[0]`: 첫 번째 명령어의 종료 코드

#### Git Actions scp 사용해보기

```yml
      - name: Copy docker-compose.yml to GCP
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.GCP_HOST }}
          username: ${{ secrets.GCP_USERNAME }}
          key: ${{ secrets.GCP_SSH_KEY }}
          source: "docker-compose.yml"
          target: ${{ secrets.GCP_APP_PATH }}
```

`Secure Copy Protocol` 의 약자이며 ssh 를 사용하여서 안전한 파일 전송 프로토콜을 하게 된다. 이때 key 에는 `key-gen` 을 통해 `rsa` 방식으로 발급 받은 public 키를 미리 GCP VM(원격 컴퓨터) 이 알고 있어야 하며, 우리가 가지고 있는 `SSH_KEY` 를 통해 해당 VM 과 안전한 파일 전송을 할 수 있도록 해준다.

보통 일반적인 scp 명령은 다음과 같다

```bash
# 일반 SCP 명령어 예시
scp myfile.txt user@server:/path/to/destination
```

Git Actions 에서는 `appleboy/scp-action@master` 의 서드파티 API 를 사용하여 SCP 명령어를 쉽게 사용할 수 있고 다음 값들을 넣어줘야 한다.

- `host`: 서버 IP/도메인 (외부 IP 넣으면 됨)
- `username`: SSH 사용자 명 -> VM 내부에서 `whoami` 참고
- `key`: secret key 값
- `source`: 현재 로컬 컴퓨터에서 가지고 있는 파일
- `target`: VM 내부에 저장될 경로
- `port`: 22(기본값)

> `overwrite: true` 로 주면 덮어씌우기도 된다.

#### Git Actions ssh 사용해보기

```yml
      - name: Deploy to GCP VM
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.GCP_HOST }}
          username: ${{ secrets.GCP_USERNAME }}
          key: ${{ secrets.GCP_SSH_KEY }}
          port: 22
          script: |
```

VM 으로의 ssh 접속도 가능하다. scp 에서 `source`, `target` key-value 만 없어지고, script 로 바뀌어진 것 뿐이다.

따라서 대부분의 원격 접속이나 원격 파일 전송은 다음 key-value 쌍이 무조건 들어가야 함을 기억하자.

- host
- username
- key
- port(기본값)

> 이들은 URI 를 이루는 기본 인터넷 상의 찾을 수 있는 유일한 경로들 중 일부분을 나타내는 것들이다.

#### 헷갈렸던 환경변수 들고오는 작업

**파일 별 환경변수 호출 방식**

Git Actions 의 `yml` 만 `${{}}` 문법을 사용 나머지는 전부 `${}` 사용

#### Docker Compose 의 deploy 블럭 지시문

`deploy.resources.limits.memory` 와 `deploy.resources.reservations.memory` 을 통해 한계치와 얼만큼 최소 쓸지 미리 예약이 가능하다.

```docker
    deploy:
      resources:
        limits:
          memory: 200M
        reservations:
          memory: 100M
```

#### MySQL 연결 오류: allowPublicKeyRetrieval과 SSL 설정 문제 해결

**로컬 환경 오류**

```text
com.mysql.cj.jdbc.exceptions.CommunicationsException:
Communications link failure
Public Key Retrieval is not allowed
```

**Public Key Retrieval** 오류이며, `MySQL 8.0` 부터 기본 인증 방식이 `caching_sha2_password`로 변경되면서 발생하는 문제이다.

백엔드 서버가 데이터베이스 서버에 처음 연결할 때, 암호화된 비밀번호를 검증하기 위해 서버의 `Public Key` 를 가져와야 한다. 하지만 보안상의 이유로 기본적으로 이 기능이 비활성화되어 있기 때문에 가져올 수 없을 때 이런 오류가 뜨게 된다.

**발생 조건:**
- MySQL 8.0 이상
- `caching_sha2_password` 인증 방식 사용
- SSL 연결이 아닌 경우
- 처음 연결하는 클라이언트

이를 해결하려면 기본값을 살짝 변경을 해주면 된다.

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/testdb?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=Asia/Seoul
    username: test
    driver-class-name: com.mysql.cj.jdbc.Driver
```

- `allowPublicKeyRetrieval=true`: Public Key를 가져올 수 있도록 허용
- `useSSL=false`: 로컬 개발 환경에서는 SSL 비활성화
    - 로컬 개발 환경은 외부에 노출되지 않음
    - SSL 인증서 설정의 복잡성 제거
    - 개발 속도 향상
- `serverTimezone=Asia/Seoul`: 타임존 명시 - MySQL 8.0 부터 필수

**배포 환경 오류**

```text
javax.net.ssl.SSLException: 
Closing inbound before receiving peer's close_notify
```

**SSL 오류**

MySQL은 기본적으로 SSL 연결을 시도하지만, Docker 환경에서는 SSL 인증서가 제대로 설정되어 있지 않아 다음과 같은 문제가 발생한다:

- SSL 핸드셰이크 실패
- 인증서 검증 실패
- 연결 종료 시 프로토콜 불일치

해결 방안

```yaml
spring:
  datasource:
    url: jdbc:mysql://db:3306/testdb?allowPublicKeyRetrieval=true&useSSL=false&serverTimezone=Asia/Seoul
    username: ${SPRING_DATASOURCE_USER}
    password: ${SPRING_DATASOURCE_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
```

**배포 환경에서도 useSSL=false를 사용하는 이유:**

1. **Docker 내부 네트워크**
   - 컨테이너 간 통신은 Docker의 내부 네트워크를 통해 이루어짐
   - 외부에 노출되지 않아 상대적으로 안전
   
2. **SSL 설정의 복잡성**
   - MySQL 컨테이너에 SSL 인증서 생성 및 마운트 필요
   - Spring Boot 컨테이너에 인증서 신뢰 설정 필요
   - 인증서 갱신 및 관리 부담
   
3. **성능**
   - SSL 암호화/복호화 오버헤드 제거
   - 내부 통신 속도 향상

> SSL 이 필요한 경우는 3306 의 포트가 외부로 노출될 때만 필요

---

## 3. 팀 프로젝트 전에 보완하고 싶은 기술

- Reversed Proxy
    - `nginx.conf` 공부 필요

- Front
    - 기본적인건 할 줄 알되 아직 익숙치 않아 이를 공부해야 할 필요성을 느낌, `Router`, `useEffect` 등 다시 공부 필요
    - Front 에서 쓰일 주가 될 기본적인 아키텍처 공부 필요 (FSD)

- Spring
    - 회원가입
        - 실존하는 사용자인지 인증하는 것이 필요(PASS / 전화)
        - Redis 서버 공부 후 카카오, 토스 인증을 할 수 있도록 기틀 마련
    - 로그인은 OAuth2 를 통한 인가 공부 필요(아직 미숙)
    - Spring Flux 를 더 공부하여 동기와 비동기를 동시에 서비스하여 채팅 기능도 될 수 있도록 만들기

- Database
    - NoSQL DB 도 다룰 수 있도록 Spring 의 모듈 중 MongoDB 연동 공부
    - MySQL 의 비동기식 DB 를 사용하기 위해 공부 -> 데이터 스트리밍 까지

- 외부 API
    - Python Fast API 사용하여 LLM 혹은 간단한 비지도 학습 데이터 마이닝 모델 도입을 위한 공부 필요
    - 카카오, 구글이 제공하는 공개 지도 API 를 통해 다양한 서비스를 위한 외부 API 공부 필요
    - 결제 서비스를 제공하는 외부 API 공부 필요

## 4. 혼자 진행하며 느낀 점

- 아직 dev, prod 가 완벽히 나눠진게 아니라 아쉬움
- compose 다 작성해놓고 쿠버네티스 적용 못함
- 좀 더 잘 적용할 수 있었던 환경 변수 관리가 미흡
- 어플리케이션 간 커뮤니케이션을 할 때 어느 로그를 이제 보아야 할 지 감이 잡힘