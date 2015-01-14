/*
 * DatabaseProvider.js
 *
 * /Resources/model/services/DatabaseProvider.js
 *
 * This module provides database tools for opening, closing
 * connections, querying for data etc.
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

/*
 * Private statefull module vars
 */
var _dbOptions = {

    privateDirectory:       null,
    androidDirectory:       null

}; // END _dbOptions


/*
 * Private statefull module functions
 */
var _helpers = {

    iOSPrivateDocumentsDirectory: function() {

        if (_dbOptions.privateDirectory !== null) {
            return _dbOptions.privateDirectory;
        }

        var testFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory);

        _dbOptions.privateDirectory =   testFile.nativePath.replace('Documents/', '');
        _dbOptions.privateDirectory +=  'Library/Private%20Documents/';

        return _dbOptions.privateDirectory;

    }, // END iOSPrivateDocumentsDirectory()


    AndroidDatabaseDirectory: function() {

        if (_dbOptions.androidDirectory !== null) {
            return _dbOptions.androidDirectory;
        }

        _dbOptions.androidDirectory = 'file:///data/data/' + Ti.App.getID() + '/databases/';

        return _dbOptions.androidDirectory;

    }, // END AndroidDatabaseDirectory()


    endsInSQL: function(value) {

        var split = value.split(".");

        return ((split.length < 2) ? false : (split[(split.length - 1)].toUpperCase() === 'SQL'));

    } // END endsInSQL()

}; // END _helpers


/**
 * Database provider
 *
 * @constructor
 * @param {String} databaseName
 * @return {Object} this
 */
function DatabaseProvider(databaseName) {

    // variable initialization
	this.isOpen = false;
	this.activeDatabase = databaseName;

	this._inTransaction = false;
	this._connection = null;

	this.dataUpdateTable = 'data_updates';
	this.databaseVersionTable = 'database_version';


    return this;

} // END DatabaseProvider()


/**
 * Opens the connection to to database with
 * given databasename
 *
 * @public
 * @method open
 * @param {String} databaseToOpen
 * @return void
 */
DatabaseProvider.prototype.open = function(databaseToOpen) {

    if (databaseToOpen != undefined && databaseToOpen != undefined) {

        if (this.activeDatabase != databaseToOpen) {

            //Close this connection as we will start another
            this.close();
        }

        this.activeDatabase = databaseToOpen;
    }

    // first close to reset
    this.close();


    this._connection = Ti.Database.open(this.activeDatabase);

    this.isOpen = true;
    this._inTransaction = false;

    return;

}; // END open()


/**
 * Closes current connection to database
 *
 * @public
 * @method close
 * @return void
 */
DatabaseProvider.prototype.close = function() {

    if (this._connection != null) {

        if (this._inTransaction) {

            this.commit();
        }

        this._connection.close();
        this._connection = null;
    }

    this.isOpen = false;

    return;

}; // END close()


/**
 * Connect to database
 *
 * @public
 * @method connect
 * @param {Boolean} useTransaction
 * @return {Ti.Database.DB} this._connection
 */
DatabaseProvider.prototype.connect = function(useTransaction) {

    if ((this.isOpen === false) || (this._connection === null)) {
        this.open();
    }

    if (useTransaction) {
        this.begin();
    }

    return this._connection;

}; // END connect()


/**
 * Begin a transaction
 *
 * @public
 * @method begin
 * @return void
 */
DatabaseProvider.prototype.begin = function() {

    if (this._inTransaction === true) {
        return;
    }

    if (this._connection === null) {
        this._inTransaction = false;
        return;
    }


    this._connection.execute('BEGIN');

    this._inTransaction = true;

    return;

}; // END begin()


/**
 * Finish transaction
 *
 * @public
 * @method commit
 * @return void
 */
DatabaseProvider.prototype.commit = function() {

    if (this._inTransaction === false) {
        return;
    }

    if (this._connection === null) {
        this._inTransaction = false;
        return;
    }

    this._connection.execute('COMMIT');


    return;

}; // END commit()


/**
 * Restarts database connection
 *
 * @public
 * @method restart
 * @return void
 */
DatabaseProvider.prototype.restart = function() {

    this.close();
    this.open();

    return;

}; // END restart()


