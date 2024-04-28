const Router = require("express").Router;
const Message = require("../models/message");
const {ensureLoggedIn, ensureCorrectUser} = require("../middleware/auth");

const router = new Router();


/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in users is either the to or from user.
 *
 **/
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
    try {

        let username = req.user.username;
        let message = await Message.get(req.params.id);

        if (message.from_username === username || message.to_username === username )
        {
            return res.json({message});
        }

        throw new ExpressError("Not Authorized", 401);
    }
    catch (err) {
        return next(err);
    }
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 *
 **/
router.post("/", ensureLoggedIn, async function (req, res, next) {
    try {

        let to_username = req.body.to_username;
        let body = req.body.body;

        let msg = await Message.create({
            from_username: req.user.username,
            to_username,
            body
          });
      
          return res.json({message: msg});
    }
    catch (err) {
        return next(err);
    }
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that the only the intended recipient can mark as read.
 *
 **/
router.post("/:id/read", ensureLoggedIn, async function (req, res, next) {
    try {

        let _message = Message.get(req.params.id);

        if (_message.to_username !== req.user.username){
            throw new ExpressError("Not Authorized", 401);
        }

        let message = await Message.markRead(req.params.id);

        return res.json({message});
    }
    catch (err) {
        return next(err);
    }
});

