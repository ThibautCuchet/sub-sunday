const { Client } = require("pg");

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
    }
  );
}

module.exports = { getTop };
