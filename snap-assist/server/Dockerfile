FROM node:20-alpine

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install all dependencies (including devDependencies for ts-node)
RUN npm install

# Copy source code
COPY . .

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
