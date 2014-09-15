/**
 * DiaChunkedUploader
 * 
 * _options: {
 * 
 *      URL:                        '',
 *      fileHandle:                 undefined,
 *      filename:                   ('file_' + Lib.getUnixNow()), 
 * 
 *      onDrain:                    function() {},
 *      onAbort:                    function() {},
 * 
 *      onChunkLoad:                function() {},
 *      onChunkError:               function() {},
 *      onChunkSendstream:          function() {},
 *      onChunkReadyStateChange:    function() {},
 * 
 *      shouldAuthenticate:         false, // if you set this to true, pass "username" and "password" as well as options
 *      async:                      true,
 * 
 *      contentType:                Lib.getOSProperty({
 *                                          
 *                                      iphone:     'multipart/form-data',
 *                                      android:    ''
 *                                      
 *                                  }), // 'multipart/form-data' || 'application/octet-stream',
 *                                  
 *      enableKeepAlive:            false,
 *      timeout:                    0,
 *      
 *      chunkSize:                  (1024 * 100), // in bytes - default 100KB        
 *      maxChunkRetries:            undefined, // The maximum number of retries for a chunk before the upload is failed. Valid values are any positive integer and undefined for no retries.
 *      
 *      debug:                      false 
 * }
 * 
 * @author Konstantin Büschel <konstantin@die-interaktiven.de>
 * @constructor
 * @param {Object} _options
 * @return void
 */
function DiaChunkedUploader(_options) {
    
    // protect "this"
    var that = this;
        
    // load dependencies
    var Lib = require('/lib/Lib');
    
    // merge options    
    this._options = Lib.extend({
        
        URL:                        '',
        fileHandle:                 undefined,
        filename:                   ('file_' + Lib.getUnixNow()), 
        
        onDrain:                    function() {},
        onAbort:                    function() {},
        
        onChunkLoad:                function() {},
        onChunkError:               function() {},
        onChunkSendstream:          function() {},
        onChunkReadyStateChange:    function() {},
        
        shouldAuthenticate:         false, // if you set this to true, pass "username" and "password" as well
        async:                      true,
        
        contentType:                Lib.getOSProperty({
                                        
                                        iphone:     'multipart/form-data',
                                        android:    ''
                                        
                                    }), // 'multipart/form-data' || 'application/octet-stream',
                                    
        enableKeepAlive:            false,
        timeout:                    0,
        
        chunkSize:                  (1024 * 100), // in bytes - default 100KB        
        maxChunkRetries:            undefined, // The maximum number of retries for a chunk before the upload is failed. Valid values are any positive integer and undefined for no retries.
        
        debug:                      false     
        
    }, _options);
    
    // fetch file handle
    this._fileHandle = this._options.fileHandle;
    
    // fetching filesize
    this._fileSize = this._fileHandle.size;

    // define chunksize
    this._chunkSize = this._options.chunkSize;
    
    // define the current chunk number
    this._currentChunkNumber = 1;
    
    // init current chunk variable
    this._currentChunk = undefined;
    
    // init total bytes loaded
    this._totalBytesLoaded = 0;
    
    // Android: currentChunkBytesLoaded
    this._currentChunkBytesLoaded = 0;
    
    // init uploaded chunk numbers
    this._uploadedChunkNumbers = [];
    
    // define current chunk identifier
    this._currentChunkIdentifier = this._createChunkIdentifier(Lib.padDigits(this._currentChunkNumber, 2));
    
    // define total chunk count
    this._totalChunkCount = Math.ceil(this._fileSize / this._chunkSize);
    
    // define paused state
    this._isPaused = false;
    
    // define loading state
    this._isFinished = false;


    // create stream to read chunks from file handle
    this._fileStream = this._fileHandle.open(Ti.Filesystem.MODE_READ);
    
    
    // create buffer to read chunks into with length
    // of chunks
    this._chunkBuffer = Ti.createBuffer({
        length: that._chunkSize 
    });
    
    
    // define xhr creation options
    var xhrOptions = {
        enableKeepAlive:    this._options.enableKeepAlive
    };
    
    // set timeout if given
    if (Lib.type(this._options.timeout) === 'number') {
        
        xhrOptions = Lib.extend(xhrOptions, {
            timeout: this._options.timeout
        });
    }    

    // Create the XHR object
    this._xhr = Ti.Network.createHTTPClient(xhrOptions);


    // Set XHR callbacks
    this._xhr.onload = function(_event) {
        that._onChunkUploadComplete.call(that, _event);
    };
    
    
    this._xhr.onerror = function(_event) {
        that._onChunkUploadError.call(that, _event);
    };
    
    
    this._xhr.onreadystatechange = function(_event) {
        
        // define result object
        var result = (_event || {});
        
        // add readystate to event object
        result.uploadReadyState = this.readyState;      
        
        // process custom onReadyStateChange from options 
        that._options.onChunkReadyStateChange(result);
    };


    this._xhr.onsendstream = function(_event) {
            
            if (_event.progress <= 1) {
                
                // define result object
                var result = (_event || {});
              
                
                // add current chunk number and total chunk 
                // count to result object
                result.currentChunkNumber =         that._currentChunkNumber;
                result.totalChunkCount =            that._totalChunkCount;
                
                // add total filesize to result object
                result.totalFilesize =              that._fileSize;
                
                // add current chunk size to result object
                result.currentChunkSize =           (that._currentChunk ? that._currentChunk.length : 1);
                
                // add bytes loaded to result object  
                result.bytesLoaded =                (result.currentChunkSize * _event.progress);
                
                
                // load Lib module
                var Lib = require('/lib/Lib');
                
                // Android: calculate current chunk bytes and totaly bytes loaded
                if (Lib.isAndroid()) {
                    
                    // if first onsendstream call for current chunk
                    if (that._currentChunkBytesLoaded == 0) {
                        
                        that._currentChunkBytesLoaded = result.bytesLoaded;
                        
                        that._totalBytesLoaded += that._currentChunkBytesLoaded;
                    }
                    // each further onsendstream call for current chunk
                    else {
                        var currentUploadedBytes = (result.bytesLoaded - that._currentChunkBytesLoaded);
                        
                        that._currentChunkBytesLoaded += currentUploadedBytes;
                        
                        that._totalBytesLoaded += currentUploadedBytes;
                    }
                }
                
                
                // iOS: set total bytes loaded
                if (Lib.isIOS()) {
                    that._totalBytesLoaded +=       ((that._fileSize * _event.progress) / that._totalChunkCount);    
                }
                
                
                // add total bytes loaded to result object
                result.totalBytesLoaded =           that._totalBytesLoaded;
                
                // add total progress in percentage to result object
                result.totalProgressPercentage =    ((that._totalBytesLoaded / that._fileSize) * 100);    
                
                      
                // process custom onSendstream callback from options
                that._options.onChunkSendstream(result);
            }
    };     
    
} // END DiaChunkedUploader()


