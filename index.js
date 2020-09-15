const express = require("express");
const PORT = process.env.PORT || 3001;
const { getTop, sendMessage } = require("./database");
const app = express();

setInterval(
  () =>
    getTop((err, res) => {
      console.log(err, res);
      const channels = [...new Set(res.rows.map((i) => i.channel))];
      channels.forEach((channel) => {
        sendMessage(
          channel,
          res.rows.filter((r) => r.channel === channel)
        );
      });
      console.log(channels);
    }),
  10000
);

app.get("/top/:channel", (req, res) => {
  getTop((err, data) => {
    res.send(data.rows.filter((r) => r.channel == req.params.channel));
  });
});

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
