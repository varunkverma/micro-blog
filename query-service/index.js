const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const cors = require("cors");

const app = express();

const posts = {};

app.use(bodyParser.json());
app.use(cors());

const handleEvent = (type, data) => {
  switch (type) {
    case "POST_CREATED": {
      const { id, title } = data;

      posts[id] = { id, title, comments: [] };
      break;
    }
    case "COMMENT_CREATED": {
      const { id, content, status, postId } = data;
      const post = posts[postId];
      post.comments.push({ id, content, status });
      break;
    }
    case "COMMENT_UPDATED": {
      const { id, postId, status, content } = data;

      const post = posts[postId];
      const comment = post.comments.find((comment) => comment.id === id) || {};

      comment.status = status;
      comment.content = content;
      break;
    }
    default:
      console.log(`event of type ${type} not handled`);
  }
};

app.get("/posts", (req, res) => {
  res.send(posts);
});

app.post("/events", (req, res) => {
  const { type, data } = req.body;
  handleEvent(type, data);
  res.send({});
});

app.listen(4002, async () => {
  console.log("query service listening @ 4002");

  try {
    const res = await axios.get("http://event-bus-clusterip-srv:4005/events");

    for (let event of res.data) {
      console.log("Processing event:", event.type);
      handleEvent(event.type, event.data);
    }
  } catch (err) {
    console.log(err.message);
  }
});
