var passport = require('passport');
var YoutubeV3Strategy = require('passport-youtube-v3').Strategy



exports.setup = function (User, config) {
passport.use(new YoutubeV3Strategy({
    clientID: config.youtube.clientID,
    clientSecret: config.youtube.clientSecret,
    callbackURL: config.youtube.callbackURL,
    //scope: ['https://www.googleapis.com/auth/youtube.readonly']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({ 'youtube.id': profile.id }, function(err, user) {
      console.log(profile);
      return done(err, user);
    });
  }
));

};
