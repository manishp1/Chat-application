import React, { useEffect, useState, useRef } from "react";
import "./App.css";

function App() {
  // State to hold the chat messages
  const [messages, setMessages] = useState([]);
  // State to hold the input value for sending messages
  const [messageInput, setMessageInput] = useState("");
  // State to hold the WebSocket connection
  const [ws, setWs] = useState(null);
  // Ref to hold the WebSocket connection
  const wsRef = useRef(null);

  // Function to handle changes in the message input field
  const handleMessageInputChange = (e) => {
    setMessageInput(e.target.value);
  };

  // Function to send a message
  const sendMessage = () => {
    // Check if the message input is not empty
    if (
      messageInput.trim() !== "" &&
      wsRef.current &&
      wsRef.current.readyState === WebSocket.OPEN
    ) {
      // Create a message object with text and timestamp
      const message = {
        text: messageInput.trim(),
        timestamp: new Date().toISOString(),
      };
      try {
        // Try sending the message through WebSocket
        wsRef.current.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending message:", error);
        // Handle errors in sending messages, such as displaying an error message to the user
      }
      // Clear the message input field
      setMessageInput("");
    }
  };

  // Effect hook to establish WebSocket connection when the component mounts
  useEffect(() => {
    // Create a new WebSocket instance
    if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
      const newWs = new WebSocket("ws://localhost:8080");
      // Set the WebSocket connection in ref
      wsRef.current = newWs;
      // Set the WebSocket connection state
      setWs(newWs);
      // Log a message when the connection is opened
      newWs.onopen = () => {
        console.log("Connected to server");
      };
      // Process incoming messages from the WebSocket server
      newWs.onmessage = (message) => {
        try {
          // Parse the received message as JSON
          const receivedMessage = JSON.parse(message.data);
          // Update the messages state with the new message
          setMessages((prevMessages) => [...prevMessages, receivedMessage]);
        } catch (error) {
          console.error("Error parsing received message:", error);
          // Handle errors in parsing messages, such as displaying an error message to the user
        }
      };
    }
    // Cleanup function to close the WebSocket connection when the component unmounts
    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, []);

  return (
    <div className="App">
      <div className="chat-container">
        <h1 style={{ textAlign: "center" }}>Talk-To-Me</h1>
        <div className="message-container">
          {/* Render each message */}
          {messages.map((message, index) => (
            <div key={index} className="message">
              <span className="timestamp">{message.timestamp}</span>
              <p>{message.text}</p>
            </div>
          ))}
        </div>
        <div className="input-container">
          {/* Input field for typing messages */}
          <input
            type="text"
            value={messageInput}
            onChange={handleMessageInputChange}
            placeholder="Type your message..."
          />
          {/* Button to send messages */}
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;
