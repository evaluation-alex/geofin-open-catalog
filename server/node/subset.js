var _       = require('underscore')._;

var config  = require('./config'),
    helpers = require('./misc/helpers')(config);

// <User-query>
    // Can add additional logic to prevent script insertion, etc here
    function validate_user_query(user_query) {
        if(!user_query || !user_query.pre_def) {return null;}
        
        if(user_query.pre_def.type == 'query_string') {
            return {
                "query" : {
                    "query_string" : {
                        "query" : user_query.pre_def.query.string
                    }
                }
            };
        // Not implemented yet (I don't think)
        } else if(user_query.pre_def.type == 'explicit') {
            return user_query.pre_def.query;
        } else {
            console.log('unknown user query type!');
        }
    }
// </User-query>

// <Geobound>
    // Locii within certain geobounds (using queries)
    function geobound_query(bounds, prefix) {
        return {
            "filtered": {
                "query"  : { "match_all": {} },
                "filter" : geobound_filter(bounds, prefix)
            }
        };
    }

    // Locii within certain geobounds (using filters)
    function geobound_filter(bounds, prefix) {
        prefix = prefix || '';
        var gbb = {};
        gbb[prefix + 'best.loc'] = {
            "top_left": {
                "lat": bounds._northEast.lat,
                "lon": bounds._southWest.lng
            },
            "bottom_right": {
                "lat": bounds._southWest.lat,
                "lon": bounds._northEast.lng
            }
        };
        return {"geo_bounding_box": gbb };
    }
// </Geobound>

// <Locus>
    function geo_subset(d, nested_path) {
          var locus_sub;
          
          if(d.locus_type == 'best.state') {
            geoscope = 'state';
          } else if(d.locus_type == 'best.id') {
            geoscope = 'city';
          } else if(d.locus_type == 'best.country') {
            geoscope = 'country';
          } else {
            geoscope = undefined;
          }
          
          if(d.selected_bounds !== undefined) {
            locus_sub = geobound_filter(d.selected_bounds, nested_path);

          } else if(d.selected !== undefined) {
            
            var locii = _.map(d.selected, function(x) {return x.locus_id.toLowerCase();});
            
            locus_sub = {"terms" : {}};
            if(geoscope == 'city') {
              locus_sub['terms'][nested_path + 'best.id']      = _.flatten([locii]);
            } else if (geoscope == 'state') {
              locus_sub['terms'][nested_path + 'best.state']   = _.flatten([locii]);
            } else if (geoscope == 'country') {
              locus_sub['terms'][nested_path + 'best.country'] = _.flatten([locii]);
            }

          }
          
          var extra_conditions;
          if(geoscope == 'state') {
            extra_conditions = {"terms" : {}};
            extra_conditions['terms'][nested_path + "best.country"] = ["us"];
          }

          var out = _.filter([locus_sub, extra_conditions], function(x) {return x !== undefined;});
          
          if(out.length === 0) {
            return undefined;
          } else if(out.length > 1) {
            return {"bool" : {"must" : out} };
          } else {
            return out[0];
          }
    }
// </Locus>

function check_score(exact_geoname, nested_path) {
    var out = { "range" : {} };
    out['range'][nested_path + 'best.score'] = {
        "gte" : exact_geoname ? 999 : config['ER_THRESH'][nested_path.replace('.', '')]
    };
    return out;
}

// Should make more of these private
module.exports = {
    // <Form-Parser>
        // Convert "form_type" objects into Elasticsearch queries (using filters)
        form_parser_pairs : function(form_types) {
           return _(form_types)
            .filter(function(ft) {return ft.toggled;})
            .map(function(ft) {
                return {
                    "amount_types" : _.flatten([
                        _.chain(ft.amount_types)
                            .filter(function(x) {return x.toggled;})
                            .pluck('amount_type').value()
                    ]),
                    "actors" :_.flatten([
                        _.chain(ft.locus_actors)
                            .filter(function(x) {return x.toggled;})
                            .pluck('locus_actor').value()
                    ]),
                    "type"   : ft.form_type
                };
            });
        },
        form_parser_filter : function(form_types, prefix, field_path) {
            prefix     = prefix || '';
            field_path = field_path || ((prefix || '_') + "type.cat"); // (**) Added .cat
            
            return {
                "bool" : {
                    "should" : _(module.exports.form_parser_pairs(form_types)).map(function(pr) {
                        var actors = {};
                        actors[prefix + 'locus_actor'] = pr['actors'];

                        var type = {};
                        type[field_path] = pr['type'];
                    
                    return {
                        "bool" : {
                            "must" : [
                                { "terms" : actors },
                                { "term"  : type }
                            ]}
                        };
                    })
                }
            };
        },
    // </Form-parser>

    // <Date-range>
        // Date range query (on some aggregation index)
        date_range_query : function(start_date, end_date, prefix, field_path) {
            prefix           = prefix || '';
            field_path       = field_path || (prefix + 'date');
            
            var date         = {};
            date[field_path] = { "from" : + new Date(start_date), "to" : + new Date(end_date) };
            return { "range" : date };
        },

        // Date range query (on ELASTICSEARCH.INDEX.DATA)
        outer_date_range_query : function(start_date, end_date) {
            return module.exports.date_range_query(start_date, end_date, '', config['FIELDS']['DATE']);
        },
    // </Date-range>

    // FEATURE -- Order filters by selectivity.
    make_subset : function(d, additional_outer_queries, nested_path, cb) {
        // Inner
        var fpf         = module.exports.form_parser_filter(d.form_types, nested_path);
        var locus_sub   = geo_subset(d, nested_path);
        var cs          = check_score(d.exact_geoname, nested_path);
        
        var nested_must = _.filter([locus_sub, fpf, cs], function(x) {return x !== undefined;});

        // Outer
        var date_range  = module.exports.outer_date_range_query(d.start_date, d.end_date);
        var user_query  = validate_user_query(d.user_query);
        var outer_must  = _([
            date_range,
            helpers.nested_filter(nested_path, {"bool": {"must": nested_must}}),
            additional_outer_queries,
            user_query
        ]).flatten().filter(function(x) {return x;});
    
        return cb(outer_must, nested_must);
    }
};