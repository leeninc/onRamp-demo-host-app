# Use the official Node.js image as the base image
FROM node:16

# Install Bun globally
RUN npm install -g bun@latest

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb (if available)
COPY package.json bun.lockb ./

# Install dependencies using Bun
RUN bun install

# Copy the rest of your application files
COPY . .

# Define build arguments
ARG ORG_ID
ARG API_KEY

# Set environment variables from build arguments
ENV VITE_REACT_APP_ORG_ID=$ORG_ID
ENV VITE_REACT_APP_API_KEY=$API_KEY

# Build the React application
RUN bun run build

# Expose the desired port (default React app runs on port 3000)
EXPOSE 4173

# Start the React application
CMD ["bun", "run", "preview","--host 0.0.0.0"]
