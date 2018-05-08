// Grab gulp package
var gulp = require('gulp'); // standard
var header = require('gulp-header'); // standard
var runSequence = require('run-sequence');
var notify = require('gulp-notify'); // Notifications
var insert = require('gulp-insert'); // Wrap file in get_header and get_footer
var replace = require('gulp-replace'); // replace text in file
var rename = require('gulp-rename');
var htmlsplit = require('gulp-htmlsplit'); // Split html with Header and Footer

var pkg = require('./package.json');
var banner = [
  '/*',
  'Theme Name: <%= pkg.name %>',
  'Theme URI: -',
  'Author: <%= pkg.author %>',
  'Author URI: -',
  'Description: <%= pkg.description %>',
  'Version: <%= pkg.version %>',
  '*/',
  ''
].join('\n');

// Create default style.css as required by WordPress
gulp.task('create-stylecss', function() {
  return gulp
    .src('./src/style.css')
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('../wordpress'));
});

//   // Do stuff after 'create-stylecss' is done
//   gulp.task('replace', function(){

//   // Replace TEMPLATENAME with actuall template name
//   gulp.src(['./src/functions.php'])
//   .pipe(replace('TEMPLATENAME', pkg.name))
//   .pipe(gulp.dest('../wordpress'));

//   return gulp.src(['../html/dist/*.pug'])
//   // Add get_template_directory_uri to links - TODO prevent doubling up when running script twice
//   .pipe(replace('assets/', '<?php echo get_template_directory_uri(); ?>/assets/'))
//   .pipe(replace('scripts/', '<?php echo get_template_directory_uri(); ?>/scripts/'))

//   // Change styles/main.css path to css/main.css and add version numbering
//   .pipe(replace('styles/main.css', '<?php echo get_template_directory_uri()."/css/main.css?v=".filemtime( get_template_directory()."/css/main.css");?>'))

//   // Add wp_head and wp_footer
//   .pipe(replace(/<title>.{0,}<\/title>/, '<title><?php wp_title(); ?></title>'))
//   .pipe(replace('</head>', '<?php wp_head(); ?> ' + '\n' + '  </head>'))
//   .pipe(replace('</body>', '<?php wp_footer(); ?> ' + '\n' + ' </body>'))
//   // Console Message
//   .pipe(notify("<%= file.relative %> is now completely changed!"))
//   .pipe(gulp.dest('../html/dist'));
// });

// Split index.html into[ Header.php, Footer.php, Index.php ]
gulp.task('build-prod', function() {
  return (
    gulp
      .src('../html/*.html')
      .pipe(htmlsplit())
      .pipe(gulp.dest('../wordpress'))
      // Console Message
      .pipe(notify('<%= file.relative %> is now located in the Wordpress folder!'))
  );
});

gulp.task('replace', function() {
  // Replace TEMPLATENAME with actual template name
  gulp
    .src(['./src/functions.php'])
    .pipe(replace('TEMPLATENAME', pkg.name))
    .pipe(gulp.dest('../wordpress'));

  return (
    gulp
      .src(['../wordpress/*.php', '!../wordpress/functions.php'])
      // Add get_template_directory_uri to links
      .pipe(replace('src="assets/', 'src="<?php echo get_template_directory_uri(); ?>/assets/'))
      .pipe(replace('src="scripts', 'src="<?php echo get_template_directory_uri(); ?>/scripts'))
      .pipe(replace('href="scripts', 'href="<?php echo get_template_directory_uri(); ?>/scripts'))

      // Change styles/main.css path to css/main.css and add version numbering
      .pipe(
        replace(
          'styles/main.css',
          "<?php echo get_template_directory_uri().'/css/main.css?v='.filemtime( get_template_directory().'/css/main.css');?>"
        )
      )

      // Add wp_head and wp_footer
      .pipe(replace(/<title>.{0,}<\/title>/, '<title><?php wp_title(); ?></title>'))
      .pipe(replace('</head>', '<?php wp_head(); ?> ' + '\n' + '  </head>'))
      // Console Message
      .pipe(notify('<%= file.relative %> is now completely changed!'))
      .pipe(gulp.dest('../wordpress'))
  );
});

gulp.task('clean-up', function() {
  gulp
    .src(['../wordpress/header.php'])
    .pipe(replace('</body>', ''))
    .pipe(replace('</html>', ''))
    .pipe(gulp.dest('../wordpress'));

  return gulp
    .src(['../wordpress/footer.php'])
    .pipe(insert.append('\n' + '<?php wp_footer(); ?> ' + '\n' + ' </body> ' + '\n' + '</html>'))
    .pipe(gulp.dest('../wordpress'));
});

// Do stuff after 'templates' is done
gulp.task('copy-files', function() {
  // Get css from Automating Template
  gulp
    .src(['./src/**/*', '!./src/style.css', '!./src/functions.php'])
    .pipe(gulp.dest('../wordpress'));
  // Get files from dist (fonts, images, scripts)
  gulp
    .src([
      '../html/dist/**/*',
      '!../html/dist/*.html',
      '!../html/dist/*.pug',
      '!../html/dist/styles/**/*.css'
    ])
    .pipe(gulp.dest('../wordpress'));
});

gulp.task('finish', function() {
  // Console Message
  return gulp
    .src(['../wordpress'])
    .pipe(notify('Your Wordpress Template for ' + pkg.name + ' is now ready!'));
});

gulp.task('start', function() {
  runSequence(
    'create-stylecss',
    'build-prod',
    'replace',
    'clean-up',
    'copy-files', // Do stuff after 'templates' is done
    'finish' // Showing a message saying sequence is done
  );
});

//gulp-replace
// ** bootstrap path in main.scss
// ** css path in index.html
