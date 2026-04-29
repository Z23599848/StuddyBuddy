# Base image to use
FROM node:22-alpine

# Set a working directory
WORKDIR /src

# Copy project configuration and install dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Expose our application port (3000)
EXPOSE 3000

CMD ["npm", "start"]

