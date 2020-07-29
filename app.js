const express = require("express");
const fs = require("fs");

const app = express();

// top-level/synchronous
const blogEntries = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/blogEntries.json`)
);

app.get("/blogEntries", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      blogEntries: blogEntries,
    },
  });
});

const port = 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
