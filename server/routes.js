/**
 * Main application routes
 */

'use strict';

var errors = require('./components/errors');
var path = require('path');

module.exports = function (app) {

  // Insert routes below
  app.use('/api/users', require('./api/user'));
  app.use('/api/others-notes', require('./api/others-note'));
  app.use('/api/s3', require('./api/s3'));
  app.use('/api/classes', require('./api/class'));
  app.use('/api/lectures', require('./api/lecture'));
  app.use('/api/search', require('./api/search'));
  app.use('/api/tutors', require('./api/tutor'));

  app.use('/auth', require('./auth'));

  // Error handling
  app.use(function (err, req, res, next) { // jscs:ignore disallowUnusedParams
    console.error(err.stack);
    if (err.name.match(/unauthorize/i) || err.message.match(/unauthorize/i)) {
      return res.status(401).json({ message: 'not authorized' });
    }
    return res.status(500).json({ message: 'something went wrong' });
  });

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get(function (req, res) {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
};
