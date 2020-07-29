const express = require("express");

const app = express();

app.get("/blogEntries", (req, res) => {
  res.end("Hello port 4000");
});

const port = 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
