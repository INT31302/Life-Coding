module.exports = (app) => {
  const passport = require("passport");
  const LocalStrategy = require("passport-local").Strategy;

  app.use(passport.initialize());
  app.use(passport.session());

  const authData = {
    email: "test@test.com",
    password: "1234",
    nickname: "est",
  };
  passport.serializeUser((user, done) => {
    console.log("serializeUser", user);
    done(null, user.email);
  });

  passport.deserializeUser((id, done) => {
    console.log("deserializeUser", id);
    done(null, authData);
  });

  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      (username, password, done) => {
        console.log("LocalStrategy", username, password);
        if (username === authData.email) {
          if (password === authData.password) {
            return done(null, authData, { message: "Welocme." });
          } else return done(null, false, { message: "Incorrect password." });
        } else return done(null, false, { message: "Incorrect username" });
      }
    )
  );

  return passport;
};
