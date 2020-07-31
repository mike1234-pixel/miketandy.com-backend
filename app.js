// CREATE A CONTACT PAGE AND HANDLE POST REQUESTS
// can just mailto from the server or something...

const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
var cors = require("cors");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post("/contact", (req, res) => {
  // let contactFormPost = {
  //   firstName: req.body.firstName,
  //   lastName: req.body.lastName,
  //   email: req.body.email,
  //   message: req.body.email,
  // };

  console.log("POST REQUEST OCCURRED");
  console.log(req.body);

  res.end("submitted");
});

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
  console.log("GET REQUEST OCCURRED");
});

const port = 4000;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
