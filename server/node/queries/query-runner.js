// 2015-01-18

var _  = require('underscore')._,
 async = require('async'),
 chalk = require('chalk'),
 _s    = require('underscore.string');

var config = require('../config'),
   helpers = require('../misc/helpers')(config);

function verify(data_function, params, name) {
    // Preparation for comparing two objects
    function check_prep(aggs) {

        var keys = _(aggs).keys().filter(function(key) {return _.contains(['val', 'metric_val', 'amount'], key);});
        if(keys.length) {
            _.map(keys, function(k) {
                if(!_.isObject(aggs[k])) {
                    aggs[k] = Math.round(aggs[k]);
                }
            });
        }
        
        return helpers.descend_layer(aggs, check_prep);
    }
    
    // Test function with all query schemes
    var args = _.map(module.exports.options, function(qgen) {
        return function(cb_) {
            var params_ = _.extend(params, {"qgen" : qgen});
            data_function(params_, function(response) {
                cb_(null, response);
            });
        };
    });
    
    async.parallel(args, function(err, vals) {
        var tmp;
        var errs = 0;
        _.map(vals, function(val) {
            val = check_prep(val);
            
            if(!tmp) {
                tmp = val;
            } else {
                if(_.isEqual(val, tmp)) {
                    tmp = val;
                } else {
              
                    var s1 = JSON.stringify(tmp).replace(/^[0-9 ]/g, '');
                    var s2 = JSON.stringify(val).replace(/[^0-9 ]/g, '');
                    var dissim = _s.levenshtein(s1, s2);
                    console.log('dissim : ', dissim, ' :: ', dissim / s1.length);

                    console.log( helpers.compareString(
                        JSON.stringify(tmp, undefined, 2),
                        JSON.stringify(val, undefined, 2)
                    ));
              
                    console.log(
                        '%s %s',
                        chalk.yellow(name),
                        chalk.red('\t\txxxxxxxxxxxxxxx unverified xxxxxxxxxxxxxxx')
                    );
                    errs++;
                }
            }
        });
        
        if(!errs) {
            console.log(
                '%s %s',
                chalk.yellow(name),
                chalk.green('\t\t================ verified ================')
            );
        }
    });
}

function can_use_cache(d) {
    return _.every([
        // Cached endpoint
        _.contains(config.CACHED_PATHS, d.path),
        
        // Not exact geonames
        d.exact_geoname === false,
        
        // No user query
        _.isEqual(d.user_query, { label: 'None', value: 'none', pre_def: null })
        
        // TODO : Check if metric is computable from cache
        // TODO : Other conditions?
    ]);
}

// --



module.exports = {
    verify  : verify,
    options : [
        {
            "name"    : 'cache',
            "builder" : require('./queries')('cache'),
            "index"   : config.ELASTICSEARCH.INDEX.CACHE
        },
        {
            "name"    : 'fly',
            "builder" : require('./queries')('fly'),
            "index"   : config.ELASTICSEARCH.INDEX.DATA
        },
    ],
    qgen : function(d, cb) {
        if(!config.USE_CACHE) {
            cb(_.findWhere(module.exports.options, {"name" : "fly"}))
        } else {
            if(can_use_cache(d)) {
                cb(_.findWhere(module.exports.options, {"name" : "cache"}))
            } else {
                cb(_.findWhere(module.exports.options, {"name" : "fly"}))
            }
        }
    }
};
