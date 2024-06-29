FROM node:20.14.0

# Create a working directory
WORKDIR /app

# Install dependencies for both client and server
COPY client/package.json /app/client/
COPY server/package.json /app/server/

# Install dependencies
RUN cd /app/client && npm install --force
RUN cd /app/server && npm install --force

# Copy the client and server folders to the working directory
COPY client /app/client
COPY server /app/server

# Install concurrently to run both client and server together
RUN npm install -g concurrently

# Expose ports for the server and client
EXPOSE 8000
EXPOSE 3000

# Start both client and server using concurrently
CMD concurrently "npm run --prefix /app/server start" "npm run --prefix /app/client dev"
