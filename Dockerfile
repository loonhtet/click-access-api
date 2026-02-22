FROM node:20-alpine

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Remove dev dependencies after prisma generate
RUN npm prune --omit=dev

EXPOSE 3000

CMD ["node", "src/app.js"]
