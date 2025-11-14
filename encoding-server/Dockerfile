#stage 1: Builder
FROM node:24-alpine AS builder

#FFmpeg 설치
RUN apk add --no-cache FFmpeg

#작업 디렉토리 설정
WORKDIR /app

#package.json 복사 및 의존성 설치
COPY package.json package-lock.json
RUN npm install

#소스코드 복사
COPY . .

#Prisma 클라이언트 생성
RUN npx prisma generate

#Stage2: production
FROM node:24-alpine

#FFmpeg 실행을 위해 재설치
RUN apk add --no-cache FFmpeg

WORKDIR /app

#package.json 복사 및 프로덕션 의존성만 설치
COPY package.json package-lock.json ./
RUN npm install --omit=dev

#빌드된 소스 및 prisma 클라이언트 복사
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# FFmpeg 실행을 위해 환경 변수 세팅 (선택)
ENV PATH="/usr/bin:${PATH}"

# 포트 노출
EXPOSE 3001

# 서버 실행
CMD ["node", "server.js"]