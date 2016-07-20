var argv = require('yargs').argv,
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus'),
	replace = require('gulp-replace'),
	include = require('gulp-include'),
	browserify = require('browserify'),
	watchify = require('watchify'),
	cssnano = require('gulp-cssnano'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	babel = require("gulp-babel"),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	babelify = require('babelify');

var fs = require('fs');
var del = require('del');
var path = require('path');
var extend = require('node.extend');

var BASEURL = argv.production 
	? 'http://eyewire.org/explore'
	: '';

if (argv.baseurl) {
	BASEURL = argv.baseurl;
}

var watch = false;

gulp.task('default', ['make']);

gulp.task('make', [ 'images', 'animations', 'js', 'css', 'fonts' ]);

gulp.task('images', [ ], function () {
	gulp
		.src('assets/images/**')
		.pipe(gulp.dest('dist/public/images/'));

	gulp
		.src('assets/favicon*')
		.pipe(gulp.dest('dist/public/'));
});

gulp.task('animations', function () {
	gulp
		.src('assets/animations/**')
		.pipe(gulp.dest('dist/public/animations/'));
});

gulp.task('clean', function () {
	del([
		'build/**',
		'dist/**'
	]);
});





function browserifyJS () {
	var b = browserify({
		entries: 'clientjs/main.js',
		//debug: true,
		// defining transforms here will avoid crashing your stream
		transform: [ babelify ],
	});

	if (watch) {
		b = watchify(b);
	}

	var stream = b.bundle()
		.pipe(source('intake.min.js'))
		.pipe(buffer())
		.pipe(replace(/__BASE_URL/g, `'${BASEURL}'`));

	if (argv.production) {
		stream
			.pipe(sourcemaps.init())
				.pipe(uglify())
			.pipe(sourcemaps.write('./'))
	}

	return stream
		.pipe(gulp.dest('./dist/public/js/'));
}

gulp.task('js', browserifyJS);

gulp.task('css', [ ], function () {
	var stream = gulp.src([
		'assets/css/normalize.css',
		'assets/css/*.css',
		'assets/css/main.styl'
	])
		.pipe(concat('all.styl'))
		.pipe(stylus())
		.pipe(replace(/\$GULP_BASE_URL/g, BASEURL))
		.pipe(autoprefixer({
			browser: "> 1%, last 2 versions, Firefox ESR"
		}))

	if (argv.production) {
		stream.pipe(cssnano());
	}
		
	return stream.pipe(gulp.dest('dist/public/css/'))

	// del([
	// 	'assets/css/sprites/**'
	// ]);
});

gulp.task('fonts', function () {
	gulp.src([
		'assets/fonts/**'
	])
		.pipe(gulp.dest('dist/public/fonts/'))
})

gulp.task('browserify-watch', function () {
	watch = true;
	return browserifyJS();
});

gulp.task('watch', [ 'browserify-watch' ], function () {
	gulp.watch([
		'assets/animations/**'
	], [ 'animations' ]);

	gulp.watch([
		'assets/fonts/**'
	], [ 'fonts' ]);

	gulp.watch([
		'assets/css/*'
	], [ 'css' ]);

	gulp.watch([
		'assets/images/**'
	], [ 'images' ]);

	gulp.watch([
		'clientjs/**',
		'components/**'
	], [ 'js' ]);
});