/**
 * Init database and tables
 *
 * @public
 * @method init
 * @return
 */
DatabaseProvider.prototype.init = function() {

    // opens connection if needed
    if (this.isOpen === false || this._connection === null) {
        this.open();
    }


    // data update table
    this._connection.execute('CREATE TABLE IF NOT EXISTS ' + this.dataUpdateTable + ' (modul TEXT, lastupdate INTEGER);');

    // database version table
    this._connection.execute('CREATE TABLE IF NOT EXISTS ' + this.databaseVersionTable + ' (id INTEGER PRIMARY KEY, version INTEGER);');


    // database scheme updates given?
    var currentDatabaseVersion = require('/helpers/common/globals').currentDatabaseVersion;

    if (this.isDatabaseSchemeUpToDate(currentDatabaseVersion) === false) {

        // sync database scheme
        this.updateDatabaseScheme(currentDatabaseVersion);
    }


    // close connection
    this.close();


    // DEBUG INFO
   Ti.API.info('[DatabaseProvider].init():Database "', this.activeDatabase, '" initialized');


    return;

}; // END init()


/**
 * Fügt der übergebenen Tabelle ein neues Feld hinzu,
 * falls dieses noch nicht besteht.
 *
 * @public
 * @method addColumn
 * @param {String} table
 * @param {String} columnName
 * @param {String} dataType
 * @return {Boolean} column exists or not
 */
DatabaseProvider.prototype.addColumn = function(table, columnName, dataType) {

    // open connection if needed
    if (this.isOpen === false || this._connection === null) {
        this.open();
    }


    // variable initialization
    var fieldExists = false,
        resultset = this._connection.execute('PRAGMA TABLE_INFO(' + table + ')');

    if (resultset) {

        while (resultset.isValidRow()) {

            // column exists
            if (resultset.field(1) == columnName) {
                fieldExists = true;
            }

            resultset.next();
        }
    }

    // if column doenst exists
    // add it
    if (fieldExists === false) {
        this._connection.execute('ALTER TABLE ' + table + ' ADD COLUMN '+ columnName + ' ' + dataType);
    }

    // DB Verbindung schließen
    closeDB();

    return !fieldExists;

}; // END addColumn()


/**
 * Returns current database version
 *
 * @public
 * @method getCurrentDatabaseVersion
 * @return {Number} currentDatabaseVersion
 */
DatabaseProvider.prototype.getCurrentDatabaseVersion = function() {

    if (this.isOpen === false || this._connection === null) {
        this.open();
    }

    var currentDatabaseVersion = 1,

        query = {
            select:     'SELECT version',
            from:       this.databaseVersionTable,
            where:      'version IS NOT NULL',
            orderBy:    'version DESC',
            limit:      '1'
        };


    var resultset = this.select(query);

    if (resultset && resultset.isValidRow()) {

        currentDatabaseVersion = resultset.fieldByName('version');

        resultset.close();
    }

    this.close();

    return currentDatabaseVersion;

}; // END getCurrentDatabaseVersion()


/**
 * Returns whether database scheme is up to date or not
 *
 * @public
 * @method isDatabaseSchemeUpToDate
 * @param {Number} currentDatabaseVersion
 * @retun {Boolean}
 */
DatabaseProvider.prototype.isDatabaseSchemeUpToDate = function(currentDatabaseVersion) {

    // Datenbankstruktur aktuell?
    if (this.getCurrentDatabaseVersion() >= currentDatabaseVersion) {

        // DEBUG INFO
       Ti.API.info('[DatabaseProvider]:Database scheme is up to date');

        return true;
    }


    // DEBUG WARNING
   Ti.API.warn('[DatabaseProvider]:Database scheme is deprecated');


    return false;

}; // END isDatabaseSchemeUpToDate()


/**
 * Aktualisiert anhand der gewünschten Datenbankversionsnummer die Datenbankstruktur.
 * Die Änderungen müssen jedoch nach programmiert bzw. im switch hinzugefügt werden.
 *
 * Update database scheme to given version. Update scheme must be implemented by developer
 *
 * @public
 * @method updateDatabaseScheme
 * @param {Number} updateToVersion
 * @return void
 */
