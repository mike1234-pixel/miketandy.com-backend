const express = require("express");
const fs = require("fs");
var cors = require("cors");

// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

const app = express();
app.use(cors());

// dotenv.config({ path: "./config.env" });

// const DB = process.env.DATABASE.replace(
//   "<PASSWORD>",
//   process.env.DATABASE_PASSWORD
// );

// // connection to mongodb successful, now need to read the collection and save it in blogEntries var to send the data back to react
// mongoose
//   .connect(DB, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useFindAndModify: false,
//     useUnifiedTopology: true,
//   })
//   .then((con) => {
//     console.log(con.connections);
//     console.log("DB connection successful.");
//   });

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
