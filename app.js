const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();
const favicon = require("express-favicon");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(favicon(__dirname + "/favicon/favicon.ico"));

// mongoose connect to mongodb
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.MIKEMONGO2_DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then((con) => {
    console.log(con.connections);
    console.log("DB connection successful.");
  });

// schema --> defines the structure of the document
const blogEntrySchema = new mongoose.Schema({
  post_id: Number,
  title: String,
  content: String,
  date: String,
  img: String,
  comment: Array,
});

// model --> wraps schema and allows CRUD ops with db
const blogEntryModel = mongoose.model(`blog-entries`, blogEntrySchema);
// ----------------------------------------------> must be name of collection! <---------------------------------------------

// top-level/synchronous
// find all blog data
// -------typeof object;
const blogEntries = blogEntryModel
  .find({})
  .then((doc) => {
    console.log(doc);
  })
  .catch((err) => {
    console.error(err);
  });

// const blogEntries = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/blogEntries.json`)
// );

// google-OAuth
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

app.post("/contact", (req, res) => {
  // OAUTH
  const myOAuth2Client = new OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  console.log(`REQUEST.BODY: ${req.body}`);
  console.log(`TYPE OF REQ.BODY.EMAIL: ${typeof req.body.email}`);

  myOAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });

  const myAccessToken = myOAuth2Client.getAccessToken();

  // NODEMAILER
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.MY_EMAIL_ADDRESS,
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
      accessToken: myAccessToken,
    },
  });

  let mailtoMeMailOptions = {
    from: process.env.MY_EMAIL_ADDRESS,
    to: process.env.MY_EMAIL_ADDRESS,
    subject: "Contact Form Message",
    text: `Message from email address: ${req.body.email} ${req.body.firstName} ${req.body.lastName}: ${req.body.message}.`,
  };

  let mailtoSenderMailOptions = {
    from: process.env.MY_EMAIL_ADDRESS,
    to: req.body.email,
    subject: "Thanks for Getting In Touch",
    text: "I have received your message and will be in touch with you shortly.",
  };

  transporter.sendMail(mailtoMeMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  transporter.sendMail(mailtoSenderMailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  transporter.close();

  res.end("submitted");
});

app.post("/blogComment", (req, res) => {
  const date = new Date();
  let time;

  if (date.getMinutes() >= 0 && date.getMinutes() <= 9) {
    time = date.getHours() + ":0" + date.getMinutes();
  } else {
    time = date.getHours() + ":" + date.getMinutes();
  }

  let comment = {
    commentName: req.body.name,
    commentContent: req.body.comment,
    commentDateAndTime: {
      commentYear: date.getFullYear(),
      commentMonth: date.getMonth() + 1,
      commentDate: date.getDate(),
      commentTime: time,
    },
  };

  fs.readFile("./dev-data/blogEntries.json", "utf8", (err, data) => {
    if (err) {
      console.log(err);
    } else {
      let blogEntriesJSObject = JSON.parse(data); // js object

      for (var key in blogEntriesJSObject) {
        var obj = blogEntriesJSObject[key];
        for (var title in obj) {
          if (
            obj.title === req.body.articleTitle &&
            obj.comment.includes(comment) === false
          ) {
            console.log(Array.isArray(obj.comment)); // true

            obj.comment.push(comment);
          }
        }
      }
      const newData = JSON.stringify(blogEntriesJSObject);

      fs.writeFile(
        "./dev-data/blogEntries.json",
        newData,
        "utf-8",
        (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log("file written");
          }
        }
      );
    }
  });

  res.end();
});

app.get("/blogEntries", (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      blogEntries: blogEntries,
    },
  });
});

const port = process.env.PORT;
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

// cors
