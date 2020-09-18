const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const { getTop, sendMessage, saveVote } = require("./database");

const secret = "jjk2OD6T1et6ZRZ1RDaPnvaoyADhwopS5I7NbmMQvFI=";
const PORT = process.env.PORT || 3001;

const app = express();
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

setInterval(
  () =>
    getTop((err, res) => {
      const channels = [...new Set(res.rows.map((i) => i.channel))];
      channels.forEach((channel) => {
        sendMessage(
          channel,
          res.rows.filter((r) => r.channel === channel)
        );
      });
    }),
  10000
);

app.get("/top/:channel", (req, res) => {
  getTop((err, data) => {
    if (err) res.sendStatus(500);
    res.send(data.rows.filter((r) => r.channel == req.params.channel));
  });
});

app.get("/complete/:text", (req, res) => {
  res.send(
    ["abc", "bca", "cab"].filter((item) => item.startsWith(req.params.text))
  );
});

app.post("/vote", (req, res) => {
  jwt.verify(req.body.token, Buffer.from(secret, "base64"), (err, decoded) => {
    if (err) res.sendStatus(500);
    saveVote(decoded.user_id, req.body.game, decoded.channel_id);
    res.sendStatus(200);
  });
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
