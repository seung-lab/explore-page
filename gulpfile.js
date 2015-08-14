var argv = require('yargs').argv,
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus'),
	include = require('gulp-include'),
	minifyCss = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	rsync = require('gulp-rsync'),
	print = require('gulp-print')
	sourcemaps = require('gulp-sourcemaps'),
	babel = require("gulp-babel"),
	shell = require('gulp-shell'),
	GulpSSH = require('gulp-ssh');

var fs = require('fs');
var del = require('del');
var path = require('path');
var extend = require('node.extend');

gulp.task('default', ['make']);

gulp.task('make', ['images', 'js', 'css', 'jsx' ]);

gulp.task('images', function () {
	gulp
		.src('assets/images/**')
		.pipe(gulp.dest('build/public/images/'))
});

gulp.task('clean', function () {
	del([
		'build/**'
	]);
});

gulp.task('js', function () {
	gulp.src([
		'assets/js/zepto.js',
		'assets/js/*'
	])
		.pipe(concat('all.js'))
		.pipe(gulp.dest('build/public/js/'));
});

gulp.task('jsx', function () {
	gulp.src('views/components/*')
		.pipe(include())
		.pipe(babel())
		.pipe(gulp.dest('build/public/components/')) // for script tag src
		.pipe(gulp.dest('build/views/components/')); // for direct embedding <% include .... %>

	gulp.src('views/pages/*')
		.pipe(gulp.dest('build/views/'))
});

gulp.task('css', function () {
	gulp.src([
		'assets/css/normalize.css',
		'assets/css/*.css',
		'assets/css/mixins.styl',
		'assets/css/*.styl'
	])
		.pipe(concat('all.styl'))
		.pipe(stylus())
		.pipe(autoprefixer({
			browser: "> 1%, last 2 versions, Firefox ESR"
		}))
		.pipe(gulp.dest('build/public/css/'))
});

gulp.task('watch', function () {
	gulp.watch([
		'assets/css/*'
	], [ 'css' ]);

	gulp.watch([
		'assets/images/**'
	], [ 'images' ]);

	gulp.watch([
		'assets/js/*'
	], [ 'js' ]);

	gulp.watch([
		'views/**'
	], [ 'jsx' ]);
});