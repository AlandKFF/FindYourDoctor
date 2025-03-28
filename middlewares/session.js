const session = require('express-session');
const { sequelize } = require('../models'); // adjust path as needed
const SequelizeStore = require('connect-session-sequelize')(session.Store);

// Create a Sequelize Store instance
const store = new SequelizeStore({ db: sequelize, tableName: 'sessions' });

// Sync the session store to ensure the session table exists
store.sync().then(() => {
  console.log('Session store synced successfully.');
}).catch(err => {
  console.error('Failed to sync session store:', err);
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'mySecretKey',
  store: store,
  resave: false,
  saveUninitialized: false,
});

const setLoggedInUser = (req, res, next) => {
  try {
    console.log('Setting loggedInUserId middleware called.');
    console.log('All Session:', req.session); // Log the session object for debugging
    if (req.session && req.session.user) {
      console.log('Session user:', req.session.user);
    } else {
      console.log('No user found in session.');
    }
    // console.log('Session ID:', req.sessionID); // Log the session ID for debugging
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
}

const ensureAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin' && req.session.user.status === 'accept') {
    console.log('User is an admin:', req.session.user.email);
    // Optionally, you can set a flag in locals to indicate admin status
    res.locals.isAdmin = true; 
    // req.locals.ensureAdmin = true;
    console.log('User is an admin. Proceeding to next middleware.');
    return next();
  }
  console.log('User is not an admin. Redirecting to login.');
  res.locals.isAdmin = false; // Set isAdmin to false if not an admin 
  return next();
};

module.exports = {
  sessionMiddleware,
  setLoggedInUser,
  ensureAdmin,
};