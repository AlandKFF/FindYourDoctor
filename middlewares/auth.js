// authentication.js

// Middleware to check if user is authenticated
module.exports.ensureAuthenticated = (req, res, next) => {
  console.log('ensureAuthenticated middleware triggered');
  if (req.session) {
    console.log('Session exists:', req.session);
    if (req.session.user) {
      console.log('User is authenticated:', req.session.user);
      return next();
    } else {
      console.log('No user found in session');
    }
  } else {
    console.log('No session found');
  }
  // Redirect to login if not authenticated
  console.log('Redirecting to /login');
  res.redirect('/auth/');
};

// Middleware to check if the user has a specific role
module.exports.ensureRole = (role) => {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    // Forbidden if role doesn't match
    res.status(403).send('Forbidden: Insufficient permissions');
  };
};

// Middleware to check if the user has a specific status
module.exports.ensureStatus = (status) => {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.status === status) {
      return next();
    }
    console.log('User status:', req.session.user.status);
    console.log('Required status:', status);
    console.log('Redirecting to /login due to status mismatch');
    // Forbidden if status doesn't match
    res.status(403).send('Forbidden: Status does not match');
  };
};

// Middleware to check if the user is admin (by role)
// Note: This is similar to ensureRole, consider consolidating if needed.
module.exports.ensureAdmin = (role) => {
  return (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === role) {
      return next();
    }
    // Forbidden if role doesn't match
    res.status(403).send('Forbidden: Insufficient permissions');
  };
};
