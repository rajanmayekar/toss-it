module.exports = function (grunt) {
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project configuration.
    grunt.initConfig({
      devserver: {
        app: {
          options: {
            port: 3000,
            base: './app/'
          }
        },
      }
    });

    grunt.registerTask('start', ['devserver:app']);
};