/**
 * Upload chunk
 * 
 * @private
 * @return void
 */
DiaChunkedUploader.prototype._upload = function() {
    
    // protect "this"
    var that = this;
    
 
    // Slight timeout needed here (File read / AJAX readystate conflict?)
    setTimeout(function() {
        
        // fetch is chunk uploaded
        var chunkUploaded = that._uploadedChunkNumbers.inArray(that._currentChunkNumber);
        
        
        // if last chunk is at turn, calculate new buffer length
        // because last chunk in most cases should be smaller than
        // given chunksize
        if (that._currentChunkNumber == that._totalChunkCount) {
            
            that._chunkBuffer.setLength(that._fileSize - (that._chunkSize * (that._totalChunkCount - 1))); 
        }
        else {
            
            that._chunkBuffer.setLength(that._chunkSize);
        }
        
        
        // load Lib module
        var Lib = require('/lib/Lib');
        
        
        // if chunk had been uploaded fetch next chunk
        if (chunkUploaded === true || Lib.type(that._currentChunk) === 'undefined') {
            
            // holds read bytescount from blobstream
            var bytesRead = -1;
            
            
            // fetch chunk
            try {
                
                bytesRead = that._fileStream.read(that._chunkBuffer);
            }  
            catch (_exception) {

                // DEBUG ERROR
                Lib.error('------ DIA');
                Lib.error('DiaChunkedUploader.js - _upload() - _fileStream.read(...) Error!');
                Lib.error('bytesRead = ' + bytesRead);
                Lib.error('that._chunkBuffer = ' + that._chunkBuffer);
                Lib.error('_exception = ');
                Lib.error(_exception);
                Lib.error(Lib.stringify(_exception));
                Lib.error('------ DIA');
            }
            
            
            // if stream hasn't reached stream end
            if (bytesRead > -1) {
                
                // create blob chunk from buffer
                that._currentChunk = that._chunkBuffer.toBlob();
            }            
        }
        
        
        // if current chunk is defined and chunk yet had not been uploaded  
        if (Lib.type(that._currentChunk) !== 'undefined' && chunkUploaded === false) {
            
            // open HTTP connection
            that._xhr.open('POST', that._options.URL, that._options.async);
            
            
            // set MIME type / content type
            if ((that._options.contentType || '').length) {
                that._xhr.setRequestHeader('Content-Type', that._options.contentType);    
            }
            
            
            // If we need to authenticate
            if (that._options.shouldAuthenticate) {
                that._xhr.setRequestHeader('Authorization', ('Basic ' + Ti.Utils.base64encode(that._options.username + ':' + that._options.password)));
            }
            
            
            // send request
            that._xhr.send({
                chunk:                  that._currentChunk, // chunk itself as binary data

                current_chunk_number:   that._currentChunkNumber, // the index of the chunk in the current upload. First chunk is 1 (no base-0 counting here)
                total_chunk_count:      that._totalChunkCount, // total number of chunks

                chunksize:              that._chunkSize, // the general chunk size. Using this value and total_filesize you can calculate the total number of chunks. Please note that the size of the data received in the HTTP might be lower than chunksize of this for the last chunk for a file.
                
                current_chunksize:      that._currentChunk.length, // current chunk size in bytes
                
                total_filesize:         that._fileSize, // total file size.
                
                chunk_identifier:       that._currentChunkIdentifier, // chunk identifier for the file contained in the request: leading chunk number with underscore plus unique identifier eg. 01_3453475634
                
                filename:               that._options.filename, // original file name

                debug:                  +that._options.debug // the "+" results on boolean types in a number 0 (false) or 1 (true) 
            });    
        }
        else {
            
            that._onChunkUploadComplete();
        }
        
    }, 20);
    
}; // END _upload()


/**
 * Chunk upload complete callback
 * 
 * @private
 * @param {Object} _event
 * @return void
 */
DiaChunkedUploader.prototype._onChunkUploadComplete = function(_event) {
    
    // reset extant retries
    this._extantRetries = this._options.maxChunkRetries;
    
    
    // check status und define result object
    var result =                    {};
    
    result.status =                 (this._xhr.status == 200 ? 'ok' : this._xhr.status);
    result.data =                   this._xhr.responseText; 
    
    result.currentChunkNumber =     this._currentChunkNumber;
    result.currentChunkIdentifier = this._currentChunkIdentifier;
    result.uploadedChunkNumbers =   this._uploadedChunkNumbers;
    
    result.totalChunkCount =        this._totalChunkCount;
    result.totalBytesLoaded =       this._totalBytesLoaded;
    
    
        
    
    // if current chunk number is same as total chunk count
    // we can assume that all chunks had been uploaded
    // and process the drain callback
    if (this._currentChunkNumber == this._totalChunkCount && !this._isFinished) {
        
        // cleanup
        this.cleanup();
        
        // set states
        this._isFinished = true;
        
        
        // add additional information to result object
        result.fileSize =               this._fileSize;
        result.filename =               this._options.filename;
        
        
        // execute drain callback
        this._options.onDrain(result);
        
    }
    else if (!this._isFinished) {
        
        // add additional information to result object
        result.chunkSize =              this._chunkSize;

        
        // execute chunk load success callback
        this._options.onChunkLoad(result);  
        
        
        // load DiaResponse module
        var ResponseModule =    require('/model/DiaResponse'),
            response =          new ResponseModule(result.data);
        
        
        // is there a successfull response
        if (response.isSuccessfull()) {
        	
        	// load Lib module
	        var Lib = require('/lib/Lib');
     
             
    	    // Update currentChunk, currentChunkNumber 'n' currentChunkIdentifier
        	this._uploadedChunkNumbers.push(this._currentChunkNumber++);
	        this._currentChunkIdentifier = this._createChunkIdentifier(Lib.padDigits(this._currentChunkNumber, 2));
    	    this._currentChunk = undefined;
    	    this._currentChunkBytesLoaded = 0;
        
        
        	// clear buffer before fetching next chunk
	        this._chunkBuffer.clear(); 
	        
	        
	        // Continue as long as we aren't paused
	        if (this._isPaused === false) {
            
    	        this._upload();
	        }
        }
        // if there is a error response
        else {
            
            // execute chunk error callback
            this._onChunkUploadError({
                error:  response.getErrorMessage()
            });        
        }                       
    }
    
}; // END _onChunkUploadComplete()


/**
 * Chunk upload error callback
 * 
 * @private
 * @param {Object} _event
 * @return void
 */
DiaChunkedUploader.prototype._onChunkUploadError = function(_event) {
    
    // Check the status of this
    var result =                    {};
    
    result.status =                 'error';
    result.data =                   _event.error;
    
    result.code =                   this._xhr.status;
    result.response =               this._xhr.responseText;
    
    result.chunkSize =              this._chunkSize;
    result.currentChunkNumber =     this._currentChunkNumber;
    result.currentChunkIdentifier = this._currentChunkIdentifier;
    result.uploadedChunkNumbers =   this._uploadedChunkNumbers;
    result.totalChunkCount =        this._totalChunkCount;
    result.totalBytesLoaded =       this._totalBytesLoaded;
    
    result.extantRetries =          this._extantRetries;
    
    
    // execute chunk upload error callback
    this._options.onChunkError(result);
    
    // calculate total bytes loaded from actually loaded chunks
    // = (currentChunkNumber - 1)
    this._totalBytesLoaded = (this._chunkSize * (this._currentChunkNumber - 1));
    
    // reset current chunk loaded bytes
    this._currentChunkBytesLoaded = 0;
        
    // pause upload
    this.pause();
    
    
    // load Lib module
    var Lib = require('/lib/Lib');
    
    
    // DEBUG ERROR
    Lib.error('--------------------------- DIA');
    Lib.error('DiaChunkedUploader.js - _onChunkUploadError()');
    
    Lib.error('this._currentChunkNumber = ' + this._currentChunkNumber);
    Lib.error('this._totalChunkCount = ' + this._totalChunkCount);
    
    Lib.error('this._extantRetries = ' + this._extantRetries);
    Lib.error('this._extantRetries-- = ' + this._extantRetries--);
    
    Lib.error('result = ' + result);
    Lib.error('--------------------------- DIA');
    
    
    
    // check if maxChunkRetries is undefined and 
    // retry chunk upload untill maxChunkRetries is reached
    if (Lib.type(this._extantRetries) === 'number' && this._extantRetries-- > 0) {
        
        // protect "this"
        var that = this;
        
        // resume upload
        this.resume();
    }
    else {
        
        // execute upload failed callback
        this._options.onAbort(result);
    }
    
}; // END _onChunkUploadError()


/**
 * Start upload process
 * 
 * @return void
 */
DiaChunkedUploader.prototype.start = function() {
    
    // process upload
    this._upload();
    
}; // END start()


/**
 * Pause upload process
 * 
 * @return void
 */
DiaChunkedUploader.prototype.pause = function() {
    
    // set pause state if upload 
    // is not finished
    if (!this._isFinished) {
        
        this._isPaused = true;    
    }    
    
}; // END pause()


/**
 * Resume upload process
 * 
 * @return void
 */
DiaChunkedUploader.prototype.resume = function() {
    
    // set pause state
    this._isPaused = false;
    
    // process upload if it 
    // is not finished 
    if (!this._isFinished) {
        
        this._upload();    
    }
    
}; // END resume()


/**
 * Returns underlying upload client
 * 
 * @return {Ti.Network.HTTPClient} this._xhr
 */
DiaChunkedUploader.prototype.getUploadClient = function() {
    
    return this._xhr;
    
}; // END getUploadClient()


/**
 * Create a unique chunk identifier with leading _prefix from params
 * followed by an underscore, a random number with 8 digits and the
 * last 2 digits from the current unix timestamp 
 * 
 * @private
 * @param {String}
 * @return {String}
 */
DiaChunkedUploader.prototype._createChunkIdentifier = function(_prefix) {
    
    // load Lib module
    var Lib = require('/lib/Lib'),
    
        prefix = (Lib.type(_prefix) === 'string' && _prefix.length ? _prefix : '');
    
    return (prefix + '_' + Number(Lib.createRandomNumber(1, 9, 8).toString() + (Lib.getUnixNow().toString()).substr(-2)));
    
}; // END _createChunkIdentifier()


/**
 * Returns upload state (is upload process running?)
 * 
 * @return {Boolean}
 */
DiaChunkedUploader.prototype.isUploading = function() {
    
    return !this._isPaused;
    
}; // END isUploading()


/**
 * Returns upload finishing state (is upload finished?)
 * 
 * @return {Boolean}
 */
DiaChunkedUploader.prototype.isFinished = function() {
    
    return this._isFinished;
    
}; // END isFinished()


/**
 * Cleanup the uploader:
 * - close stream
 * - clear buffer
 * - release memory allocated by the buffer
 * 
 * @return void
 */
DiaChunkedUploader.prototype.cleanup = function() {
    
    // cleanup  
    this._fileStream.close();
    
    this._chunkBuffer.clear();
    this._chunkBuffer.release();
    
}; // END cleanup()


/**
 * Aborts the complete upload process
 * 
 * @return void
 */
DiaChunkedUploader.prototype.abort = function() {
    
    if (this.isUploading() && !this.isFinished()) {
        
        // pause uploader
        this.pause();
                    
        
        // Check the status and create result object
        var result =                    {};
        
        result.status =                 'abort';
        result.data =                   'manual-abort';
        
        result.code =                   (this._xhr.status || 0);
        result.response =               (this._xhr.responseText || '');
        
        result.chunkSize =              this._chunkSize;
        result.currentChunkNumber =     this._currentChunkNumber;
        result.currentChunkIdentifier = this._currentChunkIdentifier;
        
        result.uploadedChunkNumbers =   this._uploadedChunkNumbers;
        
        result.totalChunkCount =        this._totalChunkCount;
        result.totalBytesLoaded =       this._totalBytesLoaded;
        
        result.extantRetries =          this._extantRetries;
        
        
        // execute on abort callback
        this._options.onAbort(result);
    }
    
}; // END abort()


// Provide public access to CommonJS module
module.exports = DiaChunkedUploader;

