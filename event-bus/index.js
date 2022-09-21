const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());

const events = [];

app.post("/events", (req, res) => {
  const event = req.body;

  events.push(event);

  axios.post("http://posts-clusterip-srv:4000/events", event).catch((err) => {
    console.log("error emitting event to port 4000", err);
  });
  axios
    .post("http://comments-clusterip-srv:4001/events", event)
    .catch((err) => {
      console.log("error emitting event to port 4001", err);
    });
  axios.post("http://query-clusterip-srv:4002/events", event).catch((err) => {
    console.log("error emitting event to port 4002", err);
  });
  axios
    .post("http://moderation-clusterip-srv:4003/events", event)
    .catch((err) => {
      console.log("error emitting event to port 4003", err);
    });

  res.send({
    status: "ok",
  });
});

app.get("/events", (req, res) => {
  res.send(events);
});

app.listen(4005, () => {
  console.log("event-bus listening @ 4005");
});
