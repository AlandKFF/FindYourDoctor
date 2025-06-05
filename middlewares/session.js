const session = require("express-session");
const { sequelize } = require("../models"); // adjust path as needed
const SequelizeStore = require("connect-session-sequelize")(session.Store);

// Create a SequelizeStore instance that points to “sessions” (lowercase, plural)
const store = new SequelizeStore({
  db: sequelize,
  tableName: "sessions",
});

// Sync the session store to ensure the “sessions” table exists
store
  .sync()
  .then(() => {
    console.log("session store synced successfully.");
  })
  .catch((err) => {
    console.error("Failed to sync session store:", err);
  });

// session middleware configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "mySecretKey",
  store: store,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    // secure: process.env.NODE_ENV === 'production',
    // httpOnly: true,
    // sameSite: 'strict',
  },
});

// Middleware to set loggedInUserId in response locals
const setLoggedInUser = (req, res, next) => {
  try {
    console.log('Setting loggedInUserId middleware called.');
    console.log('All session:', req.session); // Log the session object for debugging
    if (req.session && req.session.user) {
      console.log('session user:', req.session.user);
    } else {
      console.log('No user found in session.');
    }
    if (req.session && req.session.user && req.session.user.id) {
      console.log('User ID from session:', req.session.user.id);
      res.locals.loggedInUserId = req.session.user.id;
      console.log('Setting loggedInUserId to:', req.session.user.id);
    } else {
      console.log('No user ID found in session. Setting loggedInUserId to null.');
      res.locals.loggedInUserId = null;
    }
  } catch (error) {
    console.error('Error in setLoggedInUser middleware:', error);
    res.locals.loggedInUserId = null;
  }
  next();
};

// Middleware to ensure the user is an admin
const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin' && req.session.user.status === 'accept') {
    console.log('User is an admin:', req.session.user.email);
    res.locals.isAdmin = true;
    console.log('User is an admin. Proceeding to next middleware.');
    return next();
  }
  console.log('User is not an admin. Redirecting to login.');
  res.locals.isAdmin = false;
  return next();
};

module.exports = {
  sessionMiddleware,
  setLoggedInUser,
  ensureAdmin,
};
