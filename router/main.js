module.exports = function(app, db) {
  var sess;

  var findAll = function(colName, callback) {
    db.collection(colName)
      .find()
      .toArray(function(err, docs) {
        if (err) callback(err, null);
        else {
          callback(null, docs);
        }
      });
  };

  var findWithCri = function(colName, criteria, callback) {
    db.collection(colName).findOne(criteria, function(err, docs) {
      if (err) callback(err, null);
      else {
        callback(null, docs);
      }
    });
  };
  app.get("/", function(req, res) {
    sess = req.session;
    if (sess.ssid) res.redirect("/dashboard");
    else res.redirect("/login");

    /*
    sess = req.session;

    if (sess.ssid) {
      findAll("restaurants", function(err, data) {
        if (err) {
          console.log("ERROR : ", err);
        } else {
          //   console.log(data);
          res.render("dashboard.ejs", { user: loginid, c: data });
        }
      });
    } else {
      res.redirect("/login");
    }

    */
  });

  app.get("/register", function(req, res) {
    res.render("register.html");
  });

  app.post("/register", function(req, res) {
    var id = req.body.id;
    var password = req.body.psw;
    let seedData = { id: id, password: password };
    db.collection("users").insertOne(seedData, function(err, docs) {
      if (err) throw err;
      console.log(seedData);
    });

    res.redirect("/");
  });

  //new

  app.get("/new", function(req, res) {
    res.render("new.ejs", { user: sess.ssid });
  });
  app.post("/new", function(req, res) {
    var rid = req.body.exampleFormControlInput1;
    var rname = req.body.exampleFormControlInput2;
    var rborough = req.body.exampleFormControlInput3;
    var rcuisine = req.body.exampleFormControlInput4;
    var rphoto = req.body.exampleFormControlInput5;
    var rphotoType = req.body.exampleFormControlInput6;
    var rowner = req.body.exampleFormControlInput7;

    let seedData = {
      restaurant_id: rid,
      name: rname,
      borough: rborough,
      cuisine: rcuisine,
      photo: rphoto,
      photoType: rphotoType,
      owner: rowner,
      grades: { user: req.body.grades01, grade: req.body.grades02 },
      address: {
        street: req.body.address01,
        zipcode: req.body.address02,
        building: req.body.address03,
        coord: req.body.address04
      }
    };

    db.collection("restaurants").insertOne(seedData, function(err, docs) {
      if (err) throw err;
      console.log("insert  restaurant " + rname);
      res.send("insert ok");
      res.end();
    });
  });

  app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  });

  app.get("/dashboard", function(req, res) {
    // var profile_id = req.query.id;
    // if (!("ssid" in sess)) {

    if (!sess.ssid) {
      res.redirect("/login");
      // res.end();
    } else {
      var loginid = sess.ssid;

      findAll("restaurants", function(err, data) {
        if (err) {
          console.log("ERROR : ", err);
        } else {
          //   console.log(data);
          res.render("dashboard.ejs", { user: loginid, c: data });
        }
      });
    }

    if (req.query.rid) res.redirect("display?rid=" + req.query.rid);
    if (req.query.search) res.redirect("search?st=" + req.query.searchtext);
  });

  app.get("/cc", function(req, res) {
    // findAll("users", function(err, data) {
    //   if (err) {
    //     console.log("ERROR : ", err);
    //   } else {
    //     console.log("result from db is : ", data);
    //     res.json(data);
    //   }
    // });

    let qs = { id: "123" };
    findWithCri("users", qs, function(err, data) {
      if (err) {
        console.log("ERROR : ", err);
      } else {
        console.log("result from db is : ", data);
        res.json(data);
      }
    });
  });

  app.get("/login", function(req, res) {
    // sess = req.session;
    // if (sess.ssid) {
    //   findAll("restaurants", function(err, data) {
    //     if (err) {
    //       console.log("ERROR : ", err);
    //     } else {
    //       //   console.log(data);
    //       res.render("dashboard.ejs", { user: loginid, c: data });
    //     }
    //   });
    // } else {
    //   res.redirect("/login");
    // }
    res.render("login.html");
  });
  app.post("/login", function(req, res) {
    var loginid = req.body.id;
    var password = req.body.password;

    sess = req.session;
    /*
    Perform the login and send a response.
       */

    console.log(loginid + " login with pass " + password);

    let qs = { id: loginid, password: password };
    findWithCri("users", qs, function(err, data) {
      if (err) {
        console.log("ERROR : ", err);
      } else {
        console.log("result from db is : ", data);
        if (!data) {
          console.log("id no exist");
          res.send("invalid password or id no exist");
          res.end();
        } else {
          console.log("login successful");
          sess.ssid = loginid;
          res.redirect("dashboard");
        }
      }
    });

    /*
    db.collection("users")
      .find({ id: loginid })
      .toArray(function(err, docs) {
        if (err) throw err;

        docs.forEach(function(doc) {
          if (doc["password"] == password) {
            console.log("successful");

            db.collection("restaurants")
              .find()
              .toArray(function(err, docs) {
                if (err) throw err;

                res.render("dashboard.ejs", { c: docs });
              });
          } else {
            console.log("invalid credentials");
            res.send("invalid credentials");
          }
        });
      });
*/
    //  res.render("account.html");
  });

  app.get("/display", function(req, res) {
    rid = req.query.rid;
    console.log(rid);

    let qs = { restaurant_id: rid };
    findWithCri("restaurants", qs, function(err, data) {
      if (err) {
        console.log("ERROR : ", err);
      } else {
        console.log("result from db is : ", data);
        res.render("display.ejs", { c: data });
      }
    });

    //data0 = { name: "das", borough: "dsad" };
  });

  app.get("/myrestaurant", function(req, res) {
    var user = sess.ssid;
    var qs = { owner: user };
    console.log(qs);
    var qs2 = { name: "Vella" };
    db.collection("restaurants")
      .find(qs)
      .toArray(function(err, result) {
        if (err) throw err;
        //console.log(result);

        res.render("myrestaurant", { c: result });
      });

    //data0 = { name: "das", borough: "dsad" };
  });

  app.post("/update", function(req, res) {
    var oid = req.body.oid;
    var field = req.body.forchange;
    var value = req.body.changeto;
    //console.log(oid, field, value);

    var seedData = {};
    seedData[field] = value;

    res.json({ hellp: "world" });

    var myquery = { restaurant_id: oid };
    var newvalues = { $set: seedData };
    db.collection("restaurants").updateOne(myquery, newvalues, function(
      err,
      res
    ) {
      if (err) throw err;
      console.log("1 document updated");
      console.res("1 document updated");
    });
  });

  app.get("/delete", function(req, res) {
    var rid = req.query.rid;
    console.log("delete" + rid);
    db.collection("restaurants").deleteOne({ restaurant_id: rid }, function(
      err,
      result
    ) {
      if (err) throw err;
      res.redirect("dashboard");
    });
  });

  app.get("/search", function(req, res) {
    var st = req.query.st;
    console.log(st);
  });
};
