module.exports = function(app, config) {
    function sendLogToMaster(req, res, next) {
        
        if(req.geofin) {
            console.log('data in logging', req.geofin.response);
        }
        
        if(next) { next();}
        process.send({
            'type' : 'log',
            'req' : {
                'user'        : req.user,
                'body'        : req.body,
                'originalUrl' : req.originalUrl,
                'query'       : req.query,
                'response'    : req.geofin ? req.geofin.response : undefined
            }
        });
    }
    
    return function(req, res, next) {
        // Don't log /-endpoints
        if(req.originalUrl.search(/^\/[^-]/) > -1) {
            sendLogToMaster(req, res, next);
        } else {
            next();
        }
    }
}