var gulp = require ('gulp');
var watch = require ('gulp-watch');
var source = require ('vinyl-source-stream');
var browserify = require ('browserify');
var watchify = require ('watchify');
var reactify = require ('reactify');
var del = require ('del');
var vinylPaths = require('vinyl-paths');
var run = require ('run-sequence');

var path = {
  ENTRY_POINT  : './src/jsx/App.jsx',
  DIST         : 'dist',
  OUT          : 'App.js'
};

/*
 *  -- Error Handler
 *  Prevents Gulp from crashing.
 *  Displays errors in console.
 */
var handleError = function (error) {
  console.log (error.toString ());
};

// copy react-slickgrid css (node_modules DNE on github pages)
gulp.task ('copy-css', function () {
  return gulp.src ('./node_modules/react-slickgrid/dist/css/*.css')
    .pipe (gulp.dest (path.DIST))
    .on ('error', handleError);
});

gulp.task ('watch-development', function () {
  var watcher = watchify (browserify ({
    entries: [path.ENTRY_POINT],
    transform: [reactify],
    debug: true,
    fullPaths: true,
    cache: {},
    packageCache: {}
  }));

  return watcher.on ('update', function () {
    watcher.bundle ()
      .on ('error', handleError)
      .pipe (source (path.OUT))
      .on ('error', handleError)
      .pipe (gulp.dest (path.DIST))
      .on ('error', handleError);
  })
  .bundle ()
  .on ('error', handleError)
  .pipe (source(path.OUT))
  .on ('error', handleError)
  .pipe (gulp.dest (path.DIST))
  .on ('error', handleError);
});

gulp.task ('default', ['copy-css', 'watch-development']);
