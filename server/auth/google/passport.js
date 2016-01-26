var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var _ = require('lodash');

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  }, (accessToken, refreshToken, params, profile, done) => {
    User.findOne({ 'google.id': profile.id }, (err, user) => {
      if (err) { return done(err); }

      unifyUser(user)
      .then((u) => {
        var google = u.toObject().google;
        google.accessToken = accessToken;
        google.refreshToken = google.refreshToken || refreshToken;
        google.expiryTime = Date.now() + (params.expires_in * 1000);
        u.google = google;
        return u.save();
      })
      .then(done.bind(null, err))
      .catch(done);

      function unifyUser(findedUser) {
        if (_.isNull(findedUser)) {
          if (config.seedWithOAuth) {
            return User.findOne({ email: _.first(profile.emails).value }).exec()
            .then((u) => {
              findedUser = _.isNull(u) ? new User(formUserProps(profile)) : u;
              findedUser.username = profile.username;
              findedUser.google = profile._json;
              return findedUser;
            });
          } else {
            return Promise.resolve(new User(formUserProps(profile)));
          }
        }

        return Promise.resolve(findedUser);
      }
    });
  }));
};

function formUserProps(profile) {
  return {
    name: profile.displayName,
    email: _.first(profile.emails).value,
    role: 'user',
    username: profile.username,
    provider: 'google',
    google: profile._json
  };
}
