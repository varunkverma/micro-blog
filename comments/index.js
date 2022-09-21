const express = require("express");
const bodyParser = require("body-parser");
const { randomBytes } = require("crypto");
const cors = require("cors");
const axios = require("axios");

const commentsByPostId = {};

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.get("/posts/:id/comments", (req, res) => {
  const { id: postId } = req.params || {};
  res.send(commentsByPostId[postId] || []);
});

app.post("/posts/:id/comments", async (req, res) => {
  const commentId = randomBytes(4).toString("hex");
  const { content = "" } = req.body || {};
  const { id: postId } = req.params || {};

  const comments = commentsByPostId[postId] || [];
  0;
  comments.push({ id: commentId, content, status: "PENDING" });

  commentsByPostId[postId] = comments;

  await axios.post("http://event-bus-clusterip-srv:4005/events", {
    type: "COMMENT_CREATED",
    data: {
      id: commentId,
      content,
      postId,
      status: "PENDING",
    },
  });

  res.status(201).send(comments);
});

app.post("/events", async (req, res) => {
  console.log("Received event of type: ", req.body.type);
  const { type, data } = req.body;

  switch (type) {
    case "COMMENT_MODERATED": {
      const { id, status, postId } = data;
      const comments = commentsByPostId[postId] || {};
      comment = comments.find((comment) => comment.id === id) || {};
      comment.status = status;

      await axios
        .post("http://event-bus-clusterip-srv:4005/events", {
          type: "COMMENT_UPDATED",
          data: {
            ...data,
            status,
          },
        })
        .catch((err) => {
          console.log(err);
        });
      break;
    }
    default: {
      console.log(`failted handle ${type} event`);
    }
  }
  res.send({});
});

app.listen(4001, () => {
  console.log("Comment service listening @ 4001");
});
