var _ = require('underscore')._,
 path = require('path'),
   fs = require('fs'),
 yaml = require('js-yaml');

const _INTERVAL = {
    'day'    : 10,
    'hour'   : 13,
    'minute' : 16,
    'second' : 19
}

const _EMPTYLOGTIME = {
    'day'    : 1000 * 60 * 60 * 24,
    'hour'   : 1000 * 60 * 60,
    'minute' : 1000 * 60,
    'second' : 1000
}

module.exports = function(config) {

    const INTERVAL = _INTERVAL[config.LOGGING.INTERVAL];
    const ELOGTIME = _EMPTYLOGTIME[config.LOGGING.INTERVAL];

    var LOGGERS = [
        require('./loggers/master-logger')(config),
        require('./loggers/input-logger')(config),
        require('./loggers/transcript-logger')(config)
    ];

    function currentTimeWindow() {
        //  Slice date to set time window
        return new Date().toJSON().slice(0, INTERVAL).replace(/:/g, '').replace(/-/g, '');
    }

    function updateStream(logger, cb) {
        var ctw       = currentTimeWindow();
        logger.date   = ctw;
        logger.stream = fs.createWriteStream(
            path.join(config.LOGGING.PATH, logger.name + '_') + ctw + '-' + ctw + '.txt',
            {'flags' : 'a'}
        )
        return logger;
    }

    function checkStream(logger, cb) {
        if(!logger.stream) {
            return cb(updateStream(logger)); // Initializing stream if it doesn't exist
        } else if(logger.date === currentTimeWindow()) {
            return cb(logger);               // Write to same stream if it's still current
        } else {
            logger.stream.end();
            return cb(updateStream(logger)); // Close current stream and create new stream othewise
        }
    }
    
    function logRequest(req) {
        var rightNow           = new Date();
        var queryExecutionDate = rightNow + '';
        var queryId            = (+ rightNow) + '_' + (req ? req.user : 'no_user');
        
        LOGGERS = _.map(LOGGERS, function(logger) {
            return checkStream(logger, function(logger) {
                if(!req) {
                    logger.stream.write('');
                } else {
                    logger.formatLine(req, {"queryExecutionDate" : queryExecutionDate, "queryId" : queryId}, function(lines) {
                        if(config.LOGGING.VERBOSE) {
                            lines.map(function(line) { console.log(line); });
                        }
                        
                        lines.map(function(line) { logger.stream.write(line); });
                        logger.stream.on('error', function() {
                            console.error('Error: Logger stream unable to write log object to file.');
                        });
                    });
                }
                return logger;
            });
        });
    }
    
    // Empty log files
    function setupLogFile(logtime) {
        logRequest(undefined, undefined, undefined);
        setTimeout(setupLogFile, logtime);
    }

    setupLogFile(ELOGTIME);
    return logRequest;
}
