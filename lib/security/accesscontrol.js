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
      let transaction = await MySqlClient.beginTransaction();
      let results = await transaction.executeQuery("SELECT * FROM t_user WHERE email = ? FOR UPDATE", [username]);

      if (results.length !== 1) {
        transaction.commit();
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
        transaction.commit();
        return done(null, false, req.flash("message", "アカウントがロックされています。"))
      }

      deleteLoginHistory(transaction, user.id, appconfig.security.MAX_LOGIN_HISTORY);

      if (!await bcrypt.compare(password, results[0].password)) {
        insertLoginHistory(transaction, user.id, now, LOGIN_STATUS.FAILURE);

        let CountFailureHistory = await transaction.executeQuery(
          "SELECT count(*) AS count FROM t_login_history WHERE user_id = ? AND LOGIN >= ? AND status = ?",
          [user.id, moment(now).subtract(appconfig.security.ACCOUNT_LOCK_WINDOW, "minutes").toDate(), LOGIN_STATUS.FAILURE]
        );
        let failureCount = (CountFailureHistory || [])[0].count;
        if (failureCount >= appconfig.security.ACCOUNT_LOCK_THRESHOLD) {
          updateAccountLockedTime(transaction, now, user.id)
        }

        transaction.commit();
        return done(null, false, req.flash("message", "ユーザ名またはパスワードが間違っています。"));
      }

      insertLoginHistory(transaction, user.id, now, LOGIN_STATUS.SUCCESS);
      updateAccountLockedTime(transaction, null, user.id)

      transaction.commit();
    } catch (err) {
      transaction.rollback();
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

let insertLoginHistory = async (transaction, userId, nowDate, loginStatus) => {
  await transaction.executeQuery(
    "INSERT INTO t_login_history (`user_id`, `login`, `status`) VALUES (?, ?, ?)",
    [userId, nowDate, loginStatus]
  );
}

let deleteLoginHistory = async (transaction, userId, maxLoginHistory) => {
  await transaction.executeQuery(
    "DELETE FROM t_login_history WHERE user_id = ? AND login <= (SELECT login FROM (SELECT login FROM t_login_history WHERE user_id = ? ORDER BY login DESC LIMIT 1 OFFSET ?) AS tmp)",
    [userId, userId, maxLoginHistory - 1]
  );
}

let updateAccountLockedTime = async (transaction, nowDate, userId) => {
  await transaction.executeQuery("UPDATE t_user SET locked = ? WHERE id = ?", [nowDate, userId])
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
