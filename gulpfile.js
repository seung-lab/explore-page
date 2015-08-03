var argv = require('yargs').argv,
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus'),
	minifyCss = require('gulp-minify-css'),
	rsync = require('gulp-rsync'),
	print = require('gulp-print')
	sourcemaps = require('gulp-sourcemaps'),
	babel = require("gulp-babel"),
	shell = require('gulp-shell'),
	GulpSSH = require('gulp-ssh');

var fs = require('fs');
var path = require('path');
var extend = require('node.extend');

gulp.task('make', ['js', 'css'], function () {}); 

gulp.task('js', function () {
	gulp.src([
		'assets/js/jquery-2.1.4.js',
		'assets/js/*',
	])
		.pipe(babel())
		.pipe(concat('all.js'))
		.pipe(gulp.dest('public/js/'))
});

gulp.task('css', function () {
	gulp.src([
		'assets/css/normalize.css',
		'assets/css/*.css',
		'assets/css/*.styl'
	])
		.pipe(concat('all.styl'))
		.pipe(stylus())
		.pipe(gulp.dest('public/css/'))
});