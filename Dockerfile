# Multi-stage build
FROM node:18-bookworm as builder

# Install dependencies
RUN apt-get update && \
    apt-get install -y python3 python3-pip ffmpeg && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Final image
FROM node:18-bookworm-slim
WORKDIR /app

COPY --from=builder /app .
COPY --from=builder /usr/bin/ffmpeg /usr/bin/ffmpeg

RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip install -r requirements.txt && \
    rm -rf /var/lib/apt/lists/*

EXPOSE 3000
CMD ["sh", "-c", "npm start"]
