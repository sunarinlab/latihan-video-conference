const express = require("express");
const app = express();
const http = require("http").createServer(app);
const path = require("path");

const PORT = 5000;

app.use(express.static(path.join(__dirname, "../public")));

http.listen(PORT, () => {
  console.log("Listening on port ", PORT);
});
