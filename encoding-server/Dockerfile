FROM node:24-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

# 소스코드 복사
COPY . .

FROM node:24-alpine

RUN apk add --no-cache ffmpeg

WORKDIR /app

# 프로덕션 의존성 설치
COPY package.json package-lock.json ./
RUN npm install --omit=dev

COPY --from=builder /app/src ./

CMD ["node", "worker.js"]