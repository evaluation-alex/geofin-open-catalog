var _ = require('underscore')._;

var agh     = require('./agg_helpers'),
    config  = require('../config'),
    helpers = require('../misc/helpers')(config),
    agg_builder_factory = require('./agg_builders_factory');

module.exports = function(flag) {
    
    function amount_by_type_agg(d) {
        var out = {};
        _.chain(d.form_types)
         .filter(function(form_type) {return form_type.toggled;}) // Only toggled forms
         .map(function(form_type){ // For each toggled form
            _.chain(form_type.amount_types)
             .filter(function(amount_type) {return amount_type.toggled;}) // Only toggled amount types
             .pluck('amount_type')
             .map(function(amount_type) { // For each toggled amount type
                out[config.AMOUNT_PREFIX + helpers.clean_class(form_type.form_type) + '__' + helpers.clean_class(amount_type)] = {
                    "filter" : { "type" : { "value" : form_type.form_type } },
                    "aggs" : {
                        "amount_sum" : { "sum" : { "field" : amount_type } }
                    }
                };
            }).value();
        }).value();
        return out;
    }

    function count_agg(d, params) {
        var tmp = {
            "count" : {
                "sum" : {}
            }
        }
    
        if(flag === 'fly') {
            tmp['count']['sum']['script'] = '1;'
        } else if (flag === 'cache' ) {
            tmp['count']['sum']['field']  = 'count'
        }
    
        return tmp
    }

    function date_agg(d, params) {
        return {
            "date_agg" : {
                "date_histogram" : {
                    "field"     : config['FIELDS']['DATE'],
                    "interval"  : params.interval
                }
            }
        };
    }

    function type_agg() {
        return {
            "type_agg" : {
                "terms" : {
                    "field" : "_type",
                    "size"  : 0
                }
            }
        };
    }

    // add_aggs
    return agg_builder_factory({
        
        'amount'   : amount_by_type_agg,
        'date_agg' : date_agg,
        'count'    : count_agg,
        'type_agg' : type_agg
        
    }, {"agh" : agh})

}