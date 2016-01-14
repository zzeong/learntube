// Generated on 2015-07-16 using generator-angular-fullstack 2.1.0
'use strict';

module.exports = function (grunt) {
  // Load grunt tasks automatically, when needed
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
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
      lintJS: {
        files: [
          '<%= yeoman.client %>/{app,components}/**/*.js',
          'server/**/*.js'
        ],
        tasks: ['jscs', 'jshint']
      },
      injectSass: {
        files: ['<%= yeoman.client %>/assets/stylesheets/**/*.scss'],
        tasks: ['injector:sass']
      },
      copyComponentsSass: {
        files: ['<%= yeoman.client %>/components/**/*.scss'],
        tasks: ['copy:componentsSass'],
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
      server: {
        files: ['.rebooted'],
        options: { livereload: true }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jscs: {
      options: {
        config: './.jscsrc',
      },
      client: {
        files: {
          src: ['<%= yeoman.client %>/{app,components}/**/*.js']
        },
      },
      server: {
        files: {
          src: ['server/**/*.js']
        },
      },
      etc: ['./Gruntfile.js', './karma.conf.js', './protractor.conf.js'],
    },
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      client: {
        options: { jshintrc: '<%= yeoman.client %>/.jshintrc' },
        src: ['<%= yeoman.client %>/{app,components}/**/*.js']
      },
      server: {
        options: { jshintrc: 'server/.jshintrc' },
        src: ['server/**/*.js']
      },
      etc: {
        src: ['./Gruntfile.js', './karma.conf.js', './protractor.conf.js'],
      },
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

    nodemon: {
      options: { ignore: ['node_modules/**'] },
      preprod: {
        script: 'server/app.js',
        options: {
          watch: [
            'dist/node',
          ],
          cwd: 'dist/node',
          callback: (nodemon) => {
            const open = require('open');
            const fs = require('fs');

            nodemon.on('log', (event) => {
              let logOnlyStatus = event.type === 'status' ? console.log : function () {};
              logOnlyStatus(event.colour);
            });

            nodemon.on('config:update', () => {
              setTimeout(() => {
                open('http://localhost:8080');
              }, 1500);
            });

            nodemon.on('restart', (ev) => {
              setTimeout(() => {
                fs.writeFileSync('.rebooted', 'rebooted');
              }, 1500);
            });
          }
        },
      },
      web: {
        script: 'server/app.js',
        options: {
          watch: [
            'server',
            '!server/worker.js'
          ],
          callback: (nodemon) => {
            const open = require('open');
            const fs = require('fs');

            nodemon.on('log', (event) => {
              let logOnlyStatus = event.type === 'status' ? console.log : function () {};
              logOnlyStatus(event.colour);
            });

            nodemon.on('config:update', () => {
              setTimeout(() => {
                open('http://localhost:9000');
              }, 1500);
            });

            nodemon.on('restart', (ev) => {
              setTimeout(() => {
                fs.writeFileSync('.rebooted', 'rebooted');
              }, 1500);
            });
          }
        },
      },
      worker: {
        script: 'server/worker.js',
        options: {
          watch: [
            'server/components',
            'server/config',
            'server/worker.js',
          ],
          callback: (nodemon) => {
            nodemon.on('log', (event) => {
              let logOnlyStatus = event.type === 'status' ? console.log : function () {};
              logOnlyStatus(event.colour);
            });
          }
        },
      },
      cron: {
        script: 'server/cron.js',
        options: {
          watch: [
            'server/components',
            'server/config',
            'server/cron.js',
          ],
          callback: (nodemon) => {
            nodemon.on('log', (event) => {
              let logOnlyStatus = event.type === 'status' ? console.log : function () {};
              logOnlyStatus(event.colour);
            });
          }
        },
      },
      debug: {
        script: 'server/app.js',
        options: {
          nodeArgs: ['--debug-brk'],
          env: {
            PORT: process.env.PORT || 9000
          },
          watch: [
            'server',
            '!server/worker.js'
          ],
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
      options: {
        exclude: [/json3/, /font-awesome.css/, /angular-material.css/],
      },
      target: {
        src: '<%= yeoman.client %>/index.html',
        ignorePath: '<%= yeoman.client %>/',
        exclude: [/es5-shim/],
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
      },
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/node/<%= yeoman.client %>/!(bower_components){,*/}*.js',
          '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/stylesheets/*.css',
          '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      prod: { src: ['<%= yeoman.client %>/index.html'] },
      preprod: { src: ['<%= yeoman.client %>/index.html'] },
      options: {
        //flow: { steps: { js: ['concat'], css: ['concat'] }, post: {} }, // for preprod, switch comments with below line manually
        flow: { steps: { js: ['concat', 'uglify'], css: ['concat', 'cssmin'] }, post: {} }, // for prod, switch comments with above line manually
        dest: '<%= yeoman.dist %>/node/<%= yeoman.client %>',
      },
    },

    // Performs rewrites based on rev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/node/<%= yeoman.client %>/{,!(bower_components)/**/}*.html'],
      css: ['<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/stylesheets/*.css'],
      js: ['<%= yeoman.dist %>/node/<%= yeoman.client %>/!(bower_components){,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>/node/<%= yeoman.client %>',
          '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/images'
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
          src: '{,*/}*.{png,jpg,jpeg,gif,svg}',
          dest: '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/images'
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

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= yeoman.client %>',
          dest: '<%= yeoman.dist %>/node/<%= yeoman.client %>',
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
          dest: '<%= yeoman.dist %>/node/<%= yeoman.client %>/assets/images',
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
      envProd: {
        src: '.env.prod',
        dest: '<%= yeoman.dist %>/node/.env'
      },
      envPreprod: {
        src: '.env.preprod',
        dest: '<%= yeoman.dist %>/node/.env'
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
      },
      componentsSass: {
        expand: true,
        flatten: true,
        cwd: '<%= yeoman.client %>',
        src: ['components/**/*.scss'],
        dest: '<%= yeoman.client %>/assets/stylesheets/components/',
        rename: function (dest, src) {
          return dest + '_' + src;
        },
      },
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
          remote: 'ubuntu@52.70.85.29:git-bare/learntube.git',
          branch: 'master'
        }
      },
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      dev: {
        tasks: [
          'nodemon:web',
          'nodemon:worker',
          'nodemon:cron',
          'watch:nonTest'
        ],
        options: {
          logConcurrentOutput: true
        }
      },
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
      ]
    },

    // Test settings
    karma: {
      options: {
        configFile: 'karma.conf.js',
      },
      debug: {
        autoWatch: true,
        singleRun: false
      },
      once: {},
      coverage: { reporters: ['coverage'] },
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

    // Overrides .env variables
    env: {
      test: {
        NODE_ENV: 'test',
        MONGO_DBNAME: 'knowbridge-test',
        AWS_S3_BUCKET: 'knowbridge-test',
        SESSION_SECRET: 'test'
      }
    },

    // Compiles ES6 to JavaScript using Babel
    babel: {
      options: {
        sourceMap: true,
        presets: ['es2015'],
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

      // Inject component scss into main.scss
      sass: {
        options: {
          sort: function (a, b) {
            var sortBy = ['/utils/', '/base/', '/blocks/', '/components/', '/visualization/'];
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

    githooks: {
      all: {
        'pre-commit': 'test:js',
        'pre-push': 'test:client test:server',
      }
    },

    shell: {
      encrypt: {
        command: 'tar cvfh encrypt.tar .travis/id_rsa server/config/local.env.js && travis encrypt-file encrypt.tar --add --force'
      },
    },
  });

  grunt.registerTask('watch:nonTest', function () {
    delete grunt.config.data.watch.lintJS;
    delete grunt.config.data.watch.unitTest;
    delete grunt.config.data.watch.mochaTest;
    grunt.task.run('watch');
  });

  grunt.registerTask('injectSass', [
    'copy:componentsSass',
    'injector:sass',
  ]);

  grunt.registerTask('serve', function (target) {
    if (target === 'debug') {
      return grunt.task.run([
        'clean:server',
        'injectSass',
        'concurrent:server',
        'injector',
        'wiredep',
        'autoprefixer',
        'concurrent:debug'
      ]);
    }

    grunt.task.run([
      'clean:server',
      'injectSass',
      'concurrent:server',
      'injector',
      'wiredep',
      'autoprefixer',
      'concurrent:dev'
    ]);
  });

  grunt.registerTask('server', function () {
    grunt.log.warn('The `server` task has been deprecated. Use `grunt serve` to start a server.');
    grunt.task.run(['serve']);
  });

  grunt.registerTask('lintJS', ['jscs', 'jshint']);
  grunt.registerTask('beforeMocha', ['env:test']);

  grunt.registerTask('beforeKarma', [
    'clean:server',
    'injectSass',
    'concurrent:test',
    'injector',
    'autoprefixer'
  ]);

  grunt.registerTask('beforeE2e', [
    'clean:server',
    'env:test',
    'injectSass',
    'concurrent:test',
    'injector',
    'wiredep',
    'autoprefixer',
    'concurrent:dev',
  ]);

  grunt.registerTask('coverage', [
    'beforeMocha',
    'mocha_istanbul:unit',
    'beforeKarma',
    'karma:coverage'
  ]);

  grunt.registerTask('test', (target, option) => {
    option = option || 'normal';

    var taskList = [];
    var tasks = {
      server: {
        before: ['beforeMocha'],
        normal: ['mochaTest:test'],
        watch: ['mochaTest:test', 'watch:mochaTest'],
      },
      client: {
        before: ['beforeKarma'],
        normal: ['karma:once'],
        watch: ['karma:debug'],
      },
      js: {
        normal: ['lintJS'],
        watch: ['lintJS', 'watch:lintJS'],
      },
      ci: {
        before: ['lintJS'],
        normal: ['coverage'],
      },
      e2e: {
        before: ['beforeE2e'],
        normal: ['protractor'],
      },
    };

    taskList = taskList.concat(tasks[target].before || [], tasks[target][option] || []);
    return grunt.task.run(taskList);
  });

  grunt.registerTask('doc', ['apidoc']);

  grunt.registerTask('prebuild', (target) => {
    return grunt.task.run([
      'clean:dist',
      'injectSass',
      'concurrent:dist',
      'injector',
      'wiredep',
      `useminPrepare:${target}`,
      'autoprefixer',
      'ngtemplates',
      'concat',
      'ngAnnotate',
      'copy:docker',
      'copy:dist'
    ]);
  });

  grunt.registerTask('build-debug', [
    'prebuild:preprod',
    'copy:envPreprod',
    'filerev',
    'usemin',
    'nodemon:preprod'
  ]);

  grunt.registerTask('build', [
    'prebuild:prod',
    'copy:envProd',
    'cssmin',
    'uglify',
    'filerev',
    'usemin'
  ]);

  grunt.registerTask('deploy', [
    'build',
    'buildcontrol:aws'
  ]);

  grunt.registerTask('default', [
    'newer:jscs',
    'newer:jshint',
    'build'
  ]);
};
