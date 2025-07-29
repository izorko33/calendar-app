FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build Prisma client
RUN npx prisma generate

# Expose port
EXPOSE 4000

# Run the app
CMD ["npx", "ts-node-dev", "src/index.ts"]