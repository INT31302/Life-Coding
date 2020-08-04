//lowdb
const db = require("../lib/db");
const bcrypt = require("bcrypt");

module.exports = (app) => {
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser((user, done) => {
    console.log("serializeUser", user);
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = db.get("users").find({ id: id }).value();
    console.log("deserializeUser", user);
    done(null, user);
  });

  passport.use(
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      console.log("LocalStrategy", email, password);
      const user = db.get("users").find({ email: email }).value();
      if (user) {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) throw err;
          if (result) return done(null, user, { message: "Welcome." });
          else return done(null, false, { message: "Incorrect password." });
        });
      } else return done(null, false, { message: "Incorrect email." });
    })
  );

  return passport;
};
