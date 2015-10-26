// Generated on 2015-07-16 using generator-angular-fullstack 2.1.0
'use strict';

module.exports = function (grunt) {
  var localConfig;
  try {
    localConfig = require('./server/config/local.env');
  } catch (e) { localConfig = {};
  }

  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    express: 'grunt-express-server',
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn',
    protractor: 'grunt-protractor-runner',
    buildcontrol: 'grunt-build-control'
  });

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Define the configuration for all the tasks
  grunt.initConfig({

    // Project settings
    pkg: grunt.file.readJSON('package.json'),
    yeoman: {
      // configurable paths
      client: require('./bower.json').appPath || 'client',
      dist: 'dist'
    },
    express: {
      options: {
        port: process.env.PORT || 9000
      },
      dev: {
        options: {
          script: 'server/app.js',
          debug: true
        }
      },
      prod: {
        options: {
          script: 'dist/node/server/app.js'
        }
      }
    },
    open: {
      server: {
        url: 'http://localhost:<%= express.options.port %>'
      }
    },
    watch: {
      injectJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*_test.js',
          '!<%= yeoman.client %>/app/app.js'
        ],
        tasks: ['injector:scripts']
      },
      injectCss: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.css'
        ],
        tasks: ['injector:css']
      },
      wiredep: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      mochaTest: {
        files: ['server/**/*.js'],
        tasks: ['env:test', 'mochaTest:test']
      },
      jscs: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          'server/**/*.js'
        ],
        tasks: ['jscs']
      },
      unitTest: {
        files: [
          'karma.conf.js',
          '<%= yeoman.client %>/{app,components}/**/*.js'
        ],
        tasks: ['karma:debug']
      },
      injectSass: {
        files: ['<%= yeoman.client %>/assets/stylesheets/**/*.scss'],
        tasks: ['injector:sass']
      },
      sass: {
        files: ['<%= yeoman.client %>/assets/stylesheets/**/*.scss'],
        tasks: ['sass', 'autoprefixer']
      },
      babel: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          '!<%= yeoman.client %>/{app,components}/**/*_test.js'
        ],
        tasks: ['babel']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        files: [
          '{.tmp,<%= yeoman.client %>}/{app,components}/**/*.html',
          '{.tmp,<%= yeoman.client %>}/assets/stylesheets/main.css',

          '<%= yeoman.client %>/index.html',

          '.tmp/{app,components}/**/*.js',

          '!{.tmp,<%= yeoman.client %>}{app,components}/**/*_test.js',
          '<%= yeoman.client %>/assets/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}'
        ],
        options: {
          livereload: true
        }
      },
      express: {
        files: [
          'server/**/*.{js,json}'
        ],
        tasks: ['express:dev', 'wait'],
        options: {
          livereload: true,
          nospawn: true //Without this option specified express won't be reloaded
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jscs: {
      options: {
        config: './.jscsrc',
      },
      client: {
        files: {
          src: [
            '<%= yeoman.client %>/{app,components}/**/*.js',
            '!<%= yeoman.client %>/{app,components}/**/*_test.js'
          ]
        },
      },
      server: {
        files: {
          src: [
            'server/**/*.js',
            '!server/**/*.spec.js'
          ]
        },
      },
      test: {
        files: {
          src: [
            '<%= yeoman.client %>/{app,components}/**/*_test.js',
            'server/**/*.spec.js'
          ]
        },
      },
      etc: ['./Gruntfile.js', './karma.conf.js', './protractor.conf.js'],
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [{
          dot: true,
          src: [
            '.tmp',
            '<%= yeoman.dist %>/node/**/*',
            '!<%= yeoman.dist %>/node/Dockerfile'
          ]
        }]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    autoprefixer: {
      options: {
        browsers: ['last 1 version']
      },
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/',
          src: '{,*/}*.css',
          dest: '.tmp/'
        }]
      }
    },

    // Debugging with node inspector
    'node-inspector': {
      custom: {
        options: {
          'web-host': 'localhost',
          'preload': false,
          'hidden': ['node_modules']
        }
      }
    },

    // Use nodemon to run server in debug mode with an initial breakpoint
    nodemon: {
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          watch: ['server'],
          callback: function (nodemon) {
            nodemon.on('log', function (event) {
              console.log(event.colour);
            });

            // opens browser on initial server start
            nodemon.on('config:update', function () {
              setTimeout(function () {
                require('open')('http://localhost:8080/debug?port=5858');
              }, 500);
            });
          }
        }
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      target: {
        src: '<%= yeoman.client %>/index.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: ['/json3/', '/es5-shim/', /font-awesome.css/, /angular-material.css/],
        fileTypes: {
          html: {
            replace: {
              css: '<link rel="stylesheet" href="{{filePath}}">'
            }
          },
        },
      },
      karma: {
        devDependencies: true,
        src: 'karma.conf.js',
        ignorePath: '<%= yeoman.client %>/',
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: '\'<%= yeoman.client %>/{{filePath}}\','
            }
          },
        },
        exclude: [/angular-scenario/]
      },
    },

    // Renames files for browser caching purposes
    rev: {
      dist: {
        files: {
          src: [
            '<%= yeoman.dist %>/node/public/{,*/}*.js',
            '<%= yeoman.dist %>/node/public/{,*/}*.css',
            '<%= yeoman.dist %>/node/public/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
            '<%= yeoman.dist %>/node/public/assets/fonts/*'
          ]
        }
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: ['<%= yeoman.client %>/index.html'],
      options: {
        dest: '<%= yeoman.dist %>/node/public'
      }
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/node/public/{,*/}*.html'],
      css: ['<%= yeoman.dist %>/node/public/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/node/public/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/node/public',
          '<%= yeoman.dist %>/node/public/assets/images'
        ],
        // This is so we update image references in our ng-templates
        patterns: {
          js: [
            [/(assets\/images\/.*?\.(?:gif|jpeg|jpg|png|webp|svg))/gm, 'Update the JS to reference our revved images']
          ]
        }
      }
    },

    // The following *-min tasks produce minified files in the dist folder
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.{png,jpg,jpeg,gif}',
          dest: '<%= yeoman.dist %>/node/public/assets/images'
        }]
      }
    },

    svgmin: {
      dist: {
        files: [{
          expand: true,
          cwd: '<%= yeoman.client %>/assets/images',
          src: '{,*/}*.svg',
          dest: '<%= yeoman.dist %>/public/assets/images'
        }]
      }
    },

    // Allow the use of non-minsafe AngularJS files. Automatically makes it
    // minsafe compatible so Uglify does not destroy the ng references
    ngAnnotate: {
      dist: {
        files: [{
          expand: true,
          cwd: '.tmp/concat',
          src: '**/*.js',
          dest: '.tmp/concat'
        }]
      }
    },

    // Package all the html partials into a single javascript payload
    ngtemplates: {
      options: {
        // This should be the name of your apps angular module
        module: 'learntubeApp',
        htmlmin: {
          collapseBooleanAttributes: true,
          collapseWhitespace: true,
          removeAttributeQuotes: true,
          removeEmptyAttributes: true,
          removeRedundantAttributes: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true
        },
        usemin: 'app/app.js'
      },
      main: {
        cwd: '<%= yeoman.client %>',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/templates.js'
      },
      tmp: {
        cwd: '.tmp',
        src: ['{app,components}/**/*.html'],
        dest: '.tmp/tmp-templates.js'
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/node/public/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/node/public',
          src: [
            '*.{ico,png,txt}',
            '.htaccess',
            'bower_components/**/*',
            'assets/images/{,*/}*.{webp}',
            'assets/fonts/**/*',
            'index.html'
          ]
        }, {
          expand: true,
          cwd: '.tmp/images',
          dest: '<%= yeoman.dist %>/node/public/assets/images',
          src: ['generated/*']
        }, {
          expand: true,
          dest: '<%= yeoman.dist %>/node',
          src: [
            'package.json',
            'server/**/*'
          ]
        }]
      },
      docker: {
        expand: true,
        cwd: 'docker',
        dest: '<%= yeoman.dist %>',
        src: '**',
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.client %>',
        dest: '.tmp/',
        src: ['{app,components}/**/*.css']
      }
    },

    buildcontrol: {
      options: {
        dir: 'dist',
        commit: true,
        push: true,
        connectCommits: false,
        message: 'Built %sourceName% from commit %sourceCommit% on branch %sourceBranch%'
      },
      heroku: {
        options: {
          remote: 'heroku',
          branch: 'master'
        }
      },
      openshift: {
        options: {
          remote: 'openshift',
          branch: 'master'
        }
      },
      aws: {
        options: {
          remote: 'ubuntu@52.5.145.162:git-bare/learntube.git',
          branch: 'master'
        }
      },
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: [
        'babel',
        'sass',
      ],
      test: [
        'babel',
        'sass',
      ],
      debug: {
        tasks: [
          'nodemon',
          'node-inspector'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
      dist: [
        'babel',
        'sass',
        'imagemin',
        'svgmin'
      ]
    },

    // Test settings
    karma: {
      options: {
        configFile: 'karma.conf.js',
        singleRun: true
      },
      debug: {
        reporters: ['spec'],
      },
      coverage: {
        reporters: ['spec', 'coverage'],
      },
    },

    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          timeout: 15000,
        },
        src: ['server/**/*.spec.js'],
      },
    },

    protractor: {
      options: {
        configFile: 'protractor.conf.js'
      },
      chrome: {
        options: {
          args: {
            browser: 'chrome'
          }
        }
      }
    },

    env: {
      test: {
        NODE_ENV: 'test'
      },
      prod: {
        NODE_ENV: 'production'
      },
      all: localConfig
    },

    // Compiles ES6 to JavaScript using Babel
    babel: {
      options: {
        sourceMap: true
      },
      server: {
        files: [{
          expand: true,
          cwd: 'client',
          src: [
            '{app,components}/**/*.js',
            '!{app,components}/**/*_test.js'
          ],
          dest: '.tmp'
        }]
      }
    },

    // Compiles Sass to CSS
    sass: {
      server: {
        options: {
          loadPath: [
            '<%= yeoman.client %>/bower_components',
            '<%= yeoman.client %>/assets/stylesheets'
          ],
          compass: false
        },
        files: {
          '.tmp/assets/stylesheets/main.css': '<%= yeoman.client %>/assets/stylesheets/main.scss'
        }
      }
    },

    injector: {
      options: {

      },
      // Inject application script files into index.html (doesn't include bower)
      scripts: {
        options: {
          transform: function (filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<script src="' + filePath + '"></script>';
          },
          starttag: '<!-- injector:js -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [[
            '.tmp/{app,components}/**/*.js',
            '!{.tmp,<%= yeoman.client %>}/app/app.js',
            '!{.tmp,<%= yeoman.client %>}/{app,components}/**/*_test.js'
          ]]
        }
      },

      // Inject component scss into app.scss
      sass: {
        options: {
          sort: function (a, b) {
            var sortBy = ['/utils/', '/base/', '/blocks/', '/visualization/'];
            var ai, bi;
            ai = bi = -1;

            sortBy.forEach(function (e, i) {
              if (a.indexOf(e) > -1) { ai = i; }
              if (b.indexOf(e) > -1) { bi = i; }
            });

            if (ai > bi) { return 1; }
            if (ai < bi) { return -1; }
            return 0;
          },
          transform: function (filePath) {
            filePath = filePath.replace('/client/assets/stylesheets/', '');
            filePath = filePath.replace(/_|\.scss/g, '');
            return '@import \'' + filePath + '\';';
          },
          starttag: '// injector',
          endtag: '// endinjector'
        },
        files: {
          '<%= yeoman.client %>/assets/stylesheets/main.scss': [
            '<%= yeoman.client %>/assets/stylesheets/**/*.scss',
            '!<%= yeoman.client %>/assets/stylesheets/main.scss'
          ]
        }
      },

      // Inject component css into index.html
      css: {
        options: {
          transform: function (filePath) {
            filePath = filePath.replace('/client/', '');
            filePath = filePath.replace('/.tmp/', '');
            return '<link rel="stylesheet" href="' + filePath + '">';
          },
          starttag: '<!-- injector:css -->',
          endtag: '<!-- endinjector -->'
        },
        files: {
          '<%= yeoman.client %>/index.html': [
            '<%= yeoman.client %>/{app,components}/**/*.css'
          ]
        }
      }
    },

    mocha_istanbul: {
      unit: {
        options: {
          excludes: ['**/*.{spec,mock,integration}.js'],
          reporter: 'spec',
          mask: '**/*.spec.js',
          coverageFolder: 'coverage/server/unit'
        },
        src: 'server'
      },
    },

    apidoc: {
      app: {
        src: 'server/api/',
        dest: 'apidoc/',
        options: {
          debug: true,
          includeFilters: ['.*\.controller\.js$'],
        },
      }
    },

  });

  // Used for delaying livereload until after server has restarted
  grunt.registerTask('wait', function () {
    grunt.log.ok('Waiting for server reload...');

    var done = this.async();

    setTimeout(function () {
      grunt.log.writeln('Done waiting!');
      done();
    }, 1500);
  });

  grunt.registerTask('express-keepalive', 'Keep grunt running', function () {
    this.async();
  });

  grunt.registerTask('watch:nonTest', function () {
    delete grunt.config.data.watch.jscs;
    delete grunt.config.data.watch.unitTest;
    delete grunt.config.data.watch.mochaTest;
    grunt.task.run('watch');
  });

  grunt.registerTask('serve', function (target) {
    if (target === 'dist') {
      return grunt.task.run(['build', 'env:all', 'env:prod', 'express:prod', 'wait', 'open', 'express-keepalive']);
    }

    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'env:all',
      'injector:sass',
      'concurrent:server',
      'injector',
      'wiredep',
      'autoprefixer',
      'express:dev',
      'wait',
      'open',
      'watch:nonTest'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });


  grunt.registerTask('test', function (target, option) {
    if (target === 'server') {
      if (option === 'watch') {
        return grunt.task.run([
          'test:server',
          'watch:mochaTest'
        ]);
      }

      return grunt.task.run([
        'env:all',
        'env:test',
        'mochaTest:test',
      ]);
    } else if (target === 'client') {
      if (option === 'watch') {
        return grunt.task.run([
          'test:client',
          'watch:unitTest'
        ]);
      }

      return grunt.task.run([
        'clean:server',
        'env:all',
        'injector:sass',
        'concurrent:test',
        'injector',
        'autoprefixer',
        'karma:debug'
      ]);
    } else if (target === 'e2e') {
      return grunt.task.run([
        'clean:server',
        'env:all',
        'env:test',
        'injector:sass',
        'concurrent:test',
        'injector',
        'wiredep',
        'autoprefixer',
        'express:dev',
        'protractor'
      ]);
    } else if (target === 'js') {
      if (option === 'watch') {
        return grunt.task.run([
          'jscs',
          'watch:jscs'
        ]);
      }

      return grunt.task.run(['jscs']);
    } else if (target === 'coverage') {
      if (option === 'server') {
        return grunt.task.run([
          'env:all',
          'env:test',
          'mocha_istanbul:unit'
        ]);
      } else if (option === 'client') {
        return grunt.task.run([
          'clean:server',
          'env:all',
          'injector:sass',
          'concurrent:test',
          'injector',
          'autoprefixer',
          'karma:coverage'
        ]);
      }
    } else if (target === 'ci') {
      return grunt.task.run([
        'jscs',
        'test:coverage:server',
        'test:coverage:client'
      ]);
    } else {
      grunt.task.run([
        'jscs',
        'test:server',
        'test:client'
      ]);
    }
  });

  grunt.registerTask('doc', ['apidoc']);

  grunt.registerTask('build', [
    'clean:dist',
    'injector:sass',
    'concurrent:dist',
    'injector',
    'wiredep',
    'useminPrepare',
    'autoprefixer',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:docker',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'rev',
    'usemin'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'buildcontrol:aws'
  ]);

  grunt.registerTask('default', [
    'newer:jscs',
    'build'
  ]);
};
