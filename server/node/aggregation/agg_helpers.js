var _  = require('underscore')._;

module.exports = {
    parent_agg : function(parent, child) {
        var pk = _.keys(parent);
        if(pk.length > 1) {
            console.log('parent_agg :: not well formed');
            return null;
        } else {
            parent[pk[0]]['aggs'] = child;
            return parent;
        }
    },

    step_out : function(child) {
        return module.exports.parent_agg({
            "step_out" : {
                "reverse_nested" : {}
            }
        }, child);
    },

    step_in : function(path, child) {
        return module.exports.parent_agg({
            "step_in" : {
                "nested" : {"path" : path}
            }
        }, child);
    },

    do_filter : function(filter, child) {
        return module.exports.parent_agg({
            "do_filter" : {
                "filter" : filter
            }
        }, child);
    }
};