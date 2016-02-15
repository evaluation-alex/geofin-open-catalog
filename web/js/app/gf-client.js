App.MetricHandler = Ember.Object.extend({});
App.MetricHandler.reopenClass({
    _from_parameterization : function(col) {
        if(col.field.match('^gfloc')) {
            alert('this query is probably unsupported! (Specifically, the nesting has not been accounted for)');
        }
        
        var tmp = {};
        tmp[col.name] = {
            "filter": {
                "bool" : {
                    "must": [
                        { "terms": { "gfloc.locus_actor" : col.locus_actors } },
                        { "terms": { "gfloc.type"        : col.form_types   } }
                    ]
                }
            },
          "aggs": {
            "step_out_avg" : {
                "reverse_nested" : {},
                "aggs" : { "inner": {} }
            }
          }
        };
        tmp[col.name].aggs.step_out_avg.aggs.inner[col.statistic] = {"field": col.field};
        return tmp;
    },

    metric_aggs : function(metric_type) {
        var metric_aggs;
        if( _.contains(['explicit', 'special'], metric_type.pre_def.type) ) {
            
            metric_aggs = metric_type.pre_def;
            
        } else if( metric_type.pre_def.type == 'parameterized' ){
            
            metric_aggs = {
                "type"    : "explicit",
                "content" : {
                    "step_in_inner" : {
                        "nested" : {
                            "path" : "gfloc"
                        },
                        "aggs" : App.MetricHandler._from_parameterization(metric_type.pre_def.content)
                    }
                }
            };
        }
        
        return metric_aggs;
    }
});

App.NormHandler = Ember.Object.extend();
App.NormHandler.reopenClass({
    make_norm : function(state, cb) {
        var nrm = state.norm_type.pre_def;
        
        if(!nrm.fix_time) {
            nrm.state.start_date = state.start_date;
            nrm.state.end_date   = state.end_date;
        }
        if(!nrm.fix_forms)  { nrm.state.form_types  = state.form_types; }
        if(!nrm.fix_metric) { nrm.state.metric_type = state.metric_type; }

        // Adjust parameters that need to be adjusted for norm
        // to make sense
        nrm.state.selected            = state.selected;
        nrm.state.selected_bounds     = state.selected_bounds;
        nrm.state.ts_resolution.value = state.ts_resolution.value;

        cb(nrm.state);
    }
});

