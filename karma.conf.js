// Karma configuration
// http://karma-runner.github.io/0.10/config/configuration-file.html

module.exports = function (config) {
  config.set({
    // base path, that will be used to resolve files and exclude
    basePath: '',

    // testing framework to use (jasmine/mocha/qunit/...)
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: [
      // bower:js
      'client/bower_components/jquery/dist/jquery.js',
      'client/bower_components/es5-shim/es5-shim.js',
      'client/bower_components/es6-shim/es6-shim.js',
      'client/bower_components/angular/angular.js',
      'client/bower_components/angular-cookies/angular-cookies.js',
      'client/bower_components/angular-file-model/angular-file-model.js',
      'client/bower_components/angular-animate/angular-animate.js',
      'client/bower_components/angular-aria/angular-aria.js',
      'client/bower_components/angular-messages/angular-messages.js',
      'client/bower_components/angular-material/angular-material.js',
      'client/bower_components/angular-resource/angular-resource.js',
      'client/bower_components/angular-sanitize/angular-sanitize.js',
      'client/bower_components/angular-ui-router/release/angular-ui-router.js',
      'client/bower_components/angular-youtube-mb/src/angular-youtube-embed.js',
      'client/bower_components/lodash/lodash.js',
      'client/bower_components/ng-file-upload/ng-file-upload.js',
      'client/bower_components/ngInfiniteScroll/build/ng-infinite-scroll.js',
      'client/bower_components/moment/moment.js',
      'client/bower_components/angular-moment/angular-moment.js',
      'client/bower_components/d3/d3.js',
      'client/bower_components/c3/c3.js',
      'client/bower_components/c3-angular/c3-angular.min.js',
      'client/bower_components/slick-carousel/slick/slick.min.js',
      'client/bower_components/angular-slick/dist/slick.js',
      'client/bower_components/knowbridge-ckeditor/ckeditor.js',
      'client/bower_components/Blob/Blob.js',
      'client/bower_components/angular-mocks/angular-mocks.js',
      // endbower
      'client/app/app.js',
      'client/app/**/*.js',
      'client/components/**/*.js',
      'client/app/**/*.html',
      'client/components/**/*.html'
    ],

    preprocessors: {
      '**/*.html': ['ng-html2js'],
      'client/{app,components}/**/*.js': ['babel'],
      'client/{app,components}/**/!(*test).js': ['coverage']
    },

    ngHtml2JsPreprocessor: {
      stripPrefix: 'client/'
    },

    babelPreprocessor: {
      options: {
        presets: ['es2015'],
        sourceMap: 'inline',
      },
      filename: function (file) {
        return file.originalPath.replace(/\.js$/, '.es5.js');
      },
      sourceFileName: function (file) {
        return file.originalPath;
      }
    },

    coverageReporter: {
      type: 'html',
      dir: 'coverage/client/unit',
      reporters: [{ type: 'lcov', subdir: '.' }]
    },


    // list of files / patterns to exclude
    exclude: [],

    // web server port
    port: 8080,

    // level of logging
    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: false,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
