# Docker 구성 설명

## 1. Docker를 사용하는 이유

도커가 없었을 때는 다음과 같은 방식을 썼을 것 같다.

기존 방식은 하나의 어플리케이션을 완성 후 배포에 맞는 세팅을 하여 서버에 올리는 작업을 수행

**단점**
- 배포 파일들을 USB 로 옮기거나 FTP 를 사용해야 할거 같다.
- 하나의 문제점이 발견되면 다시 배포 할 때마다 파일을 옮겨줘야 한다.
- 컨테이너라는 범위가 없기 때문에 어플리케이션 하나가 다양한 서버 자원들중 얼마나 차지하는지 명확하지 않으며, 보려면 서버 컴퓨터까지 가서 제어판이나 명령어를 쳐서 확인해야 한다.
- 한 서버에 어플리케이션이 다수가 구동될 때, 여러 개의 어플리케이션을 관리하기 힘들 수 있으며, 포트가 열리고 닫히는게 관리가 어렵기에 보안에 취약할 수 있다.
- 또한 여러 개의 어플리케이션에 적용될 환경 변수들을 일일히 관리하기가 굉장히 까다로울 것이다

## 2. Backend Dockerfile 설명

```docker
# Stage 1
FROM gradle:9.2.1-jdk21 AS build

WORKDIR /app

# 빌드와 관련된 파일만 복사
COPY gradlew .
COPY gradle/ gradle/
COPY settings.gradle settings.gradle
COPY build.gradle build.gradle

# gradlew 실행 권한 수정
RUN chmod +x gradlew

# 빌드 할 소스코드 파일 복사
COPY src/ src/

# test 는 아직 미완이라 테스트 없이 수행
# Gradle의 데몬(백그라운드 프로세스) 모드를 비활성화하는 옵션이며
# 빌드가 끝나면 Gradle 프로세스가 즉시 종료된다
RUN ./gradlew build -x test --no-daemon

# Stage 2
FROM eclipse-temurin:21.0.9_10-jre-ubi9-minimal

WORKDIR /app

# 0.0.1 버전만을 가지고 오기
COPY --from=build /app/build/libs/*-0.0.1-SNAPSHOT.jar ./app.jar

# 회고하다가 발견한 테스트 없이 실행하는 옵션은 java 에는 없는 옵션
CMD [ "java", "-jar", "app.jar", "-x", "test" ]

# 메타 데이터 용
EXPOSE 8080
```

## 3. Frontend Dockerfile 설명

```docker
FROM node:20-alpine AS builder

WORKDIR /app

# 라이브러리/의존성/패키지들과 명령어 alias 설정 파일 복사
COPY package*.json ./

# npm clean install 의 약자
# package-lock.json을 엄격히 준수하여 의존성 설치
# package-lock.json이 없으면 에러 발생
# node_modules를 완전히 삭제 후 재설치
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["node", "server.js"]
```

**npm ci 이점**
- `package-lock.json` 엄격히 준수 (없으면 에러)
- `node_modules` 완전 삭제 후 재설치로 일관성 보장
- 캐시 최적화로 속도 향상
- CI/CD 환경에 최적화

## 4. docker-compose 역할

service 별 환경 변수를 달리하여 파라미터화만 하여 용도에 맞게 쉽게 조정이 가능하고, 빌드와 환경 변수를 한데 모아서 볼 수 있으며, 포트 번호 및 컨테이너 간의 네트워킹 혹은 볼륨 등을 기본적으로 묶어서 의사소통 할 수 있도록 지원한다.

또한 컨테이너 별로 실행 시점을 달리 가져갈 수 있는 `depends_on` 블럭 및 `healthcheck` 블럭을 적절히 활용하여 서비스가 비정상적 종료를 하지 않고 동작할 수 있도록 하며, 컨테이너 별 자원 한계치도 한 눈에 볼 수 있게 된다.

이를 `docker compose` 단 하나의 명령어로 다 관리할 수 있게 한다.

> `Dockerfile` 에서는 환경변수가 자동으로 읽히지 않는데 비해 `docker-compose.yml` 에서는 `.env` 파일을 자동으로 읽어서 `${key}` 로 불러올 수 있다.