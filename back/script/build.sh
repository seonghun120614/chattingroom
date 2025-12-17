#!/bin/bash
#
# desc.: For development building
# writer: seonghun
# usage: chmod +x build.sh && ./build.sh

set -euo pipefail

IMAGE_NAME="chatting-back:1.0"
DIR_NAME=$(dirname $(dirname $0))
FILE_NAME=$(basename $0)

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[ ${FILE_NAME} ]${NC} ${BLUE}$1${NC}"
}

log_command() {
    log "$ $*"
    "$@" 2>&1 | while IFS= read -r line; do
        echo -e "${YELLOW}  → ${NC}${line}"
    done
    local exit_code=${PIPESTATUS[0]}
    return $exit_code
}

log "build 중..."
chmod u+x gradlew && ./gradlew clean build
log "build 완료"

log_command docker rm $(docker ps -aq -f ancestor=${IMAGE_NAME}) -v 2>/dev/null || true
log_command docker rmi $IMAGE_NAME 2>/dev/null || true
log_command docker build -f Dockerfile.dev -t $IMAGE_NAME ${DIR_NAME}

log "백엔드 빌드 완료 - 실행 코드"
log "docker-compose up -d"