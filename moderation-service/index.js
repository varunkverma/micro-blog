const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const app = express();

app.use(bodyParser.json());

app.post("/events", async (req, res) => {
  const { type, data } = req.body;
  switch (type) {
    case "COMMENT_CREATED": {
      const status = data.content.includes("orange") ? "REJECTED" : "APPROVED";

      await axios.post("http://event-bus-clusterip-srv:4005/events", {
        type: "COMMENT_MODERATED",
        data: {
          ...data,
          status,
        },
      });
      break;
    }
    default: {
      console.log(`failed to handle ${type} event`);
    }
  }

  res.send({});
});

app.listen(4003, () => {
  console.log("moderation service listening @ 4003");
});
