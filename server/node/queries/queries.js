var _           = require('underscore')._,
   chalk        = require('chalk');

var config      = require('../config'),
    helpers     = require('../misc/helpers')(config),
    subset      = require('../subset'),
    agh         = require('../aggregation/agg_helpers');

module.exports = function(flag) {

    var add_aggs = require('../aggregation/agg_builders')(flag);
    
    return {
        nested_utility_query : function(d) {
            d = JSON.parse(JSON.stringify(d)); // Have to copy
            
            d.user_query  = d.user_query || undefined;
            d.locus_type  = helpers.resolve_locus_type(d);
            d.accuracy    = d.accuracy || 0;
            d.size        = d.size || 999; // Size of norm queries wasn't being set...
            d.nested_path = d.nested_path || config.ES_NESTED_PATH;
            
            // Added when merging with geonameid_query
            // Necessary because locus_type is used in make_subset
            d.terms_path    = d.terms_path || d.locus_type;
            d.stratify_type = (d.stratify_type === undefined) ? false : d.stratify_type;
            d.client_aggs   = d.client_aggs || [];
            
            // Merge with geonameid_query
            return subset.make_subset(d, [
                flag == 'cache' ? { "term" : { "gfmeta.agg_level" : d.locus_type } } : undefined
            ], d.nested_path, function(outer_must, nested_must) {

                var aggs = add_aggs(d, {});
                aggs     = agh.step_out(aggs);

                // Populated places
                if(d.get_locii_details) {
                    aggs['details'] = { "top_hits" : {"size" : 1} };
                }

                aggs = agh.parent_agg({
                    "locus": {
                        "terms": {
                            "field"        : d.nested_path + d.terms_path,
                            "size"         : d.size,
                            "shard_size"   : d.accuracy
                        }
                    }
                }, aggs);

                // The order of these two clauses differs between this and MSH
                if(d.stratify_type) {
                    aggs = agh.parent_agg({
                        "types" : {
                            "terms" : {
                                "field" : d.nested_path + "type.cat",
                                "size"  : 999
                            }
                        }
                    }, aggs);
                }
                
                aggs = agh.step_in(
                    d.nested_path.replace('.', ''),
                    agh.do_filter(
                        {"bool": {"must" : nested_must} },
                        aggs
                    )
                );
                
                return {
                    "query": { "filtered" : { "filter" : {"bool" : { "must" : outer_must } } } },
                    "aggs" : aggs
                };
            });
        },
        
        dissection_query : function(d, additional_outer_queries) {
            // run to find subjects in routes.js
            d.user_query             = d.user_query || undefined;
            d.locus_type             = helpers.resolve_locus_type(d);
            d.accuracy               = d.accuracy     || 0;
            
            // (*) -- IRS-DEMO --
            // Problem if we try to grab a single branch
            // Hardcode to 'gfbranch.' just for demo purposes
            var nested_path = config.ES_NESTED_PATH;
    //        var nested_path = 'gfbranch.';
            
            additional_outer_queries = _.filter(additional_outer_queries) || [];
            d.n_dissection           = d.n_dissection || 100;
        
            return subset.make_subset(d, additional_outer_queries, nested_path, function(outer_must, nested_must) {
                if(!d.form_type_field) { console.log('!!! no form_type_field provided in reports_aggregation !!!'); }

                var aggs = add_aggs(d, {});
                aggs = agh.parent_agg({
                    "sub_agg" : {
                        "terms" : {
                            "field"        : d.form_type_field,
                            "size"         : d.n_dissection,
                            "shard_size"   : d.accuracy,
                            "collect_mode" : "breadth_first"
                        }
                    }
                }, aggs);
                // Amount here is hardcoded...
                return {
                    "query" : { "filtered" : { "filter" : { "bool" : {"must" : outer_must } } } },
                    "aggs" : aggs
                };
            });
        },
        
        reports_query : function(d, additional_outer_queries, outer_conditions) {
            d.nested_path  = d.nested_path || config.ES_NESTED_PATH;
            d.user_query   = d.user_query || undefined;
            d.locus_type   = helpers.resolve_locus_type(d);
            d.accuracy     = d.accuracy     || 0;
            d.n_dissection = d.n_dissection || 100;
            
            additional_outer_queries = _.filter(additional_outer_queries) || [];
            
        // >> Must
            return subset.make_subset(d, additional_outer_queries, d.nested_path, function(outer_must, nested_must) {
                // >> Query
                    // Amount here is hardcoded...
                    var body = {
                        "size"  : d.n_reports,
                        "query" : { "filtered" : { "filter" : {"bool" : {"must": outer_must } } } },
                        "script_fields" : {
                            "total_amount": {
                                "script" : "0;"
                                // *** Temporary disabling amounts ***
//                                "script" : "var TOTAL_AMOUNT_KEYS = " + JSON.stringify(config.TOTAL_AMOUNT_KEYS) + ";var type = _doc['_type'][0]; var total_amount_key = TOTAL_AMOUNT_KEYS[type] || TOTAL_AMOUNT_KEYS['default']; doc[total_amount_key][0] || 0;",
//                                "lang"   : "javascript"
                            },
                            "date_filed" : {
                                "script" : "doc['" + config['FIELDS']['DATE'] + "'].value", 
                            }
                        }
                    };

                // >> Additional conditions (size, ...)
                    _.map(outer_conditions, function(oc) { body = _.extend(body, oc); });
                    return body;
            });
        },

        // Targeted at geographic index
        // Given geoname ids, returns Geonames entries
        pp_by_geonameid : function(params) {
            if (typeof params.ids != 'object') { params.ids = [params.ids]; }
            params.max_size = params.max_size || 1000;
            
            return {
                "_source" : ["latitude", "longitude", "asciiname", "geonameid", "clean_name"],
                "query"   : {
                                "bool" : {
                                    "must" : [
                                        {"terms" : {"geonameid" : _.flatten([params.ids])}}
                                    ]
                                }
                            },
                "size"    : params.max_size
            };
        },

        branch_by_geonameid : function(d) {
            if (typeof d.ids != 'object') { d.ids = [d.ids]; }
            d.max_size = d.max_size || 1000;
            
            return {
                "_source" : ["pred", "entity", "address", "city", "locus"],
                "query"   : {
                                "bool" : {
                                    "must" : [
                                        {"terms" : {"pred.id.cat" : _.flatten([d.ids])}}
                                    ] // against lookup
                                }
                            },
                "size" : d.max_size
            };
        },

        // Runs against ELASTICSEARCH.INDEX.DATA
        // BUG -- Need to add support for exact geoname parameter!
        // BUG -- Need to add support for form types!
        subject_geo_query : function(subject_ids, doc_ids, user_query, size) {
            size        = size || 1000;
            subject_ids = Array.isArray(subject_ids) ? subject_ids : [subject_ids];
            doc_ids     = Array.isArray(doc_ids) ? doc_ids : [doc_ids];

            var subject_term = {"terms" : {}};
            subject_term['terms'][config['FIELDS']['SUBJECT_ID']] = subject_ids;

            var doc_term = {"terms" : {}};
            doc_term['terms'][config['FIELDS']['DOC_ID']] = doc_ids;

            var bool = {
                "should" : [ subject_term, doc_term ],
                "minimum_should_match" : 1
            };

    //        if(user_query && user_query.pre_def) { bool['must'] = [ ... processed user_query ... ] };

            // Get filings for people of interest
            return {
                "_source" : ["_id", config.ES_NESTED_PATH.replace('.', '')],
                "query"   : { "bool" : bool },
                "size"    : size,
                "script_fields" : {
                    "subject_id" : {
                        "script" : "doc['" + config['FIELDS']['SUBJECT_ID'] + "'].values"
                    }
                }
            };
        }
    }
}
