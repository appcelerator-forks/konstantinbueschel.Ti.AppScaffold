'use strict';

var gulp           = require('gulp'),
    $              = require('gulp-load-plugins')(),
    del            = require('del'),
    args           = require('yargs').argv,
    preen          = require('preen'),
    runSequence    = require('run-sequence'),
    bowerFiles     = require('main-bower-files'),
    tiApp          = require('tiapp.xml').load('./tiapp.xml'),
    exec           = require('child_process').exec,
    installrConfig = require('./installrfile.json');


/**********************************************************************************
 * CONFIGURATION
 * ********************************************************************************/
var CONFIG = {

	DIRECTORIES: {
		BOWER:                 './bower_components',
		BOWER_DESTINATION_MAP: {

		}
	},

	OS:          (args.os || 'ios').toLowerCase(),
	ENVIRONMENT: (args.env || args.environment || 'development'),
	APP_VERSION: ('Version-' + tiApp.version)
};


var isDevelopmentEnv = CONFIG.ENVIRONMENT === 'development',
    isProductionEnv  = CONFIG.ENVIRONMENT === 'production';


/**********************************************************************************
 * SCSS
 * ********************************************************************************/
gulp.task('scss', function () {

	gulp.src([CONFIG.DIRECTORIES.SOURCE + '/scss/**/*.scss'])
		.pipe($.changed(CONFIG.DIRECTORIES.TEMP))
		.pipe($.rubySass({
			loadPath:      [CONFIG.DIRECTORIES.BOWER],
			sourcemap:     true,
			sourcemapPath: '../scss',
			style:         isProductionEnv ? 'compressed' : 'compact'
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
gulp.task('clean', function (callback) {

	// delete Bower dir
	del([CONFIG.DIRECTORIES.BOWER + '*'], callback);
});

gulp.task('preen', ['bower'], function (callback) {

	// return preen.preen({}, callback);
	preen.preen({}, callback);
});

gulp.task('ti:clean', function(callback) {

	var cliCommand = "ti clean",
	    cliArgs = [];

	cliArgs.unshift(cliCommand);


	// LOG
	console.log('CLI command: ', cliArgs.join(' '));


	var ti = exec(cliArgs.join(' '), {

		maxBuffer: (2000 * 1024)
	});

	ti.stdout.on('data', function (data) {
		console.log(data);
	});

	ti.stderr.on('data', function (data) {
		console.log(data);
	});

	ti.on('close', function (code) {

		console.log('Finished with code: ', code);
		callback(code != 0);
	});
});


/**********************************************************************************
 * TITANIUM MOBILE
 * ********************************************************************************/

gulp.task('ti:build', function(callback) {

	var cliCommand = "ti build",

	    cliArgs = [
		    ("-p " + CONFIG.OS),
		    (args.tall ? "--tall" : ""),
		    (args.retina ? "--retina" : "")
	    ];

	cliArgs.unshift(cliCommand);


	// LOG
	console.log('CLI command: ', cliArgs.join(' '));


	var ti = exec(cliArgs.join(' '), {

		maxBuffer: (10000 * 1024)
	});

	ti.stdout.on('data', function (data) {
		console.log(data);
	});

	ti.stderr.on('data', function (data) {
		console.log(data);
	});

	ti.on('close', function (code) {

		console.log('Finished with code: ', code);
		callback(code != 0);
	});
});

gulp.task('installr:build', function (callback) {

	var cliCommand = "titanium build",

	    cliArgs = [
		    ("-O '" + installrConfig.appFileDir + "'"), // output dir
		    ("-p '" + CONFIG.OS + "'"), // target platform
		    "-d './'", // project dir
		    "-b", // build-only flag
		    "-f", // force full rebuild flag
		    "--no-prompt" // disable interactive prompting
	    ];


	switch (CONFIG.OS) {

		case 'ios':

			cliArgs.push("-P '" + installrConfig.provisioningUUID + "'"); // provisioning profile uuid
			cliArgs.push("-R '" + installrConfig.distCertificateName + "'"); // distribution certificate name
			cliArgs.push("-T dist-adhoc"); // target ios

			break;

		case 'android':

			cliArgs.push("-T dist-playstore"); // target android

			break;
	}


	// LOG
	console.log('CLI command: ', cliCommand, cliArgs.join(' '));


	cliArgs.unshift(cliCommand);


	var ti = exec(cliArgs.join(' '), {

		maxBuffer: (5000 * 1024)
	});

	ti.stdout.on('data', function (data) {
		console.log(data);
	});

	ti.stderr.on('data', function (data) {
		console.log(data);
	});

	ti.on('close', function (code) {

		console.log('Finished with code: ', code);
		callback(code != 0);
	});
});


/**********************************************************************************
 * INSTALLR
 * ********************************************************************************/
gulp.task('installr:upload', function (callback) {

	installrConfig.releaseNotes = (installrConfig.releaseNotes && installrConfig.releaseNotes.length ? installrConfig.releaseNotes : CONFIG.APP_VERSION);

	var cliCommand = "curl",

	    cliArgs = [
		    ("-H 'X-InstallrAppToken: " + installrConfig.apiToken + "' https://www.installrapp.com/apps.json "),
		    ("-F 'qqfile=@" + installrConfig.appFileDir + installrConfig.appFile + "' "),
		    ("-F 'releaseNotes=" + installrConfig.releaseNotes + "' "),
		    ("-F 'notify=" + installrConfig.notify + "'")
	    ];


	// LOG
	console.log('CLI Command: ', cliCommand, cliArgs.join(' '));


	cliArgs.unshift(cliCommand)

	var curl = exec(cliArgs.join(' '), {

		maxBuffer: (5000 * 1024)
	});

	curl.stdout.on('data', function (data) {

		// LOG
		console.log(data);
	});

	curl.stderr.on('data', function (data) {

		// LOG
		console.log(data);
	});

	curl.on('close', function (code) {

		// LOG
		console.log('Finished with code: ', code);

		callback(code != 0);
	});
});

gulp.task('installr', function (callback) {

	runSequence('installr:build', 'installr:upload', callback);
});


/**********************************************************************************
 * TITANIUM MOBILE
 * ********************************************************************************/
gulp.task('installr:build', function (callback) {

	var cliCommand = "titanium build",

	    cliArgs = [
		    ("-O '" + installrConfig.appFileDir + "'"), // output dir
		    ("-p '" + CONFIG.OS + "'"), // target platform
		    "-d './'", // project dir
		    "-b", // build-only flag
		    "-f", // force full rebuild flag
		    "--no-prompt" // disable interactive prompting
	    ];


	switch (CONFIG.OS) {

		case 'ios':

			cliArgs.push("-P '" + installrConfig.provisioningUUID + "'"); // provisioning profile uuid
			cliArgs.push("-R '" + installrConfig.distCertificateName + "'"); // distribution certificate name
			cliArgs.push("-T dist-adhoc"); // target ios

			break;

		case 'android':

			cliArgs.push("-T dist-playstore"); // target android

			break;
	}


	// LOG
	console.log('CLI command: ', cliCommand, cliArgs.join(' '));


	cliArgs.unshift(cliCommand);


	var ti = exec(cliArgs.join(' '), {

		maxBuffer: (5000 * 1024)
	});

	ti.stdout.on('data', function (data) {
		console.log(data);
	});

	ti.stderr.on('data', function (data) {
		console.log(data);
	});

	ti.on('close', function (code) {

		console.log('Finished with code: ', code);
		callback(code != 0);
	});
});


/**********************************************************************************
 * INSTALLR
 * ********************************************************************************/
gulp.task('installr:upload', function (callback) {

	installrConfig.releaseNotes = (installrConfig.releaseNotes && installrConfig.releaseNotes.length ? installrConfig.releaseNotes : CONFIG.APP_VERSION);

	var cliCommand = "curl",

	    cliArgs = [
		    ("-H 'X-InstallrAppToken: " + installrConfig.apiToken + "' https://www.installrapp.com/apps.json "),
		    ("-F 'qqfile=@" + installrConfig.appFileDir + installrConfig.appFile + "' "),
		    ("-F 'releaseNotes=" + installrConfig.releaseNotes + "' "),
		    ("-F 'notify=" + installrConfig.notify + "'")
	    ];


	// LOG
	console.log('CLI Command: ', cliCommand, cliArgs.join(' '));


	cliArgs.unshift(cliCommand)

	var curl = exec(cliArgs.join(' '), {

		maxBuffer: (5000 * 1024)
	});

	curl.stdout.on('data', function (data) {

		// LOG
		console.log(data);
	});

	curl.stderr.on('data', function (data) {

		// LOG
		console.log(data);
	});

	curl.on('close', function (code) {

		// LOG
		console.log('Finished with code: ', code);

		callback(code != 0);
	});
});

gulp.task('installr', function (callback) {

	runSequence('installr:build', 'installr:upload', callback);


	/**********************************************************************************
	 * INIT
	 * ********************************************************************************/
	gulp.task('bower', function () {

		return $.bower();
	});

	gulp.task('init', ['bower', 'preen'], function () {

		var momentFilter = $.filter('moment-with-locales.js'),
		    lodashFilter = $.filter('q.js'),
		    queueFilter = $.filter('lodash.min.js'),
		    asyncFilter = $.filter('async.js');


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
	gulp.task('default', function (callback) {

		runSequence('init', 'clean', callback);
	});


	/**********************************************************************************
	 * ERROR HANDLER
	 * ********************************************************************************/

	function errorHandler(err) {
		console.log(err);
	}
