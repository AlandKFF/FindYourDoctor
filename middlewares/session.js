const session = require('express-session');
const { sequelize } = require('../models');
const SequelizeStore = require('connect-session-sequelize')(session.Store);

const myStore = new SequelizeStore({ db: sequelize });

myStore.sync().catch(err => {
    console.error('Failed to sync session store:', err);
});

const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET || "my secret",
    resave: false,
    saveUninitialized: false,
    store: myStore,
});

/**
 * Middleware to set the logged-in user ID in response locals.
 */
const setLoggedInUser = (req, res, next) => {
    if (req.session && req.session.user_id) {
        res.locals.loggedInUserId = req.session.user_id;
    } else {
        res.locals.loggedInUserId = null;
    }
    next();
};


// const setAdminLoged

module.exports = {
    sessionMiddleware,
    setLoggedInUser,
};