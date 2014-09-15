'use strict';


var gulp =          require('gulp'),
    $ =             require('gulp-load-plugins')(),
    browserify =    require('browserify'),
    browserSync =   require('browser-sync'),
    del =           require('del'),
    Pageres =       require('pageres'),
    wiredep =       require('wiredep').stream,
    args =          require('yargs').argv,
    runSequence =   require('run-sequence');


/**********************************************************************************
 * CONFIGURATION
 * ********************************************************************************/
var CONFIG = {
    DIRECTORIES: {
        "DEPLOYMENT": "dist",
        "DOCUMENTATION": "doc",
        "SOURCE": "src",
        "TEMP": ".tmp",
        "SCREENSHOTS": "screenshots",
        "BOWER": "src/bower_components"
    },
    BROWSERS: ["last 2 version"],
    URL: {
        DEVELOPMENT: 'http://www.google.de',
        PRODUCTION: 'http://www.google.de'
    },
    ENVIRONMENT: args.env || args.environment || 'development'
};


var isDevelopmentEnv = CONFIG.ENVIRONMENT === 'development',
    isProductionEnv = CONFIG.ENVIRONMENT === 'production';


/**********************************************************************************
 * SERVE
 * ********************************************************************************/
gulp.task('serve', function () {

    browserSync({
        server: {
            baseDir: [CONFIG.DIRECTORIES.SOURCE , CONFIG.DIRECTORIES.TEMP]
        },
        notify: false
    });

    gulp.watch([CONFIG.DIRECTORIES.SOURCE + '/**/*.html'], browserSync.reload);
    gulp.watch([CONFIG.DIRECTORIES.SOURCE + '/scss/**/*.scss'], ['scss:dev']);
    gulp.watch([CONFIG.DIRECTORIES.TEMP + '/css/**/*.css'], browserSync.reload);
    gulp.watch([CONFIG.DIRECTORIES.SOURCE + '/js/**/*.js'], ['jshint:dev']);
    gulp.watch([CONFIG.DIRECTORIES.SOURCE + '/img/**/*'], ['imagemin']);
});


/**********************************************************************************
 * SCSS
 * ********************************************************************************/
gulp.task('scss', function () {

    gulp.src([CONFIG.DIRECTORIES.SOURCE + '/scss/**/*.scss'])
        .pipe($.changed(CONFIG.DIRECTORIES.TEMP))
        .pipe($.rubySass({
            loadPath: [CONFIG.DIRECTORIES.BOWER],
            sourcemap: true,
            sourcemapPath: '../scss',
            style: isProductionEnv ? 'compressed' : 'compact'
        }))
        .on('error', errorHandler)
        .pipe($.autoprefixer(CONFIG.BROWSERS))
        .pipe($.if(isProductionEnv, $.cssshrink()))
        .pipe($.if(isDevelopmentEnv, gulp.dest(CONFIG.DIRECTORIES.TEMP + '/css')))
        .pipe($.if(isProductionEnv, gulp.dest(CONFIG.DIRECTORIES.DEPLOYMENT + '/css')))
        .pipe($.size({title: 'css'}))

});

/**********************************************************************************
 * BROWSERIFY
 *********************************************************************************/
gulp.task('browserify', function(){
    browerify(CONFIG.DIRECTORIES.SOURCE + '/js/main.js')
        .bundle();
});
/**********************************************************************************
 * JSHINT:DEVELOPMENT
 *********************************************************************************/
gulp.task('jshint:dev', function () {
    gulp.src(CONFIG.DIRECTORIES.SOURCE + '/js/**/*.js')
        .pipe($.jshint('.jshintrc'))
        .pipe($.jshint.reporter('jshint-stylish'));
});


/**********************************************************************************
 * WIREDEP
 * ********************************************************************************/
gulp.task('wiredep', function () {
    gulp.src(CONFIG.DIRECTORIES.SOURCE + '/index.html')
        .pipe(wiredep({}))
        .pipe(gulp.dest(CONFIG.DIRECTORIES.SOURCE));
});

/**********************************************************************************
 * IMAGHEMIN
 * ********************************************************************************/
gulp.task('imagemin', function () {
    gulp.src(CONFIG.DIRECTORIES.SOURCE + '/img/**')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [
                {removeViewBox: false}
            ]
        }))
        .pipe(gulp.dest(CONFIG.DIRECTORIES.DEPLOYMENT + '/img'));
});

gulp.task('pageres', function () {


    var pageres = new Pageres({delay: 2})
        .src(CONFIG.URL.PRODUCTION)
        .dest(CONFIG.DIRECTORIES.SCREENSHOTS);

    pageres.run(function (err) {
        if (err) {
            throw err;
        }
    });

});


gulp.task('uncss', function () {
    /*
     gulp.src('bootstrap.css')
     .pipe($.uncssTask({
     html: ['index.html', 'contact.html', 'about.html']
     }))
     .pipe(gulp.dest('dest'));
     */
});

gulp.task('kss', function () {
    gulp.src(CONFIG.DIRECTORIES.SOURCE + '/scss/**/*.scss')
        .pipe($.kss())
        .pipe(gulp.dest(CONFIG.DIRECTORIES.DOCUMENTATION + '/styleguide/'));
});


/**********************************************************************************
 * CLEAN
 * ********************************************************************************/
gulp.task('clean', del.bind(null, [CONFIG.DIRECTORIES.TEMP, CONFIG.DIRECTORIES.DEPLOYMENT]));


/**********************************************************************************
 * DEFAULT
 * ********************************************************************************/
gulp.task('default', ['clean'], function () {
    runSequence('scss:dev');
});


/**********************************************************************************
 * DEPLOY
 * ********************************************************************************/
gulp.task('deploy', function () {
    runSequence('scss:deploy');
});


/**********************************************************************************
 * ERROR HANDLER
 * ********************************************************************************/

function errorHandler(err) {
    console.log(err);
}
