import passport from "passport";
import { Strategy } from "passport-local";
import MySqlClient from "../database/client.js";

const PRIVILEGE = {
  NORMAL: "normal"
};

let authorize;

passport.serializeUser((user, done) => {
  done(null, user);
})

passport.deserializeUser((user, done) => {
  done(null, user);
})

passport.use(
  "local-strategy",
  new Strategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true,
  }, async (req, username, password, done) => {
    let results, user;
    try {
      results = await MySqlClient.executeQuery("SELECT * FROM t_user WHERE email = ?", [username]);
    } catch (err) {
      return done(err);
    }
    if (results.length === 1 && password === results[0].password) {
      user = {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        permissions: [PRIVILEGE.NORMAL]
      };
      req.session.regenerate((err) => {
        if (err) {
          done(err);
        } else {
          done(null, user);
        }
      });
    } else {
      done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています。"));
    }
  })
);

let initialize = function () {
  return [
    passport.initialize(),
    passport.session(),
    function (req, res, next) {
      if (req.user) {
        res.locals.user = req.user;
      }
      next();
    }
  ];
};

let authenticate = function () {
  return passport.authenticate(
    "local-strategy",
    {
      successRedirect: "/account",
      failureRedirect: "/account/login"
    }
  );
};

export { initialize, authenticate, authorize, PRIVILEGE };
