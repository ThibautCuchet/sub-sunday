const express = require("express");
const PORT = process.env.PORT || 3001;
const database = require("./database");
const app = express();

setInterval(() => {}, 1000);

app.listen(PORT, () => console.log(`Server started on ${PORT}`));