DatabaseProvider.prototype.updateDatabaseScheme = function(updateToVersion) {

    if (updateToVersion) {

        var i = this.getCurrentDatabaseVersion();

        for (i; i < updateToVersion; i++) {

            var nextVersionToUpdateTo =	(i + 1);


            // DEBUG INFO
           Ti.API.info('[DatabaseProvider]:updateDatabaseScheme():Database will be updated to version "', nextVersionToUpdateTo, '"');


            this.alterDatabaseSchemeToVersion(nextVersionToUpdateTo);
        }
    }

    return;

}; // END updateDatabaseScheme()


/**
 * Alter database scheme to given version
 *
 * @public
 * @method alterDatabaseSchemeToVersion
 * @param {Number} updateToVersion
 * @return void
 */
DatabaseProvider.prototype.alterDatabaseSchemeToVersion = function(updateToVersion) {

    if (updateToVersion && updateToVersion > 0) {

	    var versionUpdateQuery = ('INSERT INTO ' + this.databaseVersionTable + ' (version) VALUES(?);');

        switch (updateToVersion) {

            case 2:

                // open connection
                if (this.isOpen === false || this._connection === null) {
                    this.open();
                }

                // database scheme update - events scheme update
                // this._connection.execute('DROP TABLE IF EXISTS ' + this.eventTable + ';');

                this._connection.execute('ALTER TABLE ' + this.eventTable + ' ADD COLUMN hidden INTEGER DEFAULT 0;');
                this._connection.execute('ALTER TABLE ' + this.eventTable + ' ADD COLUMN deleted INTEGER DEFAULT 0;');

                // update database version in table
                this._connection.execute(versionUpdateQuery, updateToVersion);

                // close connection
                this.close();


                // DEBUG INFO
               Ti.API.info('[DatabaseProvider]:alterDatabaseSchemeToVersion():Database scheme updated to version "', updateToVersion, '"');

                break;


            default:

                // DEBUG WARNING
               Ti.API.warn('[DatabaseProvider]:alterDatabaseSchemeToVersion():Tried to update to not specified database scheme version! (Failed version update: "', updateToVersion, '")');

                break;
        }
    }

    return;

}; // END alterDatabaseSchemeToVersion()


/**
 * Fires a select query with given options and returns the
 * resultset object.
 *
 * If no database connection is opened, it will open one based
 * on the databasename provided to constructor.
 *
 * e.g.: queryOptions {
 *
 *      select:     "*",
 *      from:       "table",
 *      where:      "field = 1",
 *      groupBy:    "field",
 *      orderBy:    "field ASC",
 *      limit:      "10"
 * }
 *
 * @public
 * @method select
 * @param {Object} queryOptions
 * @return {Ti.Database.ResultSet}
 */
DatabaseProvider.prototype.select = function(queryOptions){

    if ((this.isOpen === false) || (this._connection === null)) {
        this.open();
    }

    var select =    ((queryOptions.select && queryOptions.select.length) ? 'SELECT ' + (queryOptions.select.trim().replace(/SELECT/i, '')) : 'SELECT *'),
        from =      ((queryOptions.from && queryOptions.from.length) ? ' FROM ' + (queryOptions.from.trim().replace(/FROM/i, '')) : ''),

        where =     ((queryOptions.where && queryOptions.where.length) ? ' WHERE ' + (queryOptions.where.trim().replace(/^WHERE/i, '')) : ''),

        groupBy =   ((queryOptions.groupBy && queryOptions.groupBy.length) ? ' GROUP BY ' + (queryOptions.groupBy.trim().replace(/GROUP BY/i, '')) : ''),
        orderBy =   ((queryOptions.orderBy && queryOptions.orderBy.length) ? ' ORDER BY ' + (queryOptions.orderBy.trim().replace(/ORDER BY/i, '')) : ''),

        limit =     ((queryOptions.limit && queryOptions.limit.length) ? ' LIMIT ' + (queryOptions.limit.trim().replace(/LIMIT/i, '')) : '');


    // DEBUG INFO
   Ti.API.info('[DatabaseProvider].select():Query "', select, from, where, groupBy, orderBy, limit, '"');


    return this._connection.execute(select + from + where + groupBy + orderBy + limit);

}; // END select()




