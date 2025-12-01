FROM node:24-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# 나머지 소스 코드 복사 (prisma/schema.prisma 파일 포함)
COPY . .

# Prisma 클라이언트 생성
RUN npx prisma generate

# Production Stage
FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json ./

# '프로덕션' 의존성만 설치
RUN npm install --omit=dev

# 소스 코드 복사
COPY --from=builder /app/src ./src
COPY --from=builder /app/server.js ./server.js
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/haru-film-firebase.json ./haru-film-firebase.json

# Prisma 클라이언트 복사
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

EXPOSE 3000

CMD ["node", "server.js"]