
var _       = require('underscore')._,
    config  = require('./config'),
    helpers = require('./misc/helpers')(config);

function escape_special(aggs, special) {
    var keys = _.has(aggs, special);
    if(keys) { aggs = aggs[special]; }
    return helpers.descend_layer(aggs, function(x) {return escape_special(x, special);});
}

function merge_special(aggs, special) {
    var special_flat = _.flatten(special);
    var keys         = _(aggs).keys().filter(function(key) {return _.contains(special_flat, key);});

    if(keys.length) {
        _.map(keys, function(k) {
            aggs = _.chain(aggs).extend(aggs[k]).omit(k).value();
        });
    }
    return helpers.descend_layer(aggs, function(x) {return merge_special(x, special_flat);});
}

function preprocess_amounts(aggs) {
    // Keys for amount aggregations
    var keys = _(aggs)
                .keys()
                .filter(function(key) {return key.match(config.AMOUNT_PREFIX) !== null;});
    
    // If there are any, add them up and discard
    // the originals
    if(keys.length > 0) {
        aggs.amount = _(keys).map(function(key) {
            return aggs[key].amount_sum;}).reduce(function(x, y) {
                return x + y;}, 0);
        aggs = _.omit(aggs, keys);
    }
    
    return helpers.descend_layer(aggs, preprocess_amounts);
}

// Can we just get rid of doc_counts altogether?  They're not going to work with MSHing...
function preprocess_counts(aggs) {
    var keys = _.has(aggs, 'doc_count');
    if(keys){
        delete aggs['doc_count'];
    }
    return helpers.descend_layer(aggs, preprocess_counts);
}

// If you nest an inner aggregation inside of an outer aggregation
// BUG: This overwrites the doc_count in the layer above it...
function preprocess_nested_inner(aggs) {
    var keys = _(aggs).keys().filter(function(key) {return key === 'step_in_inner';});
    if(keys.length) {
        var k = keys[0];
        _.map(_.keys(aggs[k]), function(inner_key) {
            aggs[inner_key] = aggs[k][inner_key];
        });
        aggs = _.omit(aggs, k);
    }
    return helpers.descend_layer(aggs, preprocess_nested_inner);
}

// Handling the aggregations we can currently add
function preprocess_avgs(aggs) {
    var keys = _.has(aggs, 'step_out_avg');
    if(keys){
        aggs = aggs['step_out_avg']['inner'];
    }
    return helpers.descend_layer(aggs, preprocess_avgs);
}

function delete_field(aggs, field) {
    var keys = _.has(aggs, field);
    if(keys){
        delete aggs[field];
    }
    return helpers.descend_layer(aggs, function(x) { return delete_field(x, field); });
}

function preprocess_vals(aggs, metric_type) {
    var keys = _.has(aggs, metric_type);
    if(keys){
        aggs['metric_val'] = aggs[metric_type];
    }
    return helpers.descend_layer(aggs, function(x) { return preprocess_vals(x, metric_type); });
}

function preprocess_details(aggs) {
    var keys = _.has(aggs, 'details');
    if(keys){
        aggs['details'] = aggs['details']['hits']['hits'][0]['_source']['best'];
    }
    return helpers.descend_layer(aggs, function(x) { return preprocess_details(x); });
}

module.exports = {
    // This should probably not be so blocking
    do_prep : function(aggs, metric_type, unnest, cb) {

        aggs = delete_field(aggs, 'key_as_string');
        aggs = delete_field(aggs, 'doc_count');
        
        aggs = escape_special(aggs, 'value');
        aggs = escape_special(aggs, 'do_filter');
        aggs = escape_special(aggs, 'step_in_inner');
        
        aggs = preprocess_amounts(aggs);
        aggs = preprocess_avgs(aggs);
        aggs = preprocess_details(aggs);
        
        if(metric_type) {
            aggs = preprocess_vals(aggs, metric_type);
        }
        if(unnest) {
            aggs = merge_special(aggs, ['step_in', 'step_out']); // This seems a little slow...
        }
        cb(aggs);
    },

    // Set all numeric keys to the value of a certain "superkey"
    // Create additional keys as needed
    // Looks like top level needs to be an object?
    do_superkey : function(aggs, superkey, additional_keys) {
        var keys = _.has(aggs, superkey);
        if(keys){
            var allkeys = _.without( _.flatten([_.keys(aggs), additional_keys]), 'key');
            _.map(allkeys, function(k) {
                if(_.isNumber(aggs[k]) || !aggs[k]) {
                    aggs[k] = aggs[superkey];
                }
            });
        }
        return helpers.descend_layer(aggs, function(x) {return module.exports.do_superkey(x, superkey, additional_keys);});
    }
};
