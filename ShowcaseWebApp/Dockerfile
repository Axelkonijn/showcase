FROM node:26-alpine
WORKDIR /app

# Install dependencies first (Caching)
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Expose Next.js port
EXPOSE 3000

# We use "dev" here so the "Watch" feature can see changes
CMD ["npm", "run", "dev"]