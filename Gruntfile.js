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
          dest: 'public/css',
          ext: '.css'
        }]
      }
    },
    concat: {
      js: {
        src: [
          'node_modules/angular/angular.js',
          'node_modules/angular-ui-mask/dist/mask.js',
          'src/app/dial-across.js'
          ],
        dest: 'public/js/main.js'
      },
      
    },
    uglify: {
      build: {
        files: {
          'public/js/main.min.js': [
            'node_modules/angular/angular.js',
            'node_modules/angular-ui-mask/dist/mask.js',
            'src/app/dial-across.js'
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
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['sass', 'concat', 'uglify']);
};