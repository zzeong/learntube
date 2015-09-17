var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var config = require('../../config/environment');
var Note = require('../../api/user/note/note.model');
var Promise = require('promise');

var populateNotes = function(user) {
  var bot = {
    'learntubebot01@gmail.com': {
      hash: [
        'ac67da4d3c844e72f0607b0ef4aff541',
        'eb42fc364af000dd9af888532ce63226',
        '4fa0e346807233f7f4c18cb6c35afec1',
        'fe8cf8d21a24376a1263b2267a77c87a'
      ]
    }, 
    'learntubebot02@gmail.com': {
      hash: [
        '2fb8aad5086a0a6fe9967829017fb4c2',
        'a37fa88288dc8e2acfb9d69715131e01',
        '5295158d2070c6d600521c5667dd63b8',
        '4c757fe906a459a8283c830d67466358'
      ]
    }, 
  };

  var createDoc = function(i) {
    var id = {
      playlist: 'PL9B61DEF63FC19BD9',
      video: ['1ZRb1we80kM', 'rJnICByeL8Q']
    };

    return {
      userId: user._id,
      videoId: id.video[parseInt(i / 2)],
      playlistId: id.playlist,
      url : 'https://learntubebucket.s3.amazonaws.com/' + user.email + '/' + bot[user.email].hash[i],
      type: 'editor',
      resourceType: 'text/html',
    }; 
  };

  return new Promise(function(resolve, reject) {
    if(!(user.email in bot)) {
      return reject();
    }

    Note.create(createDoc(0), createDoc(1), createDoc(2), createDoc(3), function(err) {
      if(err) { reject(err); }
      resolve();
    });
  });
};

exports.setup = function (User, config) {
  passport.use(new GoogleStrategy({
      clientID: config.google.clientID,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackURL
    },
    function(accessToken, refreshToken, profile, done) {
      User.findOne({
        'google.id': profile.id
      }, function(err, user) {
        if (!user) {
          profile._json.accessToken = accessToken;
          profile._json.refreshToken = refreshToken;

          user = new User({
            name: profile.displayName,
            email: profile.emails[0].value,
            role: 'user',
            username: profile.username,
            provider: 'google',
            google: profile._json
          });
          user.save(function(err) {
            if (err) return done(err);

            if(config.seedDB) {
              populateNotes(user).then(function() {
                console.log('completed note seeding');
                done(err, user);
              }, function(err) {
                done(err, user);
              });    
            } else {
              done(err, user);
            }
          });
        } else {
          return done(err, user);
        }
      });
    }
  ));
};
