    # backend/Dockerfile
    
    FROM node:20-alpine
    
    # Create app directory
    WORKDIR /usr/src/app
    
    # Install dependencies
    COPY package*.json ./
    RUN npm install
    
    # Copy the source
    COPY . .
    
    # Set environment variables (optional)
    ENV PORT=3001
    
    # Expose port
    EXPOSE 3001
    
    # Run the app
    CMD ["node", "app.js"]