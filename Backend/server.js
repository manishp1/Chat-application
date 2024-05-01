const express = require("express");
const app = express();
const http = require("http");
const WebSocket = require("ws");
const { Readable, Writable } = require("stream");
const PORT = 8080;

const server = http.createServer(app);
const wsServer = new WebSocket.Server({ server });

// Readable stream to handle incoming messages from WebSocket
class IncomingMessageStream extends Readable {
  constructor(ws) {
    super();
    this.ws = ws;
    // Push received messages to the readable stream
    this.ws.on("message", (message) => {
      this.push(message);
    });
  }
  _read() {}
}

// Writable stream to handle outgoing messages to WebSocket clients
class OutgoingMessageStream extends Writable {
  constructor(wsServer) {
    super();
    this.wsServer = wsServer;
  }
  _write(chunk, encoding, callback) {
    // Broadcast the received message to all WebSocket clients except the sender
    this.wsServer.clients.forEach((client) => {
      if (client !== this.ws && client.readyState === WebSocket.OPEN) {
        client.send(chunk.toString(), (error) => {
          if (error) {
            console.error("Error sending message:", error);
          }
        });
      }
    });
    callback();
  }
}

// Event listener for new WebSocket connections
wsServer.on("connection", (socket) => {
  const incomingStream = new IncomingMessageStream(socket);
  const outgoingStream = new OutgoingMessageStream(wsServer);
  // Pipe incoming messages from client to outgoing stream (broadcast to all clients)
  incomingStream.pipe(outgoingStream);
  // Event listener for WebSocket errors
  socket.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Event listener for server errors
server.on("error", (error) => {
  console.error("Server error:", error);
});

// Start the HTTP server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
