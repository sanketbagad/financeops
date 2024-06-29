"use client";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import {
  Avatar,
  Divider,
  Fab,
  Grid,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
  Paper,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import axios from "axios";
import Input from "./Input";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
});

const useStyles = makeStyles({
  chatSection: {
    width: "100%",
    height: "80vh",
  },
  messageArea: {
    height: "70vh",
    overflowY: "auto",
  },
  avatar: {
    backgroundColor: "#3f51b5",
    color: "#fff",
  },
  ownMessage: {
    textAlign: "right",
  },
});

const Chat = () => {
  const classes = useStyles();
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [localStorageUpdated, setLocalStorageUpdated] = useState(false); // State to force re-render
  const usernameObject = JSON.parse(localStorage.getItem("user"));
  const username = usernameObject ? usernameObject.name : null;

  // Function to fetch messages
  const getMessages = () => {
    axios.get("http://localhost:8000/chat/messages")
      .then((response) => {
        setChatMessages(response.data);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  useEffect(() => {
    if (username) {
      getMessages(); // Fetch messages initially

      socket.on('message', (msg) => {
        getMessages(); // Fetch messages again when a new message is received
      });

      socket.on('userJoined', (user) => {
        console.log(`${user} has joined.`);
      });

      socket.emit('join', username);
    }

    // Listen for changes in localStorage
    const handleLocalStorageChange = () => {
      setLocalStorageUpdated((prev) => !prev); // Toggle state to force re-render
    };

    window.addEventListener('storage', handleLocalStorageChange);

    return () => {
      socket.off('message');
      socket.off('userJoined');
      window.removeEventListener('storage', handleLocalStorageChange);
    };
  }, [username, localStorageUpdated]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      message: message,
      timestamp: new Date().toISOString(),
      user: usernameObject._id,
    };

    socket.emit('message', newMessage, () => {
      getMessages(); // Fetch messages again after sending a new message
    });
    setMessage("");
  };

  const getInitials = (name) => {
    if (!name) return "U"; // Default to "U" if name is not available

    const initials = name
      .split(" ")
      .map(word => word[0])
      .join("");
    return initials.toUpperCase();
  };

  if (!usernameObject) {
    return <Input />;
  }

  const sortedMessages = [...chatMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div>
      <Grid container>
        <Grid item xs={12}>
          <Typography variant="h5" className="header-message">
            Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={12}>
          <List className={classes.messageArea}>
            {sortedMessages.map((msg, index) => (
              <ListItem key={index} className={msg.user[0]?.name === username ? classes.ownMessage : ""}>
                <Grid container alignItems="center">
                  <Grid item xs={1}>
                    <Avatar className={classes.avatar}>
                      {getInitials(msg.user[0]?.name)}
                    </Avatar>
                  </Grid>
                  <Grid item xs={11}>
                    <ListItemText
                      align={msg.user[0]?.name === username ? "right" : "left"}
                      primary={`${msg.user[0]?.name}: ${msg.message}`}
                      secondary={new Date(msg.timestamp).toLocaleString()}
                    />
                  </Grid>
                </Grid>
              </ListItem>
            ))}
          </List>
          <Divider />
          <Grid container style={{ padding: "20px" }}>
            <Grid item xs={11}>
              <TextField
                id="outlined-basic-email"
                label="Type Something"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage();
                  }
                }}
              />
            </Grid>
            <Grid item xs={1} align="right">
              <Fab color="primary" aria-label="send" onClick={handleSendMessage}>
                📩
              </Fab>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
};

export default Chat;
