import passport from "passport";

let authenticate, authorize;

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

export { initialize, authenticate, authorize };