/***************************************************
 * Database file methods
 ***************************************************/

/**
 * Returns the platform specific database directory
 *
 * @public
 * @method getDatabaseDirectory
 * @return {String}
 */
DatabaseProvider.prototype.getDatabaseDirectory = function() {

    // require Tools module
    if (require('/helpers/common/tools').isAndroid) {

        return _helpers.AndroidDatabaseDirectory();
    }

    return _helpers.iOSPrivateDocumentsDirectory();

}; // END getDatabaseDirectory()


/**
 * Returns the database file from filesystem
 *
 * @public
 * @method getDatabaseFile
 * @param {Ti.Filesystem.File}
 */
DatabaseProvider.prototype.getDatabaseFile = function(databaseName) {

    // require Tools module
    var dbFullName = ((require('/helpers/common/tools').isAndroid) ? databaseName : ((_helpers.endsInSQL(databaseName)) ? databaseName : databaseName + '.sql'));

    return Ti.Filesystem.getFile(this.getDatabaseDirectory(), dbFullName);

}; // END getDatabaseFile()


/**
 * Enables/disables iOS remote backup for
 * database with given databasename
 *
 * @public
 * @method toggleDatabaseRemoteBackup
 * @param {String} databaseName
 * @param {Boolean} enable
 * @return void
 */
DatabaseProvider.prototype.toggleDatabaseRemoteBackup = function(databaseName, enable) {

    // require Tools module
    if (!require('/helpers/common/tools').isAndroid) {

        var db = this.getDatabaseFile(databaseName);

        if (db.exists()) {
            db.setRemoteBackup(enable);
        }

        db = null;
    }

    return;

}; // END toggleDatabaseRemoteBackup


/**
 * Rename database with given databasename
 *
 * @public
 * @method renameDatabase
 * @param {String} oldName
 * @param {String} newName
 * @return void
 */
DatabaseProvider.prototype.renameDatabase = function(oldName, newName) {

    // require Tools module
    var db = this.getDatabaseFile(oldName);

    if (db.exists()) {

        newName = ((require('/helpers/common/tools').isAndroid) ? newName : ((_helpers.endsInSQL(newName)) ? newName : newName + '.sql'));

        db.rename(newName);
    }

    db = null;

}; // END renameDatabase()


/**
 * Removes database with given databasename
 *
 * @public
 * @method removeDatabase
 * @param {String} databaseName
 * @return void
 */
DatabaseProvider.prototype.removeDatabase = function(databaseName) {

    var db = this.getDatabaseFile(databaseName);

    if (db.exists()) {

        db.deleteFile();
    }

    db = null;

    return;

}; // END removeDatabase()


/**
 * Returns whether database with given databasename
 * exists or not
 *
 * @public
 * @method existsDatabase
 * @param {String} databaseName
 * @return {Boolean}
 */
DatabaseProvider.prototype.existsDatabase = function(databaseName) {

    var db = this.getDatabaseFile(databaseName),
        doesExist = db.exists();

    db = null;

    return doesExist;

}; // END existsDatabase()


/**
 * Returns an array with all installed databases
 * as object with databasenae and native path to
 * database
 *
 * @public
 * @method listDatabases
 * @return {Object[]} databaseList
 */
DatabaseProvider.prototype.listDatabases = function() {

    var tDir =          this.getDatabaseDirectory(),
        tFileRef =      Ti.Filesystem.getFile(tDir),
        dirFiles =      tFileRef.getDirectoryListing(),
        tempFile =      null,

        databaseList =  [],

        iLength =       dirFiles.length,
        iLoop;


    // require Tools module
    var Tools = require('/helpers/common/tools');

    for (iLoop = 0; iLoop < iLength; iLoop++) {

        tempFile = Ti.Filesystem.getFile(tDir + dirFiles[iLoop]);

        if (tempFile.exists()) {

            if (Tools.isAndroid || (Tools.isAndroid === false && tempFile.extension().toLowerCase() === 'sql')) {

                databaseList.push({
                    dbName:        tempFile.name.replace('.sql'),
                    nativePath:    tempFile.nativePath
                });
            }
        }
    }

    return databaseList;

}; // END listDatabases()


// provide public access to class
module.exports = DatabaseProvider;
