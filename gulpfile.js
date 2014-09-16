
'use strict';

var gulp =              require('gulp'),
    $ =                 require('gulp-load-plugins')(),
    del =               require('del'),
    args =              require('yargs').argv,
    preen =             require('preen'),
    runSequence =       require('run-sequence'),
    bowerFiles =        require('main-bower-files');


/**********************************************************************************
 * CONFIGURATION
 * ********************************************************************************/
var CONFIG = {

    DIRECTORIES: {

        BOWER: './bower_components',
        BOWER_DESTINATION_MAP: {

        }
    },

    ENVIRONMENT: args.env || args.environment || 'development'
};


var isDevelopmentEnv = CONFIG.ENVIRONMENT === 'development',
    isProductionEnv = CONFIG.ENVIRONMENT === 'production';


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
 * CLEAN
 * ********************************************************************************/
gulp.task('clean', function(callback) {

    // delete Bower dir
    del([CONFIG.DIRECTORIES.BOWER + '*'], callback);
});

gulp.task('preen', ['bower'], function(callback) {

    // return preen.preen({}, callback);
    preen.preen({}, callback);
});


/**********************************************************************************
 * INIT
 * ********************************************************************************/
gulp.task('bower', function() {

    return $.bower();
});

gulp.task('init', ['bower', 'preen'], function() {

    var momentFilter =  $.filter('moment-with-locales.js'),
        lodashFilter =  $.filter('q.js'),
        queueFilter =   $.filter('lodash.min.js'),
        asyncFilter =   $.filter('async.js');


    return gulp.src(bowerFiles({
                env: CONFIG.ENVIRONMENT
            }))

            .pipe(momentFilter)
            .pipe($.rename('moment.js'))
            .pipe(gulp.dest('Resources/helpers/date'))
            .pipe(momentFilter.restore())

            .pipe(lodashFilter)
            .pipe($.rename('lodash.js'))
            .pipe(gulp.dest('Resources/helpers/common'))
            .pipe(lodashFilter.restore())

            .pipe(queueFilter)
            .pipe($.rename('q.js'))
            .pipe(gulp.dest('Resources/helpers/xhr'))
            .pipe(queueFilter.restore())

            .pipe(asyncFilter)
            .pipe(gulp.dest('Resources/helpers/xhr'))
            .pipe(asyncFilter.restore());
});


/**********************************************************************************
 * DEFAULT
 * ********************************************************************************/
gulp.task('default', function(callback) {

    runSequence('init', 'clean', callback);
});


/**********************************************************************************
 * ERROR HANDLER
 * ********************************************************************************/

function errorHandler(err) {
    console.log(err);
}
