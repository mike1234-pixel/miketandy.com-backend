const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// google-OAuth
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

// top-level/synchronous
const blogEntries = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/blogEntries.json`)
);

app.post("/contact", (req, res) => {
  // OAUTH
  const myOAuth2Client = new OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

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

  let mailOptions = {
    from: process.env.MY_EMAIL_ADDRESS,
    to: process.env.MY_EMAIL_ADDRESS,
    subject: "Contact Form Message",
    text: `Message from email address: ${req.body.email} ${req.body.firstName} ${req.body.lastName}: ${req.body.message}.`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });

  transporter.close();

  res.end("submitted");
});

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
