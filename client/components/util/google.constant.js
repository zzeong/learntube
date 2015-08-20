'use strict';

angular.module('learntubeApp')
.constant('GoogleConst', {
  oauth: {
    clientId: '877935484479-4a2rea7s7iq416s7liufmj4gj2ubl4ni.apps.googleusercontent.com',
    scope: [
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.upload'
    ],
  },
  browserKey: 'AIzaSyBUuJS30-hhEY8f_kMF3K3rX4qe_bkY3V8',
});
