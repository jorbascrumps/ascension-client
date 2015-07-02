module.exports = function(grunt) {
    grunt.initConfig({
        "bower-install-simple": {
            options: {
                color: true,
                directory: "bower_components"
            },
            "prod": {
                options: {
                    production: true
                }
            },
            "dev": {
                options: {
                    production: false
                }
            }
        },
        "concat": {
            phaser: {
                files: {
                    'source/script/lib/phaser/phaser.js': ['bower_components/phaser-official/source/phaser.js'],
                    'source/script/lib/phaser/phaser.map': ['bower_components/phaser-official/source/phaser.map']
                }
            },
            requirejs: {
                files: {
                    'source/script/lib/requirejs/require.js': ['bower_components/requirejs/require.js']
                }
            },
            underscore: {
                files: {
                    'source/script/lib/underscore/underscore.js': ['bower_components/underscore/underscore.js'],
                    'public/script/lib/underscore/underscore-min.map': ['bower_components/underscore/underscore-min.map']
                }
            },
            jquery: {
                files: {
                    'source/script/lib/jquery/jquery.js': ['bower_components/jquery/dist/jquery.js']
                }
            }
        },
        "jshint": {
            files: ['Gruntfile.js', 'source/script/app/**/*.js'],
            options: {
                globals: {
                    jQuery: false
                }
            }
        },
        "connect": {
            build: {
                options: {
                    port: 8000,
                    base: 'source',
                    keepalive: true
                }
            },
            deploy: {
                options: {
                    port: 8001,
                    base: 'public',
                    keepalive: true
                }
            }
        },
        "requirejs": {
            compile: {
                options: {
                    dir: "public",
                    appDir: "source",
                    optimize: "uglify",
                    fileExclusionRegExp: /^assets$/ // ignore assets directory, imagemin will handle this instead
                }
            }
        },
        "imagemin": {
            png: {
                options: {
                    optimizationLevel: 7
                },
                files: [
                        {
                        expand: true,
                        cwd: 'source/assets/',
                        src: ['**/*.png'],
                        dest: 'public/assets/',
                        ext: '.png'
                    }
                ]
            },
            jpg: {
                options: {
                    progressive: true
                },
                files: [
                    {
                        expand: true,
                        cwd: 'source/assets/',
                        src: ['**/*.jpg'],
                        dest: 'public/assets/',
                        ext: '.jpg'
                    }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-bower-install-simple");
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-contrib-imagemin');

    // Bower integration
    grunt.registerTask('bower', [
      'bower-install-simple',
      'concat'
    ]);

    // Web Servers
    grunt.registerTask('server-dev', ['connect:build']);
    grunt.registerTask('server-prod', ['connect:deploy']);
    grunt.registerTask('server', ['server-dev']);

    grunt.registerTask('deploy', ['jshint', 'bower', 'requirejs', 'imagemin']);
    grunt.registerTask('default', ['jshint']);
};