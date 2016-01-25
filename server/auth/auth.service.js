'use strict';

var config = require('../config/environment');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var compose = require('composable-middleware');
var User = require('../models/user.model');
var validateJwt = expressJwt({ secret: process.env.SESSION_SECRET });
var validateJwtLoosely = expressJwt({
  secret: process.env.SESSION_SECRET,
  credentialsRequired: false
});

/**
 * Attaches the user object to the request if authenticated
 * Otherwise returns 403
 */
function isAuthenticated() {
  return compose()
    .use(validateJwtFromHeader(true))
    .use(checkAndRefreshToken)
    // Attach user to request
    .use((req, res, next) => {
      User.findById(req.user._id).exec()
      .then((user) => {
        if (!user) { return res.status(401).send('Unauthorized'); }
        req.user = user;
        next();
      })
      .catch(next);
    });
}

function validateJwtFromHeader(isStrict) {
  let validate = isStrict ? validateJwt : validateJwtLoosely;
  return (req, res, next) => {
    if (req.query && req.query.hasOwnProperty('access_token')) {
      req.headers.authorization = 'Bearer ' + req.query.access_token;
    }
    validate(req, res, next);
  };
}

function checkAndRefreshToken(req, res, next) {
  console.log(`Auth] valid user: ${!!req.user}`);
  if (typeof req.user === 'undefined') { return next(); }
  let timegap = Math.floor(Date.now() / 1000) - req.user.iat;

  if (timegap > config.expirationSeconds) {
    let refreshedToken = signToken(req.user._id);
    console.log('Auth] jwt is refreshed');
    res.set('Authorization', 'Bearer ' + refreshedToken);
  }

  next();
}

function getValidatedUser() {
  return compose()
  .use(validateJwtFromHeader(false))
  .use(checkAndRefreshToken)
  .use((req, res, next) => {
    if (typeof req.user === 'undefined') { return next(); }

    User.findById(req.user._id).exec()
    .then((user) => {
      if (!user) { return res.status(401).send('Unauthorized'); }
      req.user = user;
      next();
    })
    .catch(next);
  });
}

/**
 * Checks if the user role meets the minimum requirements of the route
 */
function hasRole(roleRequired) {
  if (!roleRequired) { throw new Error('Required role needs to be set'); }

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config.userRoles.indexOf(req.user.role) >= config.userRoles.indexOf(roleRequired)) {
        next();
      } else {
        res.status(403).send('Forbidden');
      }
    });
}

/**
 * Returns a jwt token signed by the app secret
 */
function signToken(id) {
  return jwt.sign({ _id: id }, process.env.SESSION_SECRET, { expiresIn: '3d' });
}

/**
 * Set token cookie directly for oAuth strategies
 */
function setTokenCookie(req, res) {
  if (!req.user) { return res.status(404).json({ message: 'Something went wrong, please try again.' }); }
  var token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

exports.getValidatedUser = getValidatedUser;
exports.isAuthenticated = isAuthenticated;
exports.hasRole = hasRole;
exports.signToken = signToken;
exports.setTokenCookie = setTokenCookie;
