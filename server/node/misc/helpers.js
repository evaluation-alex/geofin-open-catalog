var _ = require('underscore')._;

function flatten_keys(x, prefix) {
    if(_.keys(x).length > 0) {
        return _.map(x, function(v, k) {
            return flatten_keys(v, prefix + '.' + k);
        });
    } else {
        return prefix;
    }
}

function clean_keys(x) {
    x = x.replace(/^\./g, '');
    x = x.replace(/properties\./g, '');
    x = x.replace(/\.type$/g, '');
    return x;
}

function find_amounts(x) {
    return x.search(/amount|cash|amnt[^.]*$/) > -1;
}

function not_primitive(x) {
    return _(x).keys().filter(function(key) {
        return _.isArray(x[key]) || _.isObject(x[key]);
    });
}

module.exports = function(config) {
    return {
        
        descend_layer : function(aggs, f) {
            var nps = not_primitive(aggs);
            if(nps.length > 0) {
                _.map(nps, function(np) {
                    // If bucket, descend each bucket individually
                    if(aggs[np].buckets) {
                        aggs[np].buckets = _.map(aggs[np].buckets, function(bucket) {
                            return f(bucket);
                        });
                    // If not primitive, descend
                    } else {
                        aggs[np] = f(aggs[np]);
                    }
                });
            }
            return aggs;
        },

        amount_from_form_type : function(form_type_mapping) {
          return _.chain(flatten_keys(form_type_mapping, '')).flatten().map(clean_keys).filter(find_amounts).value();
        },
        
        handleError : function(res, error) {
            console.log('error!', error); res.status(500).send(error);
        },
        
        unnest : function(data, cb) {
            cb(
                _.map(data, function(datum) {
                    if(datum.step_out & datum.step_in) {
                        console.log('!!!! step out and step in !!!!\n!!!! I didnt think this would happen !!!!');
                    } else {
                        if(datum.step_out) {
                            datum = _.extend(datum, datum.step_out);
                            return _.omit(datum, 'step_out');
                        } else if(datum.step_in) {
                            datum = _.extend(datum, datum.step_in);
                            return _.omit(datum, 'step_in');
                        }
                    }
                })
            );
        },

        // This might be replacable by plucking and sorting
        smart_sortBy : function(x, path) {
            /* used once in routes.js. Currently commented out and not used anywhere else*/
            var out;
            if(path.match('\\.')) {
                path = path + '';
                var path_arr = path.split('.');
                out = _.sortBy(x, function(e) {
                    var out = e;
                    _.map(path_arr, function(i) {
                        out = out[i];
                    });
                    return undefined || out;
                });
            } else {
                out = _.sortBy(x, function(x) {return undefined || x[path];});
            }
            return out;
        },

        clean_class : function(str) {
            return str.replace(/\./g, '_').replace(/-/g, '_');
        },

        nested_filter : function(prefix, filter) {
            return {
                "nested" : {
                    "path" : prefix.replace('.', ''),
                    "query" : {
                        "filtered" : { "filter" : filter }
                    }
                }
            };
        },

        resolve_locus_type : function(d) {
            return d.locus_type || (d.borders_selection === 'state' ? 'best.state' : 'best.country');
        },
        
        dateToYMD : function(date) {
            var y = date.getFullYear();
            var m = date.getMonth() + 1;
            var d = date.getDate();
            return '' + y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
        },
        
        geojitter : function(x) {
            return x + config.GEOJITTER_SIZE * (Math.random() - 0.5);
        },
        
        compareString : function(s1, s2, splitChar){
            if ( typeof splitChar == "undefined" ){
                splitChar = "\n";
            }

            string1 = s1.split( splitChar );
            string2 = s2.split( splitChar );
            var diff = new Array();

            var long = s1.length > s2.length ? string1 : string2;

            for(x = 0; x < long.length; x++){
                if(string1[x]!=string2[x]){
                    diff.push(string1[x] + '-- vs --' + string2[x]);
                }
            }

            return diff;    
        }

    };
    
};
