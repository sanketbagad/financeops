"use client";
import { useState } from "react";
import { TextField, Button, Grid } from "@mui/material";
import axios from "axios";

const Input = () => {
  const [username, setUsername] = useState("");

  const handleSetUsername = () => {
    if (username.trim() !== "") {
      axios
        .post("http://localhost:8000/chat/user", { name: username })
        .then((res) => {
          localStorage.setItem("user", JSON.stringify(res.data)); // Store the object as a JSON string
          window.location.reload();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };
  

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={8}>
        <TextField
          label="Enter your username"
          fullWidth
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleSetUsername();
            }
          }}
        />
      </Grid>
      <Grid item xs={4}>
        <Button variant="contained" color="primary" onClick={handleSetUsername}>
          Set Username
        </Button>
      </Grid>
    </Grid>
  );
};

export default Input;
