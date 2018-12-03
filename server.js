"use strict";

// Imports dependencies and set up http server
const request = require("request"),
  express = require("express"),
  body_parser = require("body-parser"),
  multer = require("multer"),
  app = express(),
  session = require("express-session"),
  upload = multer(), //for parsing multipart/form-data
  port = 1337;

// create application/json parser
const jsonParser = body_parser.json();
// create application/x-www-form-urlencoded parser
const urlencodedParser = body_parser.urlencoded({ extended: false });
app.use(urlencodedParser);

//create session
app.use(session({ secret: "XASDASDA" }));

//connect to mongoDB
const mongodb = require("mongodb");
let uri = "mongodb://dbuser2:a1166540@ds223653.mlab.com:23653/db3t";
var db = null; //global variabel to hold connection
mongodb.MongoClient.connect(
  uri,
  { useNewUrlParser: true },
  function(err, client) {
    if (err) throw err;
    db = client.db("db3t");
    console.log("connected");
    require("./router/main")(app, db);
    // db.listCollections().toArray(function(err, collInfos) {
    //   // collInfos is an array of collection info objects that look like:
    //   // { name: 'test', options: {} }
    //   collInfos.forEach(function(doc) {
    //     console.log(doc);
    //   });
    // });
  }
);

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.engine("html", require("ejs").renderFile);

// Sets server port and logs message on success
app.listen(process.env.PORT || port, () =>
  console.log(`app listening on port ${port}!`)
);

// app.post("/restaurant", upload.array());
