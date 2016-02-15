const REPORT_ENDPOINT = '/get_report';
module.exports = {
    is_report_view : function(req){
        return req.originalUrl.split('?')[0] == REPORT_ENDPOINT
    },
    
    n_returned : function(req) {
        console.log(req.geofin)
        return req.response ? req.response.total_count : 0
    },
    
    n_viewed : function(req) {
        return module.exports.is_report_view(req) ? 1 : 0
    }
}