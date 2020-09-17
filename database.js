const { Client } = require("pg");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const secret = "jjk2OD6T1et6ZRZ1RDaPnvaoyADhwopS5I7NbmMQvFI=";

const client = new Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgres://pfqhhhtonuabyd:c562a2d74f126fd3a86f4b3e9ec613f08ed5adf9f1c883052421f5e8b3897525@ec2-52-202-198-60.compute-1.amazonaws.com:5432/dbonkjbrkjq1t6",
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
    `SELECT channel, game,  CAST(vote as float) / CAST(total as float) * 100 as percent, vote, total
    FROM (
        SELECT *, ROW_NUMBER() OVER (PARTITION BY channel ORDER BY vote DESC) AS rnk
        FROM (
			SELECT channel, game, COUNT(user_id) as vote, (
				SELECT COUNT(*) 
					FROM votes as b 
					WHERE a.channel = b.channel 
					GROUP BY channel
			) as total 
				FROM votes as a 
				GROUP BY game, channel 
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
    exp: Math.floor(Date.now() / 1000) + 3600,
    channel_id: `${channel}`,
    pubsub_perms: {
      send: ["broadcast"],
    },
    role: "external",
  };
  let token = jwt.sign(payload, Buffer.from(secret, "base64"));
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

function saveVote(user, game, channel) {
  console.log(user, game, channel);
  client.query(
    `INSERT INTO votes (user_id, game, channel)
      VALUES(${user},'${game}', ${channel})
    ON CONFLICT (user_id, channel)
    DO 
    UPDATE
    SET game=EXCLUDED.game`
  );
}

module.exports = { getTop, sendMessage, saveVote };
