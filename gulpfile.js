/*
 * gulpfile.js
 *
 * /gulpfile.js
 *
 * This module represents the gulpfile for this app project
 *
 * Author:		kbueschel
 * Date:		2015-01-09
 *
 * Maintenance Log
 *
 * Author:
 * Date:
 * Changes:
 *
 * Copyright (c) 2014 by die.interaktiven GmbH & Co. KG. All Rights Reserved.
 * Proprietary and Confidential - This source code is not for redistribution
 */

'use strict';

var gulp         = require('gulp'),
    $            = require('gulp-load-plugins')(),
    runSequence  = require('run-sequence'),
    tiApp        = require('tiapp.xml').load('./tiapp.xml'),
    tiStealth    = require('ti-stealth'),
    childProcess = require('child_process'),
    exec         = childProcess.exec,
    nconf        = require('nconf'),
    fs           = require('fs'),
    plist        = require('plist'),
    path         = require('path'),
    _            = require('lodash'),
    del          = require('del'),
    preen        = require('preen'),
    bowerFiles   = require('main-bower-files');


/**********************************************************************************
 * CONFIGURATION
 * ********************************************************************************/

var CONFIG = {

	DIRECTORIES: {
		BOWER:                 './bower_components',
		BOWER_DESTINATION_MAP: {}
	}
};


nconf.argv().env();

nconf.file({file: './installrfile.json'});

nconf.defaults({

	'os':                'ios',
	'environment':       'development',
	'env':               'development',
	'app_version':       ('Version-' + tiApp.version),
	'releaseNotes':      ('Version-' + tiApp.version), // installr release notes
	'settingsPlistPath': './platform/iphone/Settings.bundle/Root.plist',
	'settingsXMLPath':   './i18n/de/strings.xml'
});

var ENV              = nconf.get('environment'),

    isDevelopmentEnv = ENV === 'development',
    isProductionEnv  = ENV === 'production';


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


gulp.task('clean:dist', function () {

	return gulp.src([path.join(nconf.get('appFileDir'), '*'), '!*.md'], {read: false})
		.pipe($.rimraf());
});


gulp.task('preen', ['bower'], function (callback) {

	// return preen.preen({}, callback);
	preen.preen({}, callback);
});


/**********************************************************************************
 * VERSIONING
 * ********************************************************************************/
gulp.task('versioning', function (callback) {

	// set new build number
	var stamp = Math.round((new Date()).getTime() / 1000),
	    versions = tiApp.version.split('.');

	versions[3] = stamp.toString();

	tiApp.version = versions.join('.');


	// update Android version name and code
	var androids = tiApp.doc.documentElement.getElementsByTagName('android');

	if (androids.length === 1) {

		var manifests = androids.item(0).getElementsByTagName('manifest');

		if (manifests.length === 1) {

			var manifest = manifests.item(0);

			manifest.setAttribute('android:versionName', versions.slice(0, 3).join('.'));
			manifest.setAttribute('android:versionCode', stamp);
		}
	}

	tiApp.write();


	// update iOS root.plist app version default value
	var settingsPlistPath = nconf.get('settingsPlistPath');

	if (fs.existsSync(settingsPlistPath)) {

		var settingsPlist = plist.parse(fs.readFileSync(settingsPlistPath, 'utf-8'));

		settingsPlist.PreferenceSpecifiers.forEach(function (setting, index) {

			if (setting.Title && setting.Title === 'App Version') {

				setting.DefaultValue = versions.slice(0, 3).join('.');
			}

			return;
		});

		fs.writeFileSync(settingsPlistPath, plist.build(settingsPlist));
	}


	// update Android strings.xml
	var settingsXMLPath = nconf.get('settingsXMLPath');

	if (fs.existsSync(settingsXMLPath)) {

		return gulp.src(settingsXMLPath)

			.pipe($.xmlEditor([
				{path:    '//string[@name="preferences_app_version_title"]',
					text: ('App Version ' + versions.slice(0, 3).join('.'))
				}
			]))

			.pipe(gulp.dest(path.dirname(settingsXMLPath)))

			.pipe($.notify('Bumped version to: ' + tiApp.version));
	}


	return gulp.src('./dist')
		.pipe($.notify('Bumped version to: ' + tiApp.version));
});


/**********************************************************************************
 * DEBUGGING
 * ********************************************************************************/
gulp.task('debug:hide', function () {

	var files = fs.listFilesSync('./Resources', {

		    recursive:  true,
		    prependDir: true,
		    filter:     function (filePath) {

			    return filePath.match(/\.js$/);
		    }
	    }),

	    excludeFiles = ['moment.js', 'q.js', 'async.js'],
	    stealthedFiles = [];


	_.each(files, function (filePath) {


		if (!_.contains(excludeFiles, path.basename(filePath))) {

			var enabledFile = tiStealth.enable({

				input:     filePath,
				notLevels: ['errors, info']
			});


			if (enabledFile.length && _.isArray(enabledFile)) {

				stealthedFiles = stealthedFiles.concat(enabledFile);
			}
		}

		return;
	});


	// LOG
	return gulp.src('./dist')
		.pipe($.notify('App Debugging output stealthed for ' + stealthedFiles.length + ' file(s)'));
});


gulp.task('debug:show', function () {

	var restoredFiles = tiStealth.restore('./Resources');


	// LOG
	return gulp.src('./dist')
		.pipe($.notify('App Debugging output restored for ' + restoredFiles.length + ' file(s)'));
});


/**********************************************************************************
 * INSTALLR
 * ********************************************************************************/
gulp.task('installr:upload', function (callback) {

	var appFileName = '',
	    appFiles = fs.readdirSync(nconf.get('appFileDir'));


	// LOG
	console.log('App files: ', appFiles);


	if (!appFiles.length) {

		callback();
		return;
	}


	// fetch first filename
	appFiles.forEach(function (filename) {

		if (_.isEmpty(appFileName) && path.extname(filename)) {

			appFileName = filename;
		}

		return;
	});

	appFileName = appFiles[0];


	// define cli options
	var cliCommand = "curl",

	    cliArgs = [
		    ("-H 'X-InstallrAppToken: " + nconf.get('apiToken') + "' " + nconf.get('endpoint')),
		    ("-F 'qqfile=@" + nconf.get('appFileDir') + appFileName + "' "),
		    ("-F 'releaseNotes=" + nconf.get('releaseNotes') + "' "),
		    ("-F 'notify=" + nconf.get('notify') + "'")
	    ];


	// LOG
	console.log('CLI Command: ', cliCommand, cliArgs.join(' '));


	// add cli command before cli args
	cliArgs.unshift(cliCommand);


	// concat whole cli command and execute it
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

	runSequence('installr:upload', 'clean:dist', callback);
});


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
	    asyncFilter = $.filter('async.js'),
	    backboneFilter = $.filter('backbone.js');


	return gulp.src(bowerFiles({
		env: nconf.get('environment')
	}))

		.pipe(momentFilter)
		.pipe($.rename('moment.js'))
		.pipe(gulp.dest('Resources/helpers/date'))
		.pipe(momentFilter.restore())

		.pipe(lodashFilter)
		.pipe($.rename('lodash.js'))
		.pipe(gulp.dest('Resources/helpers/common'))
		.pipe(lodashFilter.restore())

		.pipe(backboneFilter)
		.pipe(gulp.dest('Resources/helpers/common'))
		.pipe(backboneFilter.restore())

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
