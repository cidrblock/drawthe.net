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
    webfont: {
        icons: {
            src: 'build/fonts/azure/enterprise/*.svg',
            dest: 'build/fonts',
        },
        options: {
          engine: 'fontforge',
          font: 'azure-enterprise',
          normalize: true,
          syntax: 'bem',
            templateOptions: {
                classPrefix: ''
            }
        }
    },
    webfont: {
        icons: {
            src: 'build/fonts/cisco/*.svg',
            dest: 'build/fonts',
        },
        options: {
          engine: 'fontforge',
          font: 'cisco',
          normalize: true,
          syntax: 'bem',
            templateOptions: {
                classPrefix: ''
            }
        }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-webfont');
  grunt.registerTask('default', [
    'copy',
    'webfont'
  ]);

};
