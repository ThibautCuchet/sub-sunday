const { Client } = require("pg");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const secret = "jjk2OD6T1et6ZRZ1RDaPnvaoyADhwopS5I7NbmMQvFI=";

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

client.connect();

client.query("SELECT user_id, game FROM votes", (err, res) => {
  console.log(res);
});

function getTop(callback) {
  client.query(
    `SELECT channel, game, vote
    FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY channel ORDER BY vote DESC) AS rnk
        FROM (
        SELECT channel, game, COUNT(user_id) as vote FROM votes GROUP BY game, channel 
        ) as y
    ) AS x
    WHERE rnk <= 5`,
    (err, res) => {
      callback(err, res);
    }
  );
}

function sendMessage(channel, votes) {
  let payload = {
    exp: Date.now() + 3600,
    channel_id: `${channel}`,
    pubsub_perms: {
      send: ["broadcast"],
    },
  };
  let token = jwt.sign(payload, secret);
  axios({
    method: "post",
    url: `https://api.twitch.tv/extensions/message/${channel}`,
    data: {
      content_type: "application/json",
      message: JSON.stringify(votes),
      targets: ["broadcast"],
    },
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": "5bvtvvqr57fetu4k6vc5edan5owm21",
    },
  }).catch((e) => console.log(e));
}

module.exports = { getTop, sendMessage };
