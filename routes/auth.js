const jwt = require("jsonwebtoken");
const Router = require("express").Router;
const router = new Router();

const User = require("../models/user");
const {SECRET_KEY} = require("../config");
const ExpressError = require("../expressError");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
    try {
      let {username, password} = req.body;
      if (await User.authenticate(username, password)) {
        let token = jwt.sign({username}, SECRET_KEY);
        User.updateLoginTimestamp(username);
        return res.json({token});
      } else {
        throw new ExpressError("Invalid username/password", 400);
      }
    }
  
    catch (err) {
      return next(err);
    }
  });

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
    try {

      let {username, password, first_name, last_name, phone} = req.body;

      let user = await User.register(username, password, first_name, last_name, phone);

      if (user.username) {
        let token = jwt.sign({username: user.username}, SECRET_KEY);
        User.updateLoginTimestamp(user.username);
        return res.json({token});
      } else {
        throw new ExpressError("Error Registering", 400);
      }
    }

    catch (err) {
      return next(err);
    }
  });