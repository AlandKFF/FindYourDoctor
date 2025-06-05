// session.js
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

// … (rest of your setLoggedInUser / ensureAdmin code stays unchanged)
