
var gulp = require ('gulp');
var uglify = require ('gulp-uglify');
var watch = require ('gulp-watch');
var htmlreplace = require ('gulp-html-replace');
var source = require ('vinyl-source-stream');
var browserify = require ('browserify');
var watchify = require ('watchify');
var reactify = require ('reactify');
var streamify = require ('gulp-streamify');
var clean = require ('gulp-clean');
var sass = require ('gulp-sass');
var del = require ('del');
var vinylPaths = require('vinyl-paths');
var run = require ('run-sequence');

var path = {
  HTML         : './src/*.html',
  ENTRY_POINT  : './src/jsx/ReactSlickGrid.jsx',
  DEST_SRC     : 'dist/src',
  OUT          : 'js/ReactSlickGrid.js',
  MINIFIED_OUT : 'js/ReactSlickGrid.min.js',
};

/*
 *  -- Error Handler
 *  Prevents Gulp from crashing.
 *  Displays errors in console.
 */
var handleError = function (error) {
  console.log (error.toString ());
}

gulp.task ('sass', function () {
  run (['sass-development', 'sass-example' ]);
});

gulp.task ('sass-development', function () {
  return gulp.src ('src/sass/**/*.scss')
    .pipe (sass ().on ('error', sass.logError))
    .on ('error', handleError)
    .pipe (gulp.dest ('dist/src/css'))
    .on ('error', handleError);
});

gulp.task ('sass-example', function () {
  return gulp.src ('example/src/**/*.scss')
    .pipe (sass ().on ('error', sass.logError))
    .on ('error', handleError)
    .pipe (gulp.dest ('example/dist'))
    .on ('error', handleError);
});

gulp.task ('clean-css', function () {
  return gulp.src ([
    'dist/src/css/**/*.css',
    'example/dist/**/*.css' ])
  .pipe (vinylPaths (del))
  .on ('error', handleError);
});

gulp.task ('clean-javascript', function () {
  return gulp.src ([
    'dist/src/js/**/*.js',
    'example/dist/**/*.js' ])
  .pipe (vinylPaths (del))
  .on ('error', handleError);
});

gulp.task ('html', function () {
  return gulp.src ('./example/src/*.html')
    .pipe (gulp.dest ('example/dist'))
    .on('error', handleError);
});

gulp.task ('watch-development', ['html', 'sass'], function () {
  var watcher = watchify (browserify ({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    fullPaths: true,
    cache: {},
    packageCache: {}
  }));

  watch ('src/sass/**/*.scss', function () { run (['clean-css'], ['sass']); });
  watch ('./src/*.html', function () { run (['html']); });

  return watcher.on ('update', function () {
    run (['clean-javascript'], function () {
      watcher.bundle ()
        .on ('error', handleError)
        .pipe (source (path.OUT))
        .on ('error', handleError)
        .pipe (gulp.dest ('dist/src'))
        .on ('error', handleError);
    });
  })
  .bundle ()
  .on ('error', handleError)
  .pipe (source(path.OUT))
  .on ('error', handleError)
  .pipe (gulp.des t('dist/src'))
  .on ('error', handleError);
});

gulp.task ('watch-example', ['html', 'sass'], function () {
  var watcher = watchify (browserify ({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    fullPaths: true,
    cache: {},
    packageCache: {}
  }));

  return watcher.on ('update', function () {
    run (['clean-javascript'], function () {
      watcher.bundle ()
        .on ('error', handleError)
        .pipe (source (path.OUT))
        .on ('error', handleError)
        .pipe (gulp.dest (path.DEST_SRC))
        .on ('error', handleError);
    });
  })
  .bundle ()
  .on ('error', handleError)
  .pipe (source(path.OUT))
  .on ('error', handleError)
  .pipe (gulp.dest(path.DEST_SRC))
  .on ('error', handleError);
});

gulp.task ('default', ['watch-development']);
