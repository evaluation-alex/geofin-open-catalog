// This BuilderController could likely be beneficially be broken into
// smaller pieces, since each of the three popovers don't need all of these
// functions.  They need to reference client and state, and maybe one or two
// other helper functions, but it's unecessary to include all of this
// functionality in all of the views.

App.BuilderController = Ember.Controller.extend({
    needs  : ['main'],
    client : Ember.computed.alias('controllers.main.client'),
    state  : Ember.computed.alias('controllers.main.state'),

    editor         : "",
    subset_options : Ember.computed.alias('controllers.main.subset_options'),
    subset_query   : '',

    norm_type_options : Ember.computed.alias('controllers.main.norm_type_options'),
    fix_forms  : true,
    fix_metric : true,
    fix_time   : true,

    metric_type_options    : Ember.computed.alias('controllers.main.metric_type_options'),
    form_type_options      : Ember.computed.alias('controllers.main.state.form_types'),
    form_type_selections   : [],
    locus_actor_options    : [],
    locus_actor_selections : [],
    field_options          : [],
    field_selection        : undefined,
    all_statistic_options  : config.ALL_STATISTIC_OPTIONS,
    statistic_options      : [],
    statistic              : undefined,

    form_type_selections_did_change : function() {
        var _this = this;
        var locus_actors = _.chain(this.get('form_type_selections'))
                            .pluck('locus_actors')
                            .flatten()
                            .map(JSON.stringify)
                            .uniq()
                            .map(JSON.parse)
                            .value();
        
        this.set('locus_actor_options', locus_actors);
        
        this.get('client').run_fetch_form_type_fields(_this.get('form_type_selections'), function(fo) {
            _this.set('field_options', fo);
        });
    }.observes('form_type_selections.@each'),
    
    field_selection_did_change : function() {
        var type = this.get('field_selection.type');
        if(_.contains(['float', 'double', 'long'], type)) {
            type = 'number';
        }
        
        this.set('statistic_options', this.get('all_statistic_options')[type]);
    }.observes('field_selection.type'),
    
    // *** Query Validator ***
    validate_query : function(query, callback) {
        Ember.$.ajax ({
			type        : 'POST',
			url         : config.NODE_PATH + '/validate',
			contentType : 'application/json',
			dataType    : 'json',
			data        : JSON.stringify(query),
			success  : function(response){
                callback(response.valid);
            }
        });
    },
    
    actions : {
        add_subset_query : function(subset_query) {
            var sqo = {
                "label" : subset_query,
                "value" : subset_query.toLowerCase(),
                "pre_def"   : {
                    "type"  : "query_string",
                    "query" : {
                        "string" : subset_query
                    }
                }
            };
            this.get('subset_options').pushObject(sqo);

            this.set('subset_query', '');
        },

        show_mapping : function() {
            var mapping_viewer = this.get('mapping_viewer');
            this.get('client').get_mapping(function(mapping) {
                mapping_viewer.getSession().setValue(JSON.stringify(mapping, null, '  '));
            });
        },

        add_complex_subset_query : function() {
			var self = this,
                subset_query = {};

            console.log('self.get editor', this.get('editor'));
            try{
				subset_query = this.get('editor').getSession().getValue();
            }catch(e){
				console.log(e);
			}
            try {
                subset_query_name = 'complex_query_' + (+ new Date());
                var json_subset_query = JSON.parse(subset_query);
                var sqo = {
                    "label" : subset_query_name,
                    "value" : subset_query_name.toLowerCase(),
                    "pre_def" : {
                        "type"  : "explicit",
                        "query" : json_subset_query
                    }
                };
                
                // **** QUERY VALIDATOR ****
                this.validate_query(json_subset_query, function(valid) {
                    console.log('valid', valid);
                    if(valid){
                        self.get('subset_options').pushObject(sqo);
                    } else {
                        alert('Invalid query!');
                    }
                });
            } catch(e) {
				// This is not a good catch. Too broad. Need to change.
                alert('Custom query is invalid JSON! Please, look up the Elasticsearch query language for more information.',e);
            }
        },
        
        // <metric>
        add_metric : function() {
            
            var _this = this;
            var obj   = Ember.Object.create({
                "pre_def" : {
                    "type" : "parameterized",
                    "content" : {
                        "id"           : + new Date(),
                        "form_types"   : _.pluck(_this.get('form_type_selections'), 'form_type'), // Hack
                        "locus_actors" : _.pluck(_this.get('locus_actor_selections'), 'locus_actor'),
                        "field"        : this.get('field_selection.field'),
                        "statistic"    : this.get('statistic.value')
                    }
                }
            });
            
            var nm = + new Date();
            
            obj.label     = [obj.pre_def.content.id].join('_').replace(/\./g, '-');
            obj.value     = 'mt_' + nm;
            obj.pre_def.content.name  = 'mt_' + nm;
            
            this.get('metric_type_options').pushObject(obj);
        },
        // </metric>
        
        remove_option : function(row, target) {
            this.set(target, _.filter(this.get(target), function(x) {
                return x.value != row.value;
            }));
        },
        
        remove_norm_type_option : function(row) {
            console.log('row', row);
            this.send('remove_option', row, "norm_type_options");
        },
                
        persist_comparison : function() {
            var state = this.get('state');
            // How far down are we specifying this set?
            var obj = Ember.Object.create({
                "pre_def" : {
                    "type"       : "realtime",
                    "fix_time"   : this.get('fix_time'),
                    "fix_forms"  : this.get('fix_forms'),
                    "fix_metric" : this.get('fix_metric'),
                    "state"      : JSON.parse(JSON.stringify(state.serialize()))
                }
            });
            
            var nm = + new Date();
                        
            obj.label         = 'New Comparison';
            obj.value         = 'nrm_' + nm;
            obj.pre_def.name  = 'nrm_' + nm;
         
            this.get('norm_type_options').pushObject(obj);
        }
    }
});

App.DefineSubsetController = App.BuilderController.extend({});
App.DefineSubsetView = Ember.View.extend({
    didInsertElement : function() {

        if($('#editor').length > 0) {
			var editor = ace.edit("editor");
			editor.setTheme("ace/theme/monokai");
			editor.getSession().setMode("ace/mode/javascript");
			this.set('controller.editor', editor);
        }
        
        if($('#mapping-viewer').length > 0) {
			var mapping_viewer = ace.edit("mapping-viewer");
			mapping_viewer.setTheme("ace/theme/monokai");
            mapping_viewer.setReadOnly(true);
			mapping_viewer.getSession().setMode("ace/mode/javascript");
			this.set('controller.mapping_viewer', mapping_viewer);
        }
    }
});

App.SubsetPopoverContentView = Ember.View.extend({
	templateName: 'subset-popover-content'
});

App.DefineMetricController  = App.BuilderController.extend({});
App.MetricPopoverContentView = Ember.View.extend({
	templateName: 'metric-popover-content'
});

App.DefineCompareController = App.BuilderController.extend({});
App.ComparePopoverContentView = Ember.View.extend({
	templateName: 'compare-popover-content'
});

// --
// Subview in `define-metric`
App.MetricDefinitionView = Ember.View.extend({
    templateName : "metric-definition",

    special  : false,
    explicit : false,

    didInsertElement : function() {
        var pre_def = this.get('pre_def');
        if(pre_def.type === 'special') {
            this.set('special', true);
        } else if(pre_def.type === 'explicit') {
            this.set('explicit', true);
        }
    }
});

// --

Ember.Handlebars.helper('stringify', function(value, options) {
  return new Ember.Handlebars.SafeString(JSON.stringify(value));
});
