const { Client } = require("pg");
const jwt = require("jsonwebtoken");

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

function getTop() {
  client.query(
    "SELECT game, COUNT(user_id) as vote FROM votes GROUP BY game ORDER BY vote DESC LIMIT 5",
    (err, res) => {
      console.log(err, res);
      const channels = [...new Set(res.rows.map((i) => i.channel))];
      console.log(channels);
    }
  );
}

function sendMessage(channel) {
  let payload = {
    exp: Date.now() + 3600,
    channel_id: `${channel}`,
    pubsub_perms: {
      send: ["broadcast"],
    },
  };
  let token = jwt.sign(payload, secret);
  console.log(token);
}

module.exports = { getTop };