// ------------------------------------------------------------- //
/* Backend interface */
App.GFClient = App.BaseClient.extend({
    // --- GET ---
	run_fetch_form_types : function() {
        return this.gf_get( this.get('node_path') + 'fetch_form_types' );
	},

    run_fetch_form_type_fields : function(form_types, callback) {
		this.fetch(undefined, {
			"path"       : "fetch_form_type_fields",
			"form_types" : form_types
		}, function(response) {
			Ember.run(this, callback, response);
		}, true);
	},
    
	make_norm: function(state, _params, t, fetch_type){
		var parm;
		App.NormHandler.make_norm(state, function(norm) {
            parm = {
                "value" : norm.metric_type.value,
                "def" : {
                    "type"  : "realtime",
                    "query" : _params(fetch_type, norm, t)
                }
            };
        });
		return parm;
	},

    rf_params_query: function(user_path, state, client_aggs) {
        /* returns JSON object for our run_fetch functions below*/
        // declare generic object first
        var rf = {
            "path"              : user_path,
            "metric_type"       : state.metric_type.value || undefined,
            "start_date"        : state.start_date,
            "end_date"          : state.end_date,
            "form_types"        : state.form_types,
            "borders_selection" : state.borders_selection.value || undefined,
            "user_query"        : state.user_query,
            "exact_geoname"     : state.exact_geoname,
            "norm"              : undefined,
            "accuracy"          : Math.pow(10, state.accuracies.global) - 1,
        };
        
        if(user_path !== "fetch_global"){
            // not used in global
			rf = _.extend(rf, {
                "selected" : state.selected, "client_aggs" : client_aggs
            });
            
            if(user_path !== "fetch_locus"){
                //not in global or locus
                rf = _.extend(rf, {
                    "selected_bounds" : state.selected_bounds
                });
            }

        } else {
            if(user_path !== "fetch_dissection"){
                //not in global, subjects
                rf = _.extend(rf, {
                    "size" : 100
                });
            }
        }
                    
        if(user_path === "fetch_global"){
            // only in fetch_global
            var active_columns = state.get ? state.get('active_columns') : state.active_columns;
            rf = _.extend(rf, {
                "additional_metric_types" : _.pluck(active_columns, 'value'),
                "client_aggs"             : _.map(active_columns, App.MetricHandler.metric_aggs)
            });
        }

        if(user_path === "fetch_dissection"){
            // only in fetch_subjects
            // Client_aggs go underneath a "terms" agg on the form_type-field
            var u_path = {
                "form_type_field" : config.FIELDS.SUBJECT_ID,
                "n_dissection"    : 100
            };
            rf = _.extend(rf, u_path);
        }
        return rf;
    },

    rf_client_aggs: function(fetch_type, state){
        /* makes our client agg for our run_fetch functions */
        var typeAgg; // holds our type object
        var dateAgg; // holds our date object

        if(fetch_type !== "fetch_locus"){
            // not used at all in in fetch_locus
            typeAgg = {
                "type"    : "special",
                "content" : {
                    "id" : "type_agg"
                },
                "aggs" : App.MetricHandler.metric_aggs(state.metric_type)
            };
        }

        dateAgg = {
            "type"    : "special",
            "content" : {
                "id" : "date_agg"
            },
            "params"  : {
                "interval" : state.ts_resolution.value
            },
                "aggs" : App.MetricHandler.metric_aggs(state.metric_type)
            };

        if(fetch_type === "fetch_locus"){
            return [dateAgg, App.MetricHandler.metric_aggs(state.metric_type)];
        }else{
            var t_agg = [typeAgg, dateAgg, App.MetricHandler.metric_aggs(state.metric_type)];
            var r_agg = _.chain(t_agg).map(JSON.stringify).uniq().map(JSON.parse).value();
            return r_agg;
        }
    },
   
    rf_params: function(fetch_type, state, _this){
        /* Return query for run_fetch functions below */
        var client_aggs = fetch_type === "fetch_global" ? [] : _this.rf_client_aggs(fetch_type, state);
        var params = _this.rf_params_query(fetch_type, state, client_aggs);
        
        if(state.norm_type.pre_def) {
            // if we need to normalize
			params.norm = _this.make_norm(state, _this.rf_params, _this, fetch_type);
        }
        
        return params;
    },

    run_fetch_global: function(state, callback) {
        var _this  = this;
        if(state.form_types === undefined | state.active_columns.length === 0) {
            return false;
        } else {

            var params = _this.rf_params("fetch_global", state, _this);
            this.fetch(state, params, function(data) {
                callback({'data' : data});
            });
        }
	},

	run_fetch_locus: function(state, callback) {
        var _this  = this;
		if(!state.selected) {
            callback({'data' : undefined, 'eub' : undefined});
        } else {
            
            var params = _this.rf_params("fetch_locus", state, _this);
			this.fetch(state, params, function(data) {
                callback({'data' : data, 'eub' : data.eub});
            });
		} 
	},
    
	run_fetch_populated_places : function(state, callback) {
        var _this  = this;
        if(!state.selected && !state.selected_bounds) {
            callback({'data' : undefined, 'eub' : undefined});
        } else {
            
            var params = _this.rf_params("fetch_populated_places", state, _this);
            this.fetch(state, params, function(data) {
                callback({'data' : data.data, 'eub' : data.eub});
            });
        }
	},
    
    run_fetch_branches : function(state, callback) {
        var _this  = this;
        if(!state.selected && !state.selected_bounds) {
            callback({'data' : undefined, 'eub' : undefined});
        } else {
            
            var params = _this.rf_params("fetch_branches", state, _this);
            this.fetch(state, params, function(data) {
                callback({'data' : data.data, 'eub' : data.eub});
            });
        }
	},

    run_fetch_subjects : function(state, callback, subject) {
		var _this  = this; 
        if(!state.selected && !state.selected_bounds) {
            callback({'data' : undefined, 'eub' : undefined});
        } else {
            var params = _this.rf_params("fetch_dissection", state, this);

			if(subject) {
                _.extend(params, {"subject_query" : subject});
            }
			
            this.fetch(state, params, function(data) {
                callback({'data' : data.data, 'eub' : data.eub});
            });
        }
    },
    
    // How __should__ this interact with SMC paradigm?
    run_fetch_subject_geo : function(state, callback, input_params) {
        if(!input_params.get('single_subject_key')) {
            callback({'data' : undefined, 'eub' : undefined});
        } else {
            
            var params = {
                "path" : "fetch_subject_geo",
                // State
                "start_date"       : state.start_date,
                "end_date"         : state.end_date,
                "form_types"       : state.form_types,
                "user_query"       : state.user_query,
                "exact_geoname"    : state.exact_geoname,

                // Bad actor state
                "single_subject"    : input_params.get('single_subject_key'),
                "augmentation_type" : undefined,
                "size" : 100 // DDDemo -- set to 10
            };
            
            this.fetch(state, params, function(data) {
                callback({'data' : data.data, 'eub' : undefined});
            });
        }
    },
    
    // <fetch-reports>
        run_fetch_reports : function(state, params, callback) {
            console.log('++ state.selected', state.selected);
            var params_ = _.extend({
                "path"             : "fetch_reports",
                "data_type"        : params.data_type,
                
                // State
                'selected'          : state.selected,
                'selected_bounds'   : state.selected_bounds,
                "start_date"        : state.start_date,
                "end_date"          : state.end_date,
                "form_types"        : state.form_types,
                "borders_selection" : state.borders_selection.value,
                "user_query"        : state.user_query,
                "exact_geoname"     : state.exact_geoname,

                "n_reports" : params.n_reports || config.NUM_OF_REPORTS,
                "sortBy"    : params.sortBy,
                "reverse"   : params.reverse,
                "page"      : params.page
            }, params);
            
            this.fetch(state, params_, function(data) {
                callback(data);
            });
        },
    // </fetch-reports>
    
    // <get-borders>
        get_report : function(type, id, callback) {
            this.gf_get( this.get('node_path') + 'get_report?type=' + type + '&id=' + id).then(function(response) {
                callback(response);
            });
        },
        get_borders : function(callback) {
            this.gf_get( this.get('node_path') + 'get_borders' ).then(function(borders) {
                if(!config.USE_JSON_SHAPEFILES) {
                    console.log('parsing topojson');
                    _.map(_.keys(borders), function(k) {
                        borders[k] = omnivore.topojson.parse(borders[k]);
                    });
                }

                console.log('got borders', borders);

                callback(borders);
            });
        },
        get_locus_name : function(path, state, callback, all_borders) {
            var self = this;
            if(all_borders) {
                callback(self._get_locus_name(path, state, all_borders));
            } else {
                this.get_borders(function(all_borders) {
                    callback(self._get_locus_name(path, state, all_borders));
                });
            }
        },
        _get_locus_name : function(path, state, all_borders) {
            return _.map(path.split(','), function(region) {
                return {
                    "name"     : App.Helper.iso2name(region, state.get('borders_selection'), all_borders),
                    "locus_id" : region
                };
            });
        },
        get_mapping : function(callback) {
            this.gf_get( this.get('node_path') + 'get_mapping').then(function(mapping) {
                callback(mapping);
            });
        },
    // </get-borders>
});

// ----- End GFClient -------

