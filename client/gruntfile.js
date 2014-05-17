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
						'src/js/Start.js',
						'src/js/Map.js',
						'src/js/Menu.js',
						'src/js/Game.js'
					]
				}
			}
		},

		// watch
		watch: {
			css: {
				files: 'src/sass/*.scss',
				tasks: ['sass:dev']
			},
			js: {
				files: 'src/js/**/*.js',
				tasks: ['uglify:dev']
			}
		}

	});


	// tasks
	grunt.registerTask('default', ['watch']);
	
};