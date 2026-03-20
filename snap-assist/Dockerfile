FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package descriptors for both client and server to leverage Docker caching
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies for both (including devDependencies for ts-node build)
RUN cd client && npm install
RUN cd server && npm install

# Copy source code
COPY client/ ./client/
COPY server/ ./server/

# Build the client
RUN cd client && npm run build

# Start the server
WORKDIR /app/server
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
