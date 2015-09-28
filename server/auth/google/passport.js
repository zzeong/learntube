var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../../config/environment');

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  },
  function (accessToken, refreshToken, profile, done) {
    User.findOne({
      'google.id': profile.id
    }, function (err, user) {
      profile._json.accessToken = accessToken;
      profile._json.refreshToken = refreshToken;

      var userInfo = {
        name: profile.displayName,
        email: profile.emails[0].value,
        role: 'user',
        username: profile.username,
        provider: 'google',
        google: profile._json
      };

      if (!user && !config.seedWithOAuth) {
        user = new User(userInfo);
        user.save(function (err) {
          if (err) { return done(err); }
          done(err, user);
        });
      } else if (!user && config.seedWithOAuth) {
        User.findOne({ email: profile.emails[0].value }).exec()
        .then(function (u) {
          if (!u) {
            user = new User(userInfo);
          } else {
            user = u;
            user.username = profile.username;
            user.google = profile._json;
          }

          user.save(function (err) {
            if (err) { return done(err); }
            done(err, user);
          });
        });
      } else {
        return done(err, user);
      }
    });
  }));
};
