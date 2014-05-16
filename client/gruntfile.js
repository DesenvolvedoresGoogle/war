'use strict';

module.exports = function (grunt) {

	// load all grunt tasks
	require('load-grunt-tasks')(grunt);

	// grunt config
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		// sass files
		sass: {
			dev: {
				options: {
					style: 'expanded',
					debugInfo: true
				},
				files: {
					'css/styles.css': 'src/sass/styles.scss'
				}
			}
		},

		// uglify
		uglify: {
			dev: {
				options: {
					mangle: false,
					compress: false,
					beautify: true,
					preserveComments: 'all'
				},
				files: {
					'js/application.js': [
						'src/js/Main.js'
					]
				}
			}
		},

		// watch
		watch: {
			css: {
				files: '<%= config.dev %>/vendor/sass/*.scss',
				tasks: ['sass:dev']
			},
			js: {
				files: '<%= config.dev %>/vendor/js/**/*.js',
				tasks: ['uglify:dev']
			}
		}

	});


	// tasks
	grunt.registerTask('default', ['watch']);
	
};