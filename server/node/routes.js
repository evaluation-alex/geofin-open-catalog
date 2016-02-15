module.exports = function(app, client, config, borders) {

    var _ = require('underscore')._,
    chalk = require('chalk'),
    async = require('async');
    
    var qrunner = require('./queries/query-runner'),
            fly = require('./queries/queries')('fly')
        helpers = require('./misc/helpers')(config),
 deep_normalize = require('./misc/deep_normalize'),
           prep = require('./preprocessors');

    // <utilities>
    function handleError(res, error) {
        console.log('error!', error); res.status(500).send(error);
    }

    // Need to find a proper home for these
    function format_timeseries(x, ts_params, metric_type) {
        return {
            'data'        : x.date_agg.buckets,
            'ymax'        : ts_params.max_val,
            'xmin'        : ts_params.min_date,
            'xmax'        : ts_params.max_date,
            'metric_type' : metric_type
        };
    }

    // Add missing types, when necessary
    function format_type_agg(x, all_types) {
        return {
            "types" : _.chain(all_types)
                .map(function(t) {
                    return _.findWhere(x.type_agg.buckets, {'key' : t}) || {'key' : t, 'metric_val' : 0}
                }).sortBy('key').value()
        }
    }
    // </utilities>

    // <normalization>
    function normalize_data(is_global, d, aggs, cb){
        get_norm_data(d, function(norm_data) {
            norm_preprocess({
                "norm_data"   : norm_data,
                "norm"        : d.norm,
                "metric_type" : d.metric_type,
                "is_global"   : is_global
            }, function(norm_data) {
                deep_normalize(aggs, norm_data, cb);
            });
        }, function(error) { handleError(res, error); });
    }

    function get_norm_data(d, cb) {
        var normable = ['fetch_global', 'fetch_locus', 'fetch_populated_places', 'fetch_branches', 'fetch_dissection'];

        return qrunner.qgen(d, function(qgen) {
            if(_.contains(normable, d.path)) {

                var bq;
                if(d.path === 'fetch_dissection'){
                    bq = fly.dissection_query(d.norm.def.query);
                } else {
                    bq = qgen.builder.nested_utility_query(d.norm.def.query);
                }
                
                client.search({
                    index      : qgen.index,
                    body	   : bq,
                    searchType : "count",
                    queryCache : true
                }).then(cb);
                
            } else {
                console.log('!! normalization on this endpoint is unsupported !!');
                cb();
            }
        });
    }

    function norm_preprocess(params, cb) {
        prep.do_prep(params.norm_data.aggregations, params.norm.value, !params.is_global, function(aggs) {
            aggs = prep.do_superkey(aggs, 'metric_val', [params.metric_type_for_superkey]);

            if(params.is_global) {
                helpers.unnest(aggs.step_in.locus.buckets, cb);
            } else {
                cb(aggs);
            }
        });
        
    }
    // </normalization>

    // <GET>
    // Status message
    app.get('/status', function(req, res) { res.send('strategic node server is running...'); });

    app.get('/get_borders', function(req, res, next) {
        console.log('))) get_borders');
        res.send(borders);
        next();
    });

    // Send form types for control
    app.get('/fetch_form_types', function(req, res, next) {
        console.log('))) fetch_form_types');

        // MAPPING_FROM : name of index that we get form type mappings from
        var MAPPING_FROM = config.ELASTICSEARCH.INDEX.DATA;
        
        client.indices.getMapping({
            "index" : MAPPING_FROM
        }).then(function(mapping) {
            var form_types = _.chain(mapping[MAPPING_FROM].mappings).map(function(v, k) {
                return {
                    "form_type"       : k,
                    "form_type_label" : k.replace('type_', '').toUpperCase(),
                    "toggled"         : !_.contains(config.DEFAULT_BLACKLIST_TYPES, k),
                    "amount_types"    : _.map(helpers.amount_from_form_type(v.properties) || [], function(amount_type) {
                        return {
                            "amount_type" : amount_type,
                            "toggled"     : amount_type == (config.TOTAL_AMOUNT_KEYS[k] || config.TOTAL_AMOUNT_KEYS['default']),
                            "id"          : helpers.clean_class(amount_type)
                        }
                    }),
                    "locus_actors"    : _.map(config.LOCUS_ACTOR_OPTIONS, function(locus_actor) {
                        return {
                            "locus_actor" : locus_actor,
                            "toggled"     : locus_actor == config.DEFAULT_LOCUS_ACTOR,
                            "id"          : helpers.clean_class(locus_actor)
                        }
                    })
                };
            })
            .filter(function(x) {return x != undefined})
            .sortBy('form_type')
            .value()
            
            res.send({ 'form_types' : form_types });
            next();
        }, function(error) { handleError(res, error); });
    });

    // <mappings>
    function enumerate_fields(prefix, value, key) {
        if(!value) {
            return;
        } else if(!value.properties) {
            return {"field" : [prefix, key].join('.').slice(1), "type" : value.type};
        } else {
            prefix = [prefix, key].join('.');
            return _.map(value['properties'], function(value2, key2) {
                return enumerate_fields(prefix, value2, key2);
            });
        }
    }

    // Grabs mapping for all form types, not just toggled...
    app.post('/fetch_form_type_fields', function(req, res, next) {
        var d             = req.body,
            MAPPING_FROM  = config.ELASTICSEARCH.INDEX.DATA,
            all_forms     = [];

        async.each(
            _(d.form_types).pluck('form_type'),
            function(form_type_name, callback) {
                client.indices.getMapping({
                    'index' : MAPPING_FROM,
                    'type'  : form_type_name
                }).then(function(mapping) {
                    all_forms.push(
                        _.chain(mapping[MAPPING_FROM]['mappings'][form_type_name]['properties'])
                            .map(function(value, key) { return enumerate_fields('', value, key); })
                            .flatten()
                            .value()
                    );
                    callback();
                });
            },
            function(err) {
                if(err) {handleError(res, error);}

                res.send(
                    _.chain(all_forms)
                        .flatten()
                        .map(JSON.stringify)
                        .uniq()
                        .map(JSON.parse)
                        .value()
                );
                next();
            }
        );
    });
    // </mappings>
    // <POST>

    function generic_query(func, req, res, next, d) {
        qrunner.qgen(d, function(qgen) {
            func({"d" : d, "qgen" : qgen}, function(response) {
                res.send(response);
                next();
            }, function(error) { handleError(res, error); });
            
            if(config['VERIFY']) { qrunner.verify(func, {"d" : d}, d.path); }
        });
    }

    // <fetch-global>
    function fetch_global_format(locii, cb) {

        // Drop {}'s
        locii = _.filter(locii, function(x) { return _.keys(x).length > 0; });

        var out = [];
        if(locii.length > 0) {
            // Compute ranks
            var ranks = {};
            _.map(_.keys(locii[0]), function(key) {
                ranks[key] = _.chain(locii)
                .pluck(key)
                .filter(function(x) {return x !== undefined && x !== null;})
                .sortBy(function(x) {return x;})
                .value();
            });

            // Add ranks to data
            out =  _.chain(locii)
                .map(function(locus) {
                    if(locus.key) {
                        var tmp = {'locus_id' : locus.key.toUpperCase()};
                        _.map(_.difference(_.keys(locii[0]), ['key']), function(key) {
                            tmp[key] = {
                                "val"  : locus[key],
                                "rank" : ranks[key].length - _.sortedIndex(ranks[key], locus[key])
                            };
                        });
                        return tmp;
                    }
                })
            .filter(function(x) {return x !== undefined && x !== null;})
            .sortBy(function(x) { return x.metric_val === undefined ? 0 : -x.metric_val.val;})
            .value();
        }

        cb( out );
    }

    function fetch_global(params, cb, err) {
        var d    = params.d;
        var qgen = params.qgen;

        console.log(
            '%s >> %s >> %s',
            chalk.green('fetch_global'),
            chalk.yellow(qgen.index),
            JSON.stringify(qgen.builder.nested_utility_query(d))
        );

        client.search({
            index      : qgen.index,
            body       : qgen.builder.nested_utility_query(d),
            searchType : "count",
            queryCache : true
        }).then(function(data) {
            prep.do_prep(data.aggregations, d.metric_type, false, function(aggs) {

                helpers.unnest(aggs.step_in.locus.buckets, function(locii) {

                    if(d.norm && d.norm.def && d.norm.def.type) {

                        d.norm.def.query.size          = d.size;
                        d.norm.def.query.stratify_type = d.stratify_type;
                        
                        normalize_data(true, d, locii, function(locii){
                            fetch_global_format(locii, function(x) {
                                cb(x);
                            });
                        });
                    } else {
                        fetch_global_format(locii, function(x) {
                            cb(x);
                        });
                    }
                });
            });
        }, err);
    }

    app.post('/fetch_global', function(req, res, next) {
        generic_query(fetch_global, req, res, next, _.extend(req.body, {
            "size"          : 999,
            "stratify_type" : false
        }));
    });
    // </fetch-global>

    // <locus>
    function fetch_locus_format(types, d, cb) {
        types = _.filter(types, function(x) {
            return !_.isEqual(x, {}) & x.locus.buckets.length > 0;
        });

        var totals = {
            "type"  : {},
            "locus" : {},
            "type_total" : {
                "total_count" : 0
            }
        };
        
        var min_date = + new Date(d.start_date);
        var max_date = + new Date(d.end_date);
        var max_val = _.max(_.map(types, function(x) {
            return _.max(_.map(x.locus.buckets, function(y) {
                return _.max(_.map(y.date_agg.buckets, function(bucket) {
                    return bucket['metric_val'];
                }));
            }));
        }));

        if(types.length > 0) {
            // Calculating totals
            _.map(types, function(type) {
                totals['type'][type.key] = {};
                totals['type'][type.key]['total_count']  = 0;
                totals['type'][type.key]['timeseries']   = {};

                _.map(type.locus.buckets, function(locus) {
                    totals['type'][type.key]['total_count'] += locus['metric_val'];
                    totals['type_total']['total_count']     += locus['metric_val'];

                    if(!totals['locus'][locus.key]) {
                        totals['locus'][locus.key] = {};
                        totals['locus'][locus.key]['total_count'] = 0;
                    }
                    totals['locus'][locus.key]['total_count'] += locus['metric_val'];

                    _.map(locus.date_agg.buckets, function(bucket) {
                        if(totals['type'][type.key]['timeseries'][bucket.key]) {
                            totals['type'][type.key]['timeseries'][bucket.key] += bucket['metric_val'];
                        } else {
                            totals['type'][type.key]['timeseries'][bucket.key] = bucket['metric_val'];
                        }
                    });
                });
            });

            var total_counts  = _.chain(totals['type']).pluck('total_count').sortBy(function(x) {return x;}).value();

            var level1 = _.chain(types).map(function(type) {

                var all_counts = _.chain(type.locus.buckets).pluck('metric_val').sortBy(function(x) {return x;}).value();

                var children   = _.chain(type.locus.buckets).map(function(locus) {

                    var count            = locus['metric_val'];
                    var pct_locus_count  = Math.round(1000 * count / totals['locus'][locus.key]['total_count']) / 10;

                    var timeseries = {
                        'data'        : locus.date_agg.buckets,
                        'ymax'        : max_val,
                        'xmin'        : min_date,
                        'xmax'        : max_date,
                        'metric_type' : d.metric_type
                    };

                    var count_rank  = all_counts.length - _.sortedIndex(all_counts, count);

                    return {
                        'group_name'  : "Country",
                        'group_value' : locus.key.toUpperCase(), // Add country name
                        'level' : 2,
                        'values' : [
                            {
                                "value"      : count,
                                "pct"        : pct_locus_count,
                                "rank"       : count_rank,
                                "value_type" : "count"
                            },
                            {
                                "timeseries" : timeseries,
                                "metric_type": d.metric_type
                            }
                        ]
                    };
                })
                .sortBy(function(x) { return x.values[0]['value']; })
                .value()
                .reverse();

                var pct_of_total_count = Math.round(1000 * totals['type'][type.key]['total_count'] / totals['type_total']['total_count']) / 10;
                var total_count_rank   = total_counts.length - _.sortedIndex(total_counts, totals['type'][type.key]['total_count']);

                return {
                        "group_name"  : "Type",
                        "group_value" : type.key.toUpperCase().replace('TYPE_', ''),
                        "level"       : 1,
                        "values" : [
                        {
                            "value"      : totals['type'][type.key]['total_count'],
                            "pct"        : pct_of_total_count,
                            "rank"       : total_count_rank,
                            "value_type" : "count"
                        },
                        {
                            "timeseries" : {
                                "metric_type" : d.metric_type,
                                "data" : _.map(totals['type'][type.key]['timeseries'], function(metric, date) {
                                    return {
                                        "key"        : parseInt(date, 10),
                                        "metric_val" : metric
                                    }
                                }),
                                "ymax" : max_val,
                                "xmin" : min_date,
                                "xmax" : max_date
                            },
                        }
                    ],
                    "children" : children
                };
            })
            .sortBy(function(x) { return x.values[0].value; })
            .value()
            .reverse();

            cb({
                "root" : {
                    "group_value" : "Total",
                    "level"       : 0,
                    "children"    : level1
                },
                "grouping_factors": [
                    { "display_name" : "Type"    },
                    { "display_name" : "Country" }
                ],
                "value_factors": [
                    {
                        "display_name"   : "'" + d.metric_type + "' (% of Total)", // Not sure that % of total makes sense with normalization
                        "is_time_series" : false
                    },
                    {
                        "display_name"   : "'" + d.metric_type + "' over Time",
                        "is_time_series" : true
                    }
                ]
            });
        } else {
            cb({});
        }
    }

    // Get statistics about certain locus
    function fetch_locus(params, cb, err) {
        var d = params.d,
         qgen = params.qgen;

        console.log(
            '%s >> %s >> %s',
            chalk.green('fetch_locus'),
            chalk.yellow(qgen.index),
            JSON.stringify(qgen.builder.nested_utility_query(d))
        );

        client.search({
            index      : qgen.index,
            body       : qgen.builder.nested_utility_query(d),
            searchType : "count",
            queryCache : true
        }).then(function(data) {

            prep.do_prep(data.aggregations, d.metric_type, true, function(aggs) {

                // Normalization step needs to be tested for accuracy
                if(d.norm && d.norm.def && d.norm.def.type) {

                    d.norm.def.query.stratify_type = d.stratify_type;
                    d.norm.def.query.size          = d.size;

                    normalize_data(null, d, aggs, function(aggs){
                        fetch_locus_format(aggs.types.buckets, d, function(x) {
                            cb(x);
                        });
                    });
                } else {
                    fetch_locus_format(aggs.types.buckets, d, function(x) {
                        cb(x);
                    });
                }
            }); // This flag bundles a recursive unnest
        }, err);
    }

    app.post('/fetch_locus', function(req, res, next) {
        generic_query(fetch_locus, req, res, next, _.extend(req.body, {
            "size"          : 999,
            "stratify_type" : true
        }));
    });
    // </fetch-locus>

    // <cities+branches>
    // Get wordwide statistics for certain time range
    function fetch_ent_format(aggs, d, cb, err) {
        // Setup time series
        var ts_params = {
            "min_date" : + new Date(d.start_date),
            "max_date" : + new Date(d.end_date),
            "max_val"  : _.max(_.map(aggs.locus.buckets, function(x) {
                if(!x.date_agg) {
                    return 0;
                } else {
                    return _.max(_.pluck(x.date_agg.buckets, 'metric_val'));
                }
            }))
        };

        // Setup type
        var all_types = _(d.form_types).pluck('form_type');

        cb(
            _.chain(aggs.locus.buckets)
                .map(function(locus) {
                    return fetch_ent_geojson(locus['details'], locus, ts_params, d.metric_type, all_types);
                })
                .filter()
                .sortBy(function(x) {return x.properties.metric_val;})
                .value()
                .reverse()
        );
    }

    // Augments geopoint data from ES_GEO_INDEX
    function fetch_ent_geojson(geopoint, matching_locus, ts_params, metric_type, all_types) {
        var field_names = {
            'locus_id_city'    : 'clean_name',
            'locus_id_branch'  : 'locus',
            'city_name_city'   : 'asciiname',
            'city_name_branch' : 'city',
            'branch_name'      : 'entity'
        };

        var timeseries, types, keys;
        if(matching_locus) {

            // These are hardcoded and should be fixed
            geopoint.locus_id    = geopoint[field_names['locus_id_city']] || geopoint[field_names['locus_id_branch']]; // Fix name
            geopoint.city_name   = geopoint[field_names['city_name_city']] || geopoint[field_names['city_name_branch']]; // Cities and branches
            geopoint.branch_name = geopoint[field_names['branch_name']]; // Branches

            // Add scalar + character values to geopoint
            _.chain(matching_locus)
                .keys()
                .filter(function(k) {return !(_.isArray(matching_locus[k]) || _.isObject(matching_locus[k]));})
                .map(function(k) {
                    geopoint[k] = matching_locus[k];
                });

            // Create time series, if any
            if(matching_locus.date_agg) {
                timeseries = format_timeseries(matching_locus, ts_params, metric_type);
            }
            // Create type histogram, if any
            if(matching_locus.type_agg) {
                ftype = format_type_agg(matching_locus, all_types);
            }
        }

        var coordinates;
        if(geopoint.loc) {
            coordinates = [
                helpers.geojitter( geopoint.loc.lon ),
                helpers.geojitter( geopoint.loc.lat )
            ];
        }

        return {
                "type"        : "Feature",
                "properties"  : geopoint,

                "timeseries"  : timeseries,
                "types"       : ftype.types,

                "geometry"    : {
                    "type"        : "Point",
                    "coordinates" : coordinates
                }
        };
    }

    // What if the support of the normalization dataset and the regular dataset are different?
    // Need to somehow add an "override" selector on the normalization dataset...
    function fetch_ent(params, cb, err) {
        var d    = params.d,
            qgen = params.qgen;

        console.log(
            '%s >> %s >> %s',
            chalk.green('fetch_ent'),
            chalk.yellow(qgen.index),
            JSON.stringify(qgen.builder.nested_utility_query(d))
        );

        client.search({
            index      : qgen.index,
            body       : qgen.builder.nested_utility_query(d),
            searchType : "count",
            queryCache : true
        }).then(function(data) {

            prep.do_prep(data.aggregations, d.metric_type, true, function(aggs) {

                var eub = aggs.locus.doc_count_error_upper_bound;

                if(d.norm && d.norm.def && d.norm.def.type) {

                    d.norm.def.query.stratify_type     = d.stratify_type;
                    d.norm.def.query.nested_path       = d.nested_path;
                    d.norm.def.query.terms_path        = d.terms_path;
                    d.norm.def.query.get_locii_details = d.get_locii_details;   

                    normalize_data(false, d, aggs, function(aggs){
                        fetch_ent_format(aggs, d, function(data){
                            cb({
                                "eub"  : eub,
                                "data" : data
                            });
                        }, err);
                    });
                } else {
                    fetch_ent_format(aggs, d, function(data) {
                        cb({
                            "eub"  : eub,
                            "data" : data
                        });
                    }, err);
                }
            });
        });
    }

    app.post('/fetch_populated_places', function(req, res, next) {
        generic_query(fetch_ent, req, res, next, _.extend(req.body, {
            "stratify_type"     : false,
            "terms_path"        : config['FIELDS']['PP_TERMS'],
            "nested_path"       : config.ES_NESTED_PATH,
            "get_locii_details" : true,
        }));
    });

    app.post('/fetch_branches', function(req, res, next) {
        generic_query(fetch_ent, req, res, next, _.extend(req.body, {
            "stratify_type"     : false,
            "terms_path"        : config['FIELDS']['BRANCH_TERMS'],
            "nested_path"       : config.ES_NESTED_PATH_BANK,
            "get_locii_details" : true
        }));
    });
    // </cities+branches>


    // <subjects>
    function fetch_dissection_format(aggs, d, cb) {
        // Setup time series
        var ts_params = {
            "min_date" : + new Date(d.start_date),
            "max_date" : + new Date(d.end_date),
            "max_val"  : _.max(_.map(aggs.sub_agg.buckets, function(x) {
                return _.max(_.pluck(x.date_agg.buckets, 'metric_val'));
            }))
        };
        
        // Setup type
        var all_types = _.pluck(d.form_types, 'form_type');
        var diss_agg  = _.map(aggs.sub_agg.buckets, function(disspoint) {
            var timeseries, types, keys;

            // Create time series, if any
            if(disspoint.date_agg) {
                timeseries = format_timeseries(disspoint, ts_params, d.metric_type);
            }
            
            // Create type histogram, if any
            if(disspoint.type_agg) {
                ftype = format_type_agg(disspoint, all_types);
            }

            return _.extend(disspoint, {
                "timeseries" : timeseries,
                "types"      : ftype.types
            });
        });

        cb(diss_agg);
    }

    // Dissection in one shot
    app.post('/fetch_dissection', function(req, res, next) {
        /* Need to use fly.dissection_query to write properly formated ES queries */	
        var d = req.body;
        d.n_reports = 0;

        var additional_outer_queries = [];

        if(d.subject_query) {
            additional_outer_queries.push({"query" : {"match_phrase" : {"_all" : d.subject_query}}});
        }

        var flyBody = fly.dissection_query(d, additional_outer_queries);
        console.log(chalk.green(">> fetch_dissection >> "), JSON.stringify(flyBody));

        client.search({
            index          : config.ELASTICSEARCH.INDEX.DATA,
            body           : flyBody,
            searchType     : "count",
            queryCache     : true
        }).then(function(data) {
            prep.do_prep(data.aggregations, d.metric_type, true, function(aggs) {

                var eub = aggs.sub_agg.doc_count_error_upper_bound;

                if(d.norm && d.norm.def && d.norm.def.type) {
                    
                    normalize_data(null, d, aggs, function(aggs){
                        fetch_dissection_format(aggs, d, function(data) {
                            res.send({
                                'eub'  : eub,
                                'data' : data
                            });
                            next();
                        });
                    });
                } else {
                    fetch_dissection_format(aggs, d, function(data) {
                        res.send({
                            'eub'  : eub,
                            'data' : data
                        });
                        next();
                    });
                }
            });
        }, function(error) { handleError(res, error); });
    });
    // </subjects>

    // <subject-geographic>
    function get_augmented(augmentation_type, single_subject_id, callback) {
        if(augmentation_type && augmentation_type != 'none') {
            client.get({
                index : config.ELASTICSEARCH.INDEX.AUGMENT,
                type  : "subject_augment",
                id    : augmentation_type
            }).then(function(augmentation_data) {
                callback({
                    // Get associated ID from file
                    "subject_ids" : _.chain(augmentation_data._source.edges)
                    .filter(function(x) {return _.contains(x, single_subject_id) && x[2] === 'subject_id';})
                    .map(function(x) {return x[1];})
                    .flatten()
                    .uniq()
                    .difference(single_subject_id)
                    .value(),
                // Get associated filings from file
                "filings" : _.chain(augmentation_data._source.edges)
                    .filter(function(x) {return _.contains(x, single_subject_id) && x[2] === 'filing';})
                    .map(function(x) {return x[1];})
                    .flatten()
                    .uniq()
                    .value()
                });
            }, function(error) { handleError(res, error); });
        } else {
            callback({"subject_ids" : [], "filings" : []});
        }
    }

    app.post('/fetch_subject_geo', function(req, res, next) {
        var d = req.body;
        console.log('))) fetching bad actor geo', d);

        get_augmented(d.augmentation_type, d.single_subject, function(augment) {
            d.augment_subject_ids = augment.subject_ids;
            d.augment_filings     = augment.filings;
            var subject_ids = _.uniq( _.flatten( [d.single_subject, d.augment_subject_ids] ) );

            client.search({
                index : config.ELASTICSEARCH.INDEX.DATA,
                body  : fly.subject_geo_query(subject_ids, d.augment_filings, d.user_query, d.size)
            }).then(function(response) {

                var geojson = _.chain(response.hits.hits).map(function(hit) {
                    var properties =  {
                        "id"                  : hit['_id'],
                        "original_subject_id" : _.contains(_.flatten(hit['fields']['subject_id']), d.single_subject),
                        "augment_subject_id"  : _.intersection(d.augment_subject_ids, _.flatten(hit['fields']['subject_id']) ).length > 0,
                        "augment_filing"      : _.contains(d.augment_filings, hit['_id']),
                    };

                    return _.map(hit['_source'][config.ES_NESTED_PATH.replace('.', '')], function(locus) {
                        if(locus.best.id) {
                            if(!locus.best.loc) {
                                console.log('NO RESOLVED LOCATION INDEX FOR: ', hit['_id']);

                            } else if(!d.exact_geoname || locus.best.exact) {
                                var _properties = JSON.parse(JSON.stringify(properties)); // Isn't there a better way to copy?
                                _properties["city_name"]   = locus.best.city;
                                _properties["locus_actor"] = locus.locus_actor;
                                _properties["form_type"]   = locus.type;

                                return {
                                    "type" : "Feature",
                                    "geometry" : {
                                       "type" : "Point",
                                        "coordinates" : [
                                            helpers.geojitter(locus.best.loc.lon),
                                            helpers.geojitter(locus.best.loc.lat)
                                        ]
                                    },
                                    "properties" : _properties
                                }
                            }
                        }
                    });
                })
                .flatten()
                .filter(function(x) {return x !== null;})
                .value();

                // DDDemo -- for faking auxillary geographic data
                //                function second(inp) {
                //                    console.log('_________ second then');
                //                    
                //                    var d    = inp.d
                //                    var subject_ids = inp.subject_ids;
                //                    
                //                    client.search({
                //                        index : config.DDDEMO_INDEX,
                //                        body  : subject_geo_query(subject_ids, d.augment_filings, d.user_query, d.exact_geoname, d.size)
                //                    }).then(function(dddemo_response) {
                //                    
                //                        var geojson2 = _.chain(dddemo_response.hits.hits).map(function(hit) {
                //                            var properties =  {
                //                                "id"             : hit['_id'],
                //                                "original_subject_id"   : _.contains(_.flatten(hit['fields']['subject_id']), d.single_subject.key),
                //                                "augment_subject_id"    : _.intersection(d.augment_subject_ids, _.flatten(hit['fields']['subject_id']) ).length > 0,
                //                                "augment_filing" : _.contains(d.augment_filings, hit['_id']),
                //                            }
                //                            
                //                            return _.map(hit['_source'][config.ES_NESTED_PATH.replace('.', '')], function(locus) {
                //                                if(locus.best.id) {
                //                                    var _properties = JSON.parse(JSON.stringify(properties))
                //                                    _properties["city_name"]   = locus.best.city;
                //                                    _properties["locus_actor"] = locus.locus_actor;
                //                                    _properties["form_type"]   = locus.type;
                //                                  
                //                                    return {
                //                                        "type" : "Feature",
                //                                        "geometry" : {
                //                                            "type" : "Point",
                //                                            "coordinates" : [
                //                                                helpers.geojitter(locus.best.loc.lon),
                //                                                helpers.geojitter(locus.best.loc.lat)
                //                                            ]
                //                                        },
                //                                        "properties" : _properties
                //                                    }
                //                                }
                //                            });
                //                        })
                //                        .flatten()
                //                        .filter(function(x) {return x != null})
                //                        .value();
                //                        
                //                        console.log('>> geojson from second step', geojson2);
                //
                //                        inp['res'].send({
                //                            "type"     : "FeatureCollection",
                //                            "features" : _.flatten([geojson2, inp['geojson']])
                //                        });
                //                    });
                //                };

                //                second({
                //                    "d"       : d,
                //                    "subject_ids"    : subject_ids,
                //                    "res"     : res,
                //                    "geojson" : geojson
                //                });

                // Normal
                res.send({"data" : geojson});
                next();

            }, function(error) { handleError(res, error); });
        });
    });


    // >> Fetch Reports
    function sort_command(key, reverse) {
        var dict = {
            'id'           : ["doc['" + config['FIELDS']['DOC_ID'] + "'].value", "string"],
            'type'         : ["doc['_type'].value", "string"],
            'date_filed'   : ["doc['" + config['FIELDS']['DATE'] + "'].value", "number"],
            // ** Temporarily disabling sorting by form types **
//            'total_amount' : ["var TOTAL_AMOUNT_KEYS = " + JSON.stringify(config.TOTAL_AMOUNT_KEYS) + ";var type = _doc['_type'][0];var total_amount_key = TOTAL_AMOUNT_KEYS[type] || TOTAL_AMOUNT_KEYS['default']; doc[total_amount_key][0] || 0;", "number"]
        };

        if(dict[key]) {
            var cmd = {"sort" : {"_script" : { "order" : (reverse ? 'asc' : 'desc')}}};
            cmd['sort']['_script']['script'] = dict[key][0];
            cmd['sort']['_script']['type']   = dict[key][1];
            return cmd;
        }
    }

    // Reports for a country or city
    app.post('/fetch_reports', function(req, res, next) {
        var d = req.body;
        
        // Setting type-specific properties
        // I imagine this could be cleaned up
        if(d.data_type === 'subject') {
            d = _.extend(d, {
                'key'             : d.single_subject.key,
                "search_field"    : config['FIELDS']['SUBJECT_ID'],
                'selected'        : undefined, // If you comment this line, it'll just show reports in the selected region
                'selected_bounds' : undefined, // ''
            });
        } else if(d.data_type === 'city') {
            d = _.extend(d, {
                'locus_type'      : 'best.id',
                'selected'        : [{"locus_id" : d.selected_city.properties.key}],
                'selected_bounds' : undefined,
            });
        } else if(d.data_type === 'branch') {
            d = _.extend(d, {
                'locus_type'      : 'best.id',
                'selected'        : [{"locus_id" : d.selected_branch.properties.key}],
                'selected_bounds' : undefined,
                'nested_path'     : config.ES_NESTED_PATH_BANK
            });
        }

        var match;
        if(d.key) {
            d.search_field = d.search_field || "_all";
            match = { "term" : {}};
            match['term'][d.search_field] = d.key;
        }
        
        client.search({
            index : config.ELASTICSEARCH.INDEX.DATA,
            body  : fly.reports_query(d, [match], [sort_command(d.sortBy, d.reverse)]),
            from  : d.page * d.n_reports,
        }).then(function(data) {
            var reports = _.map(data.hits.hits, function(hit) {
                return {
                    "id"           : hit['_id'],
                    "type"         : hit['_type'],
                    "total_amount" : hit['fields']['total_amount'][0],
                    "date_filed"   : helpers.dateToYMD(new Date(hit['fields']['date_filed'][0]))
                };
            });
            
            res.send({
                "total_amount" : -1,
                "reports"      : reports,

                "total_count"  : data.hits.total,
                "min_showing"  : d.page * d.n_reports,
                "max_showing"  : d.page * d.n_reports + reports.length
            });
            
            // -- Send response to logger
            req.geofin          = {};
            req.geofin.response = {"total_count" : data.hits.total};
            next();
            
        }, function(error) { handleError(res, error); });
    });

    app.get('/get_report', function(req, res, next) {
        client.get({
            index : config.ELASTICSEARCH.INDEX.DATA,
            type  : req.query.type,
            id    : req.query.id
        }).then(function(response) {
            res.send(response);
            next();
        });
    });
    
    function clean_mapping(mapping) {
        delete mapping['dynamic_templates']
        delete mapping['fields']
        
        if('properties' == _.keys(mapping)[0]) {
            mapping = mapping['properties'];
        }
        
        if('type' == _.keys(mapping)[0]) {
            mapping = mapping['type'];
        }
        
        if(_.keys(mapping).length) {
            _.map(mapping, function(v, k) {
                mapping[k] = clean_mapping(mapping[k]);
            });
        }
        
        return mapping;
    }
    
    app.get('/get_mapping', function(req, res, next) {
        client.indices.getMapping({
            index : config.ELASTICSEARCH.INDEX.DATA
        }).then(function(mapping) {
            res.send(clean_mapping(mapping));
            next();
        });
    });
};