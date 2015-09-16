
var gulp        = require ('gulp');
var uglify      = require ('gulp-uglify');
var watch       = require ('gulp-watch');
var htmlreplace = require ('gulp-html-replace');
var source      = require ('vinyl-source-stream');
var browserify  = require ('browserify');
var watchify    = require ('watchify');
var reactify    = require ('reactify');
var streamify   = require ('gulp-streamify');
var clean       = require ('gulp-clean');
var sass        = require ('gulp-sass');
var run         = require ('run-sequence');

var path = {
  HTML         : './src/*.html',
  ENTRY_POINT  : './src/jsx/App.jsx',
  SASS         : 'src/sass/**/*.scss',
  CSS          : 'src/css/**/*',
  JS           : 'src/js/**/*',
  DIST_CSS     : 'dist/src/css/**/*',
  DIST_JS      : 'dist/src/js/**/*',
  DEST         : 'dist',
  DEST_SRC     : 'dist/src',
  DEST_BUILD   : 'dist/build',
  DEST_SRC_JS  : 'dist/src/js',
  DEST_SRC_CSS : 'dist/src/css',
  OUT          : 'js/App.js',
  MINIFIED_OUT : 'js/App.min.js',
};

/*
 *  Cleans the dist/js directory.
 */
gulp.task ('clean-js', function () {
  return gulp.src (path.DIST_JS)
    .pipe (clean ())
    .on ('error', handleError);
});

/*
 *  Cleans the dist/css directory.
 */
gulp.task ('clean-css', function () {
  return gulp.src (path.DIST_CSS)
    .pipe (clean ())
    .on ('error', handleError);
});

/*
 *  Copies src/html files into the dist/ directory.
 */
gulp.task ('clone', function () {
  return gulp.src (path.HTML)
    .pipe (gulp.dest (path.DEST))
    .on('error', handleError);
});

/*
 *  Transforms Sass (foo.scss) files into regular CSS files.
 */
gulp.task ('sass', function () {
  return gulp.src (path.SASS)
    .pipe (sass ().on ('error', sass.logError))
    .on ('error', handleError)
    .pipe (gulp.dest (path.DEST_SRC_CSS))
    .on ('error', handleError);
});

/*
 *  Main development task
 */
gulp.task ('watch', ['sass', 'clone'], function () {
  var watcher  = watchify (browserify ({
    entries   : [path.ENTRY_POINT],
    transform : [reactify],
     /** Tells you the jsx line num instead of the single doc line num **/
    debug     : true,
    fullPaths : true,
    cache: {}, packageCache: {}
  }));

  watch (path.SASS, function () {
    run (['clean-css'], ['sass']);
  });

  watch (path.HTML, function () {
    run (['clone']);
  });

  return watcher.on  ('update', function () {
    run (['clean-js'], function () {
      /** Watches for updates and recompiles into a single js file **/
      watcher.bundle ()
        .on ('error', handleError)
        .pipe (source (path.OUT))
        .on ('error', handleError)
        .pipe (gulp.dest (path.DEST_SRC))
        .on ('error', handleError);

        console.info ("React (JSX) files successfully updated.");
    });
  })
    /** On initial load we will compile all jsx to js **/
    .bundle ()
    .on ('error', handleError)
    .pipe (source(path.OUT))
    .on ('error', handleError)
    .pipe (gulp.dest(path.DEST_SRC))
    .on ('error', handleError);
});

gulp.task ('default', ['watch']);

/*
 *  -- Error Handler
 *  Prevents Gulp from crashing.
 *  Displays errors in console.
 */
function handleError (error) {
  console.log (error.toString ());
}
