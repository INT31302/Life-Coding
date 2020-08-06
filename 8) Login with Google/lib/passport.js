//lowdb
const db = require("../lib/db");
const bcrypt = require("bcrypt");
const shortid = require("shortid");

module.exports = (app) => {
  const passport = require("passport"),
    LocalStrategy = require("passport-local").Strategy,
    GoogleStategy = require("passport-google-oauth").OAuth2Strategy;

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

  const googleCredentials = require("../config/google.json");
  console.log(googleCredentials);
  passport.use(
    new GoogleStategy(
      {
        clientID: googleCredentials.web.client_id,
        clientSecret: googleCredentials.web.client_secret,
        callbackURL: googleCredentials.web.redirect_uris[0],
      },
      (accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        let user = db.get("users").find({ email: email }).value();
        if (user) {
          user.googleId = profile.id;
          db.get("users").find({ id: user.id }).assign(user).write();
        } else {
          user = {
            id: shortid.generate(),
            email: email,
            displayName: profile.displayName,
            googleId: profile.id,
          };
          db.get("users").push(user).write();
        }

        done(null, user);
      }
    )
  );
  return passport;
};
