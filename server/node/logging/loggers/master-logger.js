var _    = require('underscore')._,
    yaml = require('js-yaml'),
  moment = require('moment');

var logger_helpers = require('./logger-helpers');

const DATE_FORMAT = 'YYYYMMDDHHMMSS';

var _formatLine = function(req, params, config) {
    return {
        "UserLoginName"       : req.user,
        "QueryId"             : params.queryId,
        "QueryExecutionDate"  : moment(new Date(params.queryExecutionDate)).format(DATE_FORMAT),
        "QueryCriteria"       : config.LOGGING_OBJECT == 'yaml' ?
                                    yaml.dump(req.body).replace(/\n/g, ' ') :
                                    JSON.stringify(req.body).replace(/"/g, '\\"'),
        
        "QueryNumberOfResultsReturnedCount" : logger_helpers.n_returned(req),
        "QueryNumberOfResultsViewedCount"   : logger_helpers.n_viewed(req)
    }
}

module.exports = function(config) {
    return {
        "name"       : "geofin_audit_log_master_file",
        "formatLine" : function(req, params, cb) {
            cb([
                _.chain(_formatLine(req, params, config)).map(function(val) {return '"' + val + '"'})
                  .values()
                  .value()
                  .join('|') + '\n'
            ])
        }
    }
}
