FROM node:20-slim

# Install system dependencies for pentesting tools (minimal set for now)
RUN apt-get update && apt-get install -y \
    git \
    curl \
    nmap \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Default command starts the Temporal worker
CMD ["node", "dist/temporal/worker.js"]
