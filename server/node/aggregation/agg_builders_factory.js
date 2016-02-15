var _ = require('underscore')._;

module.exports = function(dict, dependencies) {

    function special_client_aggs(k) {
        if(_.has(dict, k)){
            return dict[k];
        } else {
            console.log('unknown special client agg');
            return undefined;
        }
    }

    function process_client_agg(cagg, d) {
        if(cagg.type === 'special') {
            // If there's an error here, it's prbably because content doesn't match
            // any of the arguments above
            var tmp = special_client_aggs(cagg.content.id)(d, cagg.params);

            // Only goes one layer right now
            if(cagg.aggs) {
                return dependencies.agh.parent_agg(tmp, process_client_agg(cagg.aggs, d));
            } else {
                return tmp;
            }
        } else if(cagg.type === 'explicit') {
            return cagg.content;
        } else {
            console.log('process_client_agg :: malformed aggregation sent by client');
            return null;
        }
    }
    
    return function(d, aggs) {
        _.map(d.client_aggs, function(cagg) {
            aggs = _.extend(aggs, process_client_agg(cagg, d));
        });
        return aggs;
    };
};
