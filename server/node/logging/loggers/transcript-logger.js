var _ = require('underscore')._;

var logger_helpers = require('./logger-helpers');

var _formatLine = function(req, params, cb) {
    if(logger_helpers.is_report_view(req)) {
        cb({
            "QueryId"        : params.queryId,
            "BsaIdentifier"  : req.query.id,
            "TranscriptType" : "WEB"
        })
    } else {
        cb(undefined)
    }
}

module.exports = function(config) {
    return {
        "name"       : "geofin_audit_log_transcript_file",
        "formatLine" : function(req, params, cb) {
            _formatLine(req, params, function(line) {
                if(line) {
                    cb([
                        _.chain(line).map(function(val) {return '"' + val + '"'})
                          .values()
                          .value()
                          .join('|') + '\n'
                    ])
                } else {
                    cb([])
                }
            });
        }
    }
}