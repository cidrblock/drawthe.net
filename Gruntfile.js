var pkgjson = require('./package.json');

module.exports = function(grunt) {

  grunt.initConfig({
    copy: {
      dist: {
       files: [{
         expand: true,
         cwd: 'node_modules/d3',
         src: 'build/d3.min.js',
         dest: 'build/js',
         flatten: true
       },{
         expand: true,
         cwd: 'node_modules/js-yaml',
         src: 'dist/js-yaml.min.js',
         dest: 'build/js',
         flatten: true
       }]
     }
   },
    bowercopy: {
        options: {
            // Bower components folder will be removed afterwards
            clean: true
        },
        // Anything can be copied
        test: {
            options: {
                destPrefix: 'build/'
            },
            files: {
                'js/angular.min.js': 'angular/angular.min.js',
                'js/angular-animate.min.js': 'angular-animate/angular-animate.min.js',
                'js/ace.js': 'ace-builds/src-min/ace.js',
                'js/mode-yaml.js': 'ace-builds/src-min/mode-yaml.js',
                'js/ui-ace.min.js': 'angular-ui-ace/ui-ace.min.js',
                'js/ui-bootstrap.min.js': 'angular-bootstrap/ui-bootstrap.min.js',
                'js/ui-bootstrap-tpls.min.js': 'angular-bootstrap/ui-bootstrap-tpls.min.js',
                'js/showdown.js': 'showdown/dist/showdown.min.js',
                'js/showdown-prettify.min.js': 'showdown-prettify/dist/showdown-prettify.min.js',
                'css/bootstrap.min.css': 'bootstrap-css-only/css/bootstrap.min.css',
                'fonts': 'bootstrap-css-only/fonts/*',
                'css/font-awesome.min.css': 'components-font-awesome/css/font-awesome.min.css',
                'fonts': 'components-font-awesome/fonts/*',
            }
        },
      }
  });

  grunt.loadNpmTasks('grunt-bowercopy');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.registerTask('default', [
    'copy',
    'bowercopy'
  ]);

};
