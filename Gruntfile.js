module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      options: {
          sourceMap: true,
          spawn: false,
          outputStyle: "expanded",
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'src/sass',
          src: ['*.scss'],
          dest: 'build/css',
          ext: '.css'
        }]
      }
    },
    concat: {
      js: {
        src: [
          'node_modules/angular/angular.js',
          'node_modules/angular-ui-mask/dist/mask.js',
          'src/client/main.js'
          ],
        dest: 'build/js/main.js'
      },

    },
    uglify: {
      build: {
        files: {
          'build/js/main.min.js': [
            'node_modules/angular/angular.js',
            'node_modules/angular-ui-mask/dist/mask.js',
            'src/client/main.js'
          ]
        }
      }
    },
    watch: {
      sass: {
        files: [
          'src/sass/**.scss'
        ],
        tasks: ['sass']
      },
    },
    copy: {
      images: {
        files: [
          // includes files within path and its sub-directories
          {expand: true, cwd: 'src/images/', src: ['**'], dest: 'build/images/'},
        ],
      },
    },
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'concat', 'uglify', 'copy:images']);
};
