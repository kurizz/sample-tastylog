import passport from "passport";
import { Strategy } from "passport-local";
import MySqlClient from "../database/client.js";
import bcrypt from "bcrypt";
import moment from "moment";

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
    let user;
    let now = new Date();

    try {
      let results = await MySqlClient.executeQuery("SELECT * FROM t_user WHERE email = ?", [username]);

      if (results.length !== 1) {
        return done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています！"));
      }

      user = {
        id: results[0].id,
        name: results[0].name,
        email: results[0].email,
        permissions: [PRIVILEGE.NORMAL]
      };

      let lockExpireTime = moment(results[0].locked).add(appconfig.security.ACCOUNT_LOCK_TIME, "minutes");
      if (
        results[0].locked && moment(now).isSameOrBefore(lockExpireTime)
      ) {
        return done(null, false, req.flash("message", "アカウントがロックされています。"))
      }

      deleteLoginHistory(user.id, appconfig.security.MAX_LOGIN_HISTORY);

      if (!await bcrypt.compare(password, results[0].password)) {
        insertLoginHistory(user.id, now, LOGIN_STATUS.FAILURE);

        let CountFailureHistory = await MySqlClient.executeQuery(
          "SELECT count(*) AS count FROM t_login_history WHERE user_id = ? AND LOGIN >= ? AND status = ?",
          [user.id, moment(now).subtract(appconfig.security.ACCOUNT_LOCK_WINDOW, "minutes").toDate(), LOGIN_STATUS.FAILURE]
        );
        let failureCount = (CountFailureHistory || [])[0].count;
        if (failureCount >= appconfig.security.ACCOUNT_LOCK_THRESHOLD) {
          updateAccountLockedTime(now, user.id)
        }

        return done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています。"));
      }

      insertLoginHistory(user.id, now, LOGIN_STATUS.SUCCESS);
      updateAccountLockedTime(null, user.id)
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

let insertLoginHistory = async (userId, nowDate, loginStatus) => {
  await MySqlClient.executeQuery(
    "INSERT INTO t_login_history (`user_id`, `login`, `status`) VALUES (?, ?, ?)",
    [userId, nowDate, loginStatus]
  );
}

let deleteLoginHistory = async (userId, maxLoginHistory) => {
  await MySqlClient.executeQuery(
    "DELETE FROM t_login_history WHERE user_id = ? AND login <= (SELECT login FROM (SELECT login FROM t_login_history WHERE user_id = ? ORDER BY login DESC LIMIT 1 OFFSET ?) AS tmp)",
    [userId, userId, maxLoginHistory - 1]
  );
}

let updateAccountLockedTime = async (nowDate, userId) => {
  await MySqlClient.executeQuery("UPDATE t_user SET locked = ? WHERE id = ?", [nowDate, userId])
}

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
