"use client";
import { useState, useEffect, useRef } from "react";
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
import Input from "./Input";
import axios from "axios";

const socket = io("http://localhost:8000", {
  transports: ["websocket"],
});

const useStyles = makeStyles((theme) => ({
  chatSection: {
    width: "100%",
    height: "80vh",
    margin: "auto",
    borderRadius: "10px",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  messageArea: {
    height: "70vh",
    overflowY: "auto",
    padding: "20px",
    backgroundColor: "#f5f5f5",
  },
  avatar: {
    backgroundColor: "purple",
    color: "#fff",
  },
  ownMessage: {
    textAlign: "right",
  },
  pinnedDateHeader: {
    position: "sticky",
    top: 0,
    backgroundColor: "#3f51b5",
    color: "#fff",
    padding: "5px",
    zIndex: 10,
    textAlign: "center",
    fontSize: "14px",
  },
  messageDate: {
    padding: "10px",
    textAlign: "center",
    fontSize: "12px",
    color: "#666",
  },
  message: {
    display: "flex",
    alignItems: "center",
  },
  messageText: {
    backgroundColor: "#e1f5fe",
    borderRadius: "10px",
    padding: "10px",
    margin: "5px 0",
    display: "inline-block",
  },
  ownMessageText: {
    backgroundColor: "#bbdefb",
  },
  textField: {
    backgroundColor: "#fff",
    borderRadius: "10px",
  },
  inputArea: {
    padding: "20px",
    backgroundColor: "#fff",
    borderTop: "1px solid #e0e0e0",
  },
}));

const Chat = () => {
  const classes = useStyles();
  const [chatMessages, setChatMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [pinnedDate, setPinnedDate] = useState("");
  const messageAreaRef = useRef(null);
  const usernameObject = JSON.parse(localStorage.getItem("user"));
  const username = usernameObject ? usernameObject.name : null;

  useEffect(() => {
    if (username) {
      getMessages();

      socket.on('message', (msg) => {
        setChatMessages(prevMessages => {
          const newMessages = [...prevMessages, msg];
          return addDisplayDate(newMessages);
        });
      });

      socket.emit('join', username);
    }

    return () => {
      socket.off('message');
    };
  }, [username]);

  const getMessages = () => {
    axios.get("http://localhost:8000/chat/messages")
      .then((response) => {
        const messagesWithDate = addDisplayDate(response.data);
        setChatMessages(messagesWithDate);
      })
      .catch((error) => {
        console.error("Error fetching messages:", error);
      });
  };

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const newMessage = {
      message: message,
      timestamp: new Date().toISOString(),
      user: usernameObject._id,
    };

    socket.emit('message', newMessage);
    setMessage("");

    // Call the getMessages API after sending the message
    getMessages();
  };

  const addDisplayDate = (messages) => {
    let lastDate = null;
    return messages.map(msg => {
      const messageDate = new Date(msg.timestamp).toLocaleDateString();
      const displayDate = messageDate !== lastDate ? messageDate : null;
      lastDate = messageDate;
      return { ...msg, displayDate };
    });
  };

  const handleScroll = () => {
    if (!messageAreaRef.current) return;
    const messages = messageAreaRef.current.getElementsByClassName("message-date");
    const scrollTop = messageAreaRef.current.scrollTop;
    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const offsetTop = message.offsetTop;
      if (scrollTop < offsetTop) {
        setPinnedDate(message.innerText);
        break;
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";

    const initials = name
      .split(" ")
      .map(word => word[0])
      .join("");
    return initials.toUpperCase();
  };

  useEffect(() => {
    if (messageAreaRef.current) {
      messageAreaRef.current.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (messageAreaRef.current) {
        messageAreaRef.current.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  if (!username) {
    return <Input />;
  }

  const sortedMessages = [...chatMessages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  return (
    <div>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={8}>
          <Typography variant="h5" className="header-message" align="center" gutterBottom>
            Chat
          </Typography>
        </Grid>
      </Grid>
      <Grid container component={Paper} className={classes.chatSection}>
        <Grid item xs={12}>
          <div className={classes.pinnedDateHeader}>
            {pinnedDate}
          </div>
          <List className={classes.messageArea} ref={messageAreaRef}>
            {sortedMessages.map((msg, index) => (
              <div key={index}>
                {msg.displayDate && (
                  <div className={`${classes.messageDate} message-date`}>
                    {msg.displayDate === new Date().toLocaleDateString() ? 'Today' :
                      new Date(msg.timestamp).toLocaleDateString() === new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString() ? 'Yesterday' :
                        msg.displayDate}
                  </div>
                )}
                <ListItem className={msg.user[0]?.name === username ? classes.ownMessage : ""}>
                  <Grid container className={classes.message}>
                    <Grid item>
                      <Avatar className={classes.avatar}>
                        {getInitials(msg.user[0]?.name)}
                      </Avatar>
                    </Grid>
                    <Grid item xs>
                      <ListItemText
                        align={msg.user[0]?.name === username ? "right" : "left"}
                        primary={
                          <div className={`${classes.messageText} ${msg.user[0]?.name === username ? classes.ownMessageText : ""}`}>
                            {msg.message}
                          </div>
                        }
                        secondary={new Date(msg.timestamp).toLocaleString()}
                      />
                    </Grid>
                  </Grid>
                </ListItem>
              </div>
            ))}
          </List>
          <Divider />
          <Grid container className={classes.inputArea}>
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
                className={classes.textField}
                variant="outlined"
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
