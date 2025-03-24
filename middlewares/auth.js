const {User} = require('../models')


const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user_id) {
    return next();
  }
  res.redirect('/');
};

const isAuthenticatedAdmin = (req, res, next) => {
  if (req.session && req.session.user_id) {
    User.findOne({where:{id: req.session.User.user_id}})
    return next();
  }
  res.redirect('/');
};

module.exports = { isAuthenticated, isAuthenticatedAdmin };
