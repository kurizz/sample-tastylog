import passport from "passport";
import { Strategy } from "passport-local";
import MySqlClient from "../database/client.js";
import bcrypt from "bcrypt";

import appconfig from "../../config/application.config.js";

const PRIVILEGE = {
  NORMAL: "normal"
};

const LOGIN_STATUS = {
  SUCCESS: 0,
  FAILURE: 1
};

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
    let now = new Date();

    try {
      results = await MySqlClient.executeQuery("SELECT * FROM t_user WHERE email = ?", [username]);

      if (results.length !== 1) {
        return done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています！"));
      }

      user = {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        permissions: [PRIVILEGE.NORMAL]
      };
      await MySqlClient.executeQuery(
        "DELETE FROM t_login_history WHERE user_id = ? AND login <= (SELECT login FROM (SELECT login FROM t_login_history WHERE user_id = ? ORDER BY login DESC LIMIT 1 OFFSET ?) AS tmp)",
        [user.id, user.id, appconfig.security.MAX_LOGIN_HISTORY - 1]
      );

      if (!await bcrypt.compare(password, results[0].password)) {
        await MySqlClient.executeQuery(
          "INSERT INTO t_login_history (`user_id`, `login`, `status`) VALUES (?, ?, ?)",
          [user.id, now, LOGIN_STATUS.FAILURE]
        );
        return done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています。"));
      }

      await MySqlClient.executeQuery(
        "INSERT INTO t_login_history (`user_id`, `login`, `status`) VALUES (?, ?, ?)",
        [user.id, now, LOGIN_STATUS.SUCCESS]
      );
    } catch (err) {
      return done(err);
    }

    req.session.regenerate((err) => {
      if (err) {
        done(err);
      } else {
        done(null, user);
      }
    });
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

let authorize = function (privilege) {
  return function (req, res, next) {
    if (req.isAuthenticated() && ((req.user.permissions || []).indexOf(privilege) >= 0)) {
      next();
    } else {
      res.redirect("/account/login");
    }
  };
};

export { initialize, authenticate, authorize, PRIVILEGE };
