module.exports = function(grunt) {

  grunt.initConfig({
    webfont: {
        icons: {
            src: 'azure/enterprise/*.svg',
            dest: 'build/fonts',
        },
        options: {
          engine: 'fontforge',
          font: 'azure',
          normalize: true,
          syntax: 'bem',
            templateOptions: {
                classPrefix: ''
            }
        }
    },
  });


  grunt.loadNpmTasks('grunt-webfont');
  grunt.registerTask('default', ['webfont']);

};
