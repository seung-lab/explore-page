var argv = require('yargs').argv,
	gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	stylus = require('gulp-stylus'),
	include = require('gulp-include'),
	browserify = require('browserify'),
	minifyCss = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	rsync = require('gulp-rsync'),
	print = require('gulp-print')
	sourcemaps = require('gulp-sourcemaps'),
	babel = require("gulp-babel"),
	shell = require('gulp-shell'),
	GulpSSH = require('gulp-ssh'),
	//sprite = require('gulp-node-spritesheet'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	gutil = require('gulp-util'),
	babelify = require('babelify');

var fs = require('fs');
var del = require('del');
var path = require('path');
var extend = require('node.extend');

gulp.task('default', ['make']);

gulp.task('make', ['images', 'animations', 'js', 'css', 'jsx' ]);

// gulp.task('sprite', function () {
// 	gulp.src("assets/images/sprite")
// 	 .pipe(sprite({
//         outputCss: 'assets/css/sprite.css',
//         selector: '.sprite',

//         // Optional ImageMagick sampling filter.
//         downsampling: "LanczosSharp",

//         // Output configurations: in this instance to output two sprite sheets,
//         // one for "legacy" (i.e. 72dpi, pixel ratio 1), and "retina" (x2).
//         // These keys (legacy, retina) are completely arbitrary.
//         output: {
//             legacy: {
//                 pixelRatio: 1,
//                 outputImage: 'assets/images/sprite.png',
//                 // Optional path to output image
//                 httpImagePath: '/images/sprite.png'
//             },
//             retina: {
//                 pixelRatio: 2,
//                 outputImage: 'assets/images/sprite@2x.png',
//                 httpImagePath: '/images/sprite@2x.png'
//             }
//         },
        
//         // Allows you to augment your selector names for each image, based on
//         // the bare image "name", or the full image path.
//         resolveImageSelector: function(name, fullpath) {
//             // For example, your files may well already be named with @2x, but
//             // you won't want that included in your CSS selectors.
//             return name.split('@2x').join('');
//         }
//     }))
// 	.pipe(gulp.dest('assets/images/'));
// });

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

gulp.task('js', [ 'jsx' ], function () {
	var b = browserify({
		entries: 'clientjs/main.js',
		//debug: true,
		// defining transforms here will avoid crashing your stream
		transform: [ babelify ],
	});

	return b.bundle()
		.pipe(source('intake.js'))
		.pipe(buffer())
		// .pipe(sourcemaps.init({loadMaps: true}))
		// 	// Add transformation tasks to the pipeline here.
		// 	.pipe(uglify())
		// 	.on('error', gutil.log)
		// .pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./dist/public/js/'));

});

gulp.task('jsx', function () {
	gulp.src('views/components/*')
		.pipe(gulp.dest('build/public/js/components/')) // for direct embedding <% include .... %>

	gulp.src('views/pages/*')
		.pipe(gulp.dest('dist/views/'))
});

gulp.task('css', [ 'sprite' ], function () {
	gulp.src([
		'assets/css/normalize.css',
		'assets/css/*.css',
		'assets/css/main.styl'
	])
		.pipe(concat('all.styl'))
		.pipe(stylus())
		.pipe(autoprefixer({
			browser: "> 1%, last 2 versions, Firefox ESR"
		}))
		.pipe(gulp.dest('dist/public/css/'))

	del([
		'assets/css/sprites/**'
	]);
});

gulp.task('watch', function () {
	gulp.watch([
		'assets/animations/**'
	], [ 'animations' ]);

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

	gulp.watch([
		'components/**',
		'views/**'
	], [ 'jsx' ]);
});