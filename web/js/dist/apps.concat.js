// configure an authorizer to be used

window.ENV = window.ENV || {};
console.log('setting up authentication...');
window.ENV['simple-auth'] = {
  authorizer                  : 'authorizer:custom',
  routeAfterAuthentication    : 'wrapper',
  routeIfAlreadyAuthenticated : 'wrapper',
  applicationRootUrl          : 'login'
};
Ember.Application.initializer({
  name   : 'authentication',
  before : 'simple-auth',
  initialize: function(container, application) {
    container.register('authenticator:custom', App.GeofinAuthenticator);
    container.register('authorizer:custom', App.GeofinAuthorizer);
  }
});

function loadTemplates(App) {
    Ember.$.ajax({
        async : true,
        type  : 'GET',
        url   : 'templates/dist/templates.js',
    }).then(function() {
        App.advanceReadiness();
    });
}

App = Ember.Application.create({
    // Global getters for localstorage
  isAdmin : function() {
    return window.localStorage.getItem('isAdmin') === 'true';
  },
  username : function() {
    return window.localStorage.getItem('username');
  },
  token : function() {
    return window.localStorage.getItem('token');
  },
  
  saveToken : function(token, isAdmin, username) {
    // Save to local storage
    window.localStorage.setItem('token',    token);
    window.localStorage.setItem('isAdmin',  isAdmin);
    window.localStorage.setItem('username', username);
    
    // Set headers
    Ember.$.ajaxSetup({headers : { 'x-access-token': token }});
  },
  updateToken : function(token, callback) {
    // Save to local storage
    window.localStorage.setItem('token', token);

    // Set headers
    Ember.$.ajaxSetup({headers : { 'x-access-token': token }});
    Ember.run(function() {
        callback();
    });
  }
});

App.GRoute = Ember.Route.extend(SimpleAuth.AuthenticatedRouteMixin);

App.deferReadiness();

App.Router.map(function() {
  this.route('login');
  this.resource('wrapper', {path  : '/'}, function() {
    this.resource('main', {path : '/:selection_url'}, function() {
    
      this.resource('builder', {path : 'query-builder'});
    
      this.resource('global');
      this.resource('region', {path : "region"});
      this.resource('city');
      this.resource('branch');
      this.resource('subject');
      this.resource('morelikethis', {path : "similar-countries"});

      this.resource('profiler', {path : "profiler"});
      this.resource('aps', {path : "associated-locations"});
      this.resource('transfers');
            
      this.resource('test');
    });
  });
});

if(!config.TESTING) {
//    loadTemplates(App, templates, 0);
    loadTemplates(App);
} else {
    App.advanceReadiness();
}

App.Router.reopen({
  rootURL : config.ROOT_URL
});

App.ApplicationRoute = Ember.Route.extend(SimpleAuth.ApplicationRouteMixin);


App.ApplicationController = Ember.Controller.extend({
    needs : ['main'], // this is sortof backwards

    drop_counter : 0,
    username     : undefined,
    isAdmin      : function() {return App.isAdmin();}.property(),
    
    use_query    : false,
    user_query   : config.DEFAULT_ACE_CONTENT,
    user_query_did_change : function() {
        if(this.get('use_query')) {
            this.set('controllers.main.state.user_query', this.get('user_query'));
        } else {
            this.set('controllers.main.state.user_query', undefined);
        }
    }.observes('user_query', 'use_query'),

    // The dependency structure here is bad
    actions : {
        accountSettings : function() {
            var parent_con = this;
            Ember.Widgets.ModalComponent.popup({
                primary : {
                  targetObject  : parent_con,
                  headerText    : "Account Settings",
                  confirmText   : "Done",
                  cancelText    : undefined,
                  use_query     : parent_con.get('use_query'),

                  // Requiring too much stuff here -- should eliminate some

                  exact_geoname         : parent_con.get('controllers.main.state.exact_geoname'),
                  ts_resolution         : parent_con.get('controllers.main.state.ts_resolution'),
                  ts_resolution_options : parent_con.get('controllers.main.ts_resolution_options'),
                  accuracies            : parent_con.get('controllers.main.state.accuracies'),
                  
                  classNames         : ['account-settings-modal'],
                  contentViewClass   : App.AccountModalView,
                },
                computed : {
                    isAdmin  : function() {return App.isAdmin();}.property(),
                    username : function() {return App.username();}.property(),
                    ts_resolution_did_change : function() {
                        parent_con.set('controllers.main.state.ts_resolution', this.get('ts_resolution'));
                    }.observes('ts_resolution'),
                    exact_geoname_did_change : function() {
                        parent_con.set('controllers.main.state.exact_geoname', this.get('exact_geoname'));
                    }.observes('exact_geoname'),
                }
            });
        }
    }
});

App.AccountModalView = Ember.View.extend({
  templateName : "account",
  didInsertElement : function() {
    
    // Time series accuracies
    var con = this.get('controller');
    var nms = _.keys(con.get('accuracies')); // +_+ city, branch & subject
    var MAX = 6;
    _.map(nms, function(nm) {
      $("#" + nm + "-slider").slider({
        min   : 1,
        max   : nm === 'subject' ? (nm === 'branch' ? MAX - 4 : MAX - 1) : MAX,
        value : con.get('accuracies.' + nm) || MAX,
        step  : 1,
        change : function(event, ui) {
            if (ui.value < MAX) { 
                con.set('accuracies.' + nm, ui.value);
            } else {
                con.set('accuracies.' + nm, 0);
            }
        }
      });
    });
  }

});


// Wrapper was initially necessary to make routing work with
// authentication.  Could potentially be removed in the future.
App.WrapperView  = Ember.View.extend();
App.WrapperRoute = App.GRoute.extend({
  beforeModel : function(params) {
    if(params.targetName == 'wrapper.index') {
      this.transitionTo('main', config.DEFAULT_PATH);
    }
  }
});

App.Serializable = Ember.Mixin.create({
    serialize: function () {
        var result = {};
        for (var key in $.extend(true, {}, this)) {
            // Skip these
            if (
                key === 'isInstance' ||
                key === 'isDestroyed' ||
                key === 'isDestroying' ||
                key === 'concatenatedProperties' ||
                typeof this[key] === 'function'
            ) {
                    continue;
            }
            result[key] = this[key];
        }
        return result;
    }
});

App.Helper = Ember.Object.extend();
App.Helper.reopenClass({
    flattenJSON : function(data) {
        var result = {};
        function recurse (cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                 for(var i=0, l=cur.length; i<l; i++)
                     recurse(cur[i], prop + "[" + i + "]");
                if (l === 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop+"."+p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    },

  dateToYMD : function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return '' + y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  },

  locus_property : function(inp) {
    if(inp.borders_selection !== undefined) {
      inp = inp.borders_selection;
    }

    if(inp.value === 'world') {
      return 'ISO2';
    } else if (inp.value === 'state') {
      return 'STUSPS';
    }
  },
  
  nested_sortBy : function(children, column) {
    var self = this;
    children = _.sortBy(children, function(x) {
      return parseInt(x.values[column - 1].value, 10);
    });
    _.map(children, function(child) {
      if(child.children) {
        child.children = self.nested_sortBy(child.children, column);
      }
    });
    return children;
  },
  nested_reverse : function(children, column) {
    var self = this;
    children.reverse();
    _.map(children, function(child) {
      if(child.children) {
        child.children = self.nested_reverse(child.children, column);
      }
    });
    return children;
  },


    smart_sortBy : function(x, path) {        
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

  capitalize : function(str) {
    return str.replace(/^./g, str.charAt(0).toUpperCase());
  },

  iso2name : function(iso, borders_selection, all_borders) {
    var self = this;
    var out  = [];
    // all_borders is sometimes undefined coming out of the region controller
    if(all_borders){
        out = _.filter(all_borders[borders_selection.value], function(x) {
            return x.properties[self.locus_property(borders_selection)] === iso;
        });
    }
    return out.length > 0 ? out[0].properties.NAME : 'No Region';
  },

  clean_class : function(str) {
    return str.replace(/\./g, '_').replace(/-/g, '_');
  },

  // Financial Tree table

  make_place_list : function(borders, borders_selection) {
    var self = this;
    return _.map(borders, function(x) {
      return {
        "name" : x.properties.NAME,
        "locii" : [{
          'name'      : x.properties.NAME,
          'locus_id'  : x.properties[self.locus_property(borders_selection)]
        }]
      };
    });
  },
  
    download : function(strData, strFileName, strMimeType) {
        var D = document,
            a = D.createElement("a");
            strMimeType= strMimeType || "application/octet-stream";

        if (navigator.msSaveBlob) { // IE10
            return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
        } /* end if(navigator.msSaveBlob) */

        if ('download' in a) { //html5 A[download]
            a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
            a.setAttribute("download", strFileName);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function() {
                a.click();
                D.body.removeChild(a);
            }, 66);
            return true;
        } /* end if('download' in a) */

        //do iframe dataURL download (old ch+FF):
        var f = D.createElement("iframe");
        D.body.appendChild(f);
        f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

        setTimeout(function() {
            D.body.removeChild(f);
        }, 333);
        return true;
    }
});

App.GeofinAuthenticator = SimpleAuth.Authenticators.Base.extend({

  tokenEndpoint  : (config.TESTING ? config.TESTING_DOMAIN : config.NODE_PATH) + 'login', // *** TEST ***
  verifyEndpoint : (config.TESTING ? config.TESTING_DOMAIN : config.NODE_PATH) + 'check_token', // *** TEST ***

  restore: function(data) {
    var _this = this;
    if (!Ember.isEmpty(data.token) && !config.TESTING) {
      Ember.$.ajaxSetup({headers : { 'x-access-token': data.token }});
    }
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!Ember.isEmpty(data.token)) {
        Ember.$.ajax({
          url         : _this.verifyEndpoint,
          type        : 'GET',
          contentType : 'application/json',
          dataType    : 'json',
          success : function(response) {
            Ember.run(function() {
                if(response.authenticated) {
                    resolve(data);
                } else {
                    reject();
                }
            });
          },
          error : function(error) {
            if(error.status == 403) {
              console.log('$$$ auth: access denied on restore -- the token must be outdated');
              Ember.run(this, reject);
            } else {
                alert('There was an error reaching the server. (Unrecognized certificate or bad connection most likely.)');
            }
          }
        });
        } else {
          Ember.run(this, reject);
        }
      });
    },

    authenticate: function(credentials) {
      var _this = this;
      console.log('$$$ auth: trying to authenticate...');

      return new Ember.RSVP.Promise(function(resolve, reject) {
        var postdata = JSON.stringify({username: credentials.identification, password: credentials.password});
        
        Ember.$.ajax({
          url         : _this.tokenEndpoint,
          type        : 'POST',
          data        : postdata,
          contentType : 'application/json',
          dataType    : 'json'
        }).then(function(response) {
            console.log('$$$ auth: response -- ', response);
            App.saveToken(response.token, response.isAdmin, response.username);

            Ember.run(function() {
                resolve({
                  token    : response.token,
                  username : response.username,
                  isAdmin  : response.isAdmin
                });
            });
            
        }, function(xhr, status, error) {
          console.log('$$$ auth: rejecting...', error, ' ', status, ' ', JSON.stringify(xhr));
          Ember.run(this, reject, xhr.responseText);
        });
      });
      
    },

    invalidate: function() {
      var _this = this;

      window.localStorage.setItem('token',    undefined);
      window.localStorage.setItem('username', undefined);
      window.localStorage.setItem('isAdmin',  undefined);

      return new Ember.RSVP.Promise(function(resolve) {
        Ember.$.ajax({ url: _this.tokenEndpoint, type: 'DELETE' }).always(function() {
          Ember.run(this, resolve);
        });
      });
    }
  });

  App.GeofinAuthorizer = SimpleAuth.Authorizers.Base.extend({
    authorize: function(jqXHR, requestOptions) {
      if (this.get('session.isAuthenticated') && !Ember.isEmpty(this.get('session.token'))) {
        jqXHR.setRequestHeader('Authorization', 'Token: ' + this.get('session.token'));
      }
    }
  });

// --

  App.LoginRoute = Ember.Route.extend({
    setupController: function(controller, model) {
      if(this.get('session.isAuthenticated')) {
        console.log('$$$ auth: already authenticated...');
        this.transitionTo('wrapper');
      } else {
        controller.set('errorMessage', null);
      }
    }
  });

  App.LoginController = Ember.Controller.extend(SimpleAuth.LoginControllerMixin, {
    authenticator: 'authenticator:custom',
    show_login : true,
    actions: {
      authenticate: function() {
        console.log('$$$ auth: start');
        var _this = this;
        this._super().then(null, function(message) {
          console.log('$$$ auth: finish w/ message:', message);
          _this.set('errorMessage', message);
        });
      }
    }
  });

  App.LoginView = Ember.View.extend({
    willInsertElement : function() {
        if(config.AUTHENTICATION.STRATEGY === 'gated') {
            console.log('$$$ auth: -- gated authentication enabled --- ');

            this.set('controller.show_login', false);
            this.get('controller').send('authenticate');
        }
    },
    didInsertElement: function() {
        $('#input-username').focus();
    }
  });


App.FormToggleView = Ember.View.extend({
    tagName          : '',
    templateName     : "form-toggle",
    didInsertElement : function() {
        
        this.set('form_type_label', this.get('f.form_type_label'));
        
        // Make sure that color tracks toggle setting from the beginning...
        if(!this.get('f.toggled')) {
            $('#' + this.get('f.form_type')).addClass('inactive-form-type');
        }
    }
});

App.FormTypeModalView = Ember.View.extend({
    templateName     : "form-type-modal",
    didInsertElement : function() {
        var content = this.get('controller.content');
        _.map(content.locus_actors, function(la) {
            if(!la.toggled) {
                $("#" + la.id).addClass('hidden-subfield');
            }
        });
        _.map(content.amount_types, function(at) {
            if(!at.toggled) {
                $("#" + at.id).addClass('hidden-subfield');
            }
        });
    }
});


// -----

App.Select2View = Ember.Select.extend({
  prompt: 'Please select...',

  didInsertElement: function() {
    Ember.run.scheduleOnce('afterRender', this, 'processChildElements');
  },

  processChildElements: function() {
    this.$().select2({});
  },
  
    _underlyingSelectionDidChange: Ember.observer((function() {
        this.$().select2('val', this.$().val().toString());
    }), "selection.@each"),

  willDestroyElement: function () {
    this.$().select2("destroy");
  }
});

App.ToggleSwitch = Ember.View.extend({
  classNames: ['toggle-switch'],
  templateName: 'toggle-switch',
  
  init: function() {
    this._super.apply(this, arguments);
    return this.on('change', this, this._updateElementValue);
  },
  
  checkBoxId: (function() {
    return "checker-" + (this.get('elementId'));
  }).property(),
  
  _updateElementValue: function() {
    return this.set('checked', this.$('input').prop('checked'));
  }
});

// ------

Ember.Widgets.ModalComponent.reopenClass({
    popup: function(options) {
        var modal, rootElement;
        if (!options) {
          options = {};
        }
        this.hideAll();
        rootElement = options.rootElement || this.rootElement;
        
        // Phronesis
		if(options.computed){
			this.reopen(options.computed);
		}
        modal = this.create(options.primary);
        
        if (modal.get('targetObject.container')) {
          modal.set('container', modal.get('targetObject.container'));
        }

        modal.appendTo(rootElement);
        return modal;
    }
});

App.BaseClient = Ember.Object.extend({
	node_path  : undefined,
    form_types : undefined,

	loading : 0,
	increment_loading : function() {
        var self = this;
        Ember.run(function() {
            self.set('loading', self.get('loading') + 1);
        });
    },
	decrement_loading : function() {
        var self = this;
        Ember.run(function() {
            self.set('loading', self.get('loading') - 1);
        });
    },

    errorMessage : 'no errors right now',
	authentication_warning : function() {
		alert("Your authentication credentials have expired! Please log out (using the x in the upper right hand corner) and log back in.  Restarting the browser may be necessary in rare conditions...");
	},
	unauthorized_warning: function() {
		alert('You are attempting to access a part of the app that you are not authorized to access!');
	},
	server_error_warning : function() {
		alert('Internal server error! No data returned.\n\nError:' + this.get('errorMessage.responseText'));
	},

	// Makes sure that all necessary values are
	// present before submitting a query.
	// Can be forced by passing `force` to fetch
	validate_state : function(state) {
        if(state) {
            return state.start_date && state.end_date && (state.ts_resolution !== undefined);
        } else {
            return false;
        }
	},

	fetch: function(state, params, callback, force) {
		if(force || this.validate_state(state)) {
			this._fetch(params, callback);
		} else {
			console.log('`fetch` not validated!');
		}
	},
    
	_fetch : function(params, callback) {
		var self = this;
		self.increment_loading();
		Ember.$.ajax({
			type        : "POST",
			contentType : 'application/json',
			dataType    : "json",
			url         : this.get('node_path') + params.path,
			data        : JSON.stringify(params),
			success     : function(response) {
                self.decrement_loading();
				if(response.new_token) {
					console.log('$$$ received new token', response.new_token);
					App.updateToken(response.new_token, function() {
						self.fetch(undefined, params, callback, true);
					});
				} else {
					Ember.run(this, callback, response);
				}
			},
			error: function(error) {
				self.decrement_loading();
                self.set('errorMessage', error);
				if(error.status == 401) {
					Ember.run.debounce(self, 'unauthorized_warning', 1000, false);
				} else if(error.status == 403) {
					Ember.run.debounce(self, 'authentication_warning', 1000, false);
				} else if(error.status == 500) {
					Ember.run.debounce(self, 'server_error_warning', 1000, false);
				}
			}
		});
	},

	gf_get : function(url) {
		var self = this;
        self.increment_loading();
		var promise = Ember.$.getJSON( url );
		return new Ember.RSVP.Promise(function(resolve, reject) {
			promise.then(function(response) {
                self.decrement_loading();
				if(response.new_token) {
					console.log('$$$ received new token', response.new_token);
					App.updateToken(response.new_token, function() {
						self.gf_get( url ).then(function(response) {
							Ember.run(this, resolve, response);
						});
					});
				} else {
                    Ember.run(this, resolve, response);
                }
			}, function(error) {
                self.decrement_loading();
                if(error.status == 500) {
                    Ember.run.debounce(self, 'server_error_warning', 1000, false);
                }
            });
		});
	}
});

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


App.Client = App.GFClient.extend();

App.Client.reopenClass({
	make : function(node_path) {
		return new Ember.RSVP.Promise(function(resolve, reject) {
			var client = App.Client.create({ 'node_path' : node_path });
			client.run_fetch_form_types().then(function(response) {
                client.set('form_types', response.form_types);
                Ember.run(this, resolve, client);
			});
		}, function(error) {
			reject(error);
		});
	}
});
App.Styler = Ember.Object.extend({
    targetObject : undefined,
    thresholds   : undefined,

    legend : function() {
        var name = this.get('targetObject.name');
        return App.Legend.make(this, this.get('targetObject.map'), { "title" : name });
    }.property(),
    
    threshold_type      : "val",
    threshold_transform : "log",
    
    // *** COLORPICKER : properties of "targetObject" that get changed by the Modal ****
    n_steps        : config.DEFAULT_N_STEPS,
    colors         : ['white', 'gray', 'black'],
    
    opacity        : 0.3,
    
    // Redraw when style parameters are changed
    style_did_change : function() {
        this.get('targetObject').refresh();
    }.observes('colors.@each', 'n_steps', 'opacity'),
    
    // Generates color pallette with number of steps
    color_pallette : function() {
        var n_steps = this.get('n_steps');
        var rainbow = new Rainbow();
        rainbow.setNumberRange(0, n_steps - 1);
        rainbow.setSpectrumByArray(this.get('colors'));
        return _.map(_.range(0, n_steps), function(k) {
            return '#' + rainbow.colourAt(k);
        });
    }.property('colors', 'n_steps'),
    
    
    get_threshold_index : function(d) {
        var thresholds = this.get('thresholds');
		return _.indexOf(thresholds,
            _.max(
                _.filter(thresholds, function(t) {
                        return t <= d;
                })
            )
        );
    },
    // Here, radii are scaled depending on which threshold they fall in.
    // That is, they're conveying the same information as color.
    get_radius : function(d) {
        var MAX_RADIUS = 10;
        return ((this.get_threshold_index(d) + 1)/ this.get('n_steps')) * MAX_RADIUS;
    },
    get_color : function(d) {
        var color_pallette = this.get('color_pallette');
		return color_pallette[this.get_threshold_index(d)];
	},
    
    get_opacity : function() {
        return this.get('opacity');
    },
    set_legend : function() {
        var thresholds  = this.get('thresholds');
        var pallette    = this.get('color_pallette');
        this.get('legend').change_html(thresholds, pallette);
        this.get('legend').show();
    },
    clear_legend : function() {
        this.get('legend').hide();
    }
});

App.Styler.reopenClass({
    compute_thresholds : function(data, n_steps, threshold_type, threshold_transform) {
        var out;
        if(_.isEmpty(_.max(data)) !== false && _.uniq(data).length > 1) {
            console.log('compute_thresholds :: trying');
            
            if(threshold_type === 'rank') {
                return App.Styler.compute_thresholds_quantiles(data, n_steps);
            } else if(threshold_type === 'val'){
                if(threshold_transform == 'log') {
                    return App.Styler.compute_thresholds_logval(data, n_steps);
                } else {
                    return App.Styler.compute_thresholds_val(data, n_steps);
                }
            } else {
                console.log('? --- Unknown threshold type --- ?');
            }
        } else {
            console.log('compute_thresholds :: skipping');
            return [0];
        }
    },
    compute_thresholds_val : function(data, n_steps) {
        var min = _.min(data);
        var max = _.max(data);

        var step = (max - min) / n_steps;
        var thresholds = _.map(_.range(0, n_steps), function(i) {
            return min + (i * step);
        });
        thresholds[0] = 0;
        return thresholds;
    },
    compute_thresholds_logval : function(data, n_steps) {
        var logmin = Math.log( _.chain(data).filter(function(x) {return x > 0;}).min().value() ) / Math.LN10;
        var logmax = Math.log( _.max(data) ) / Math.LN10;
    
        var step = (logmax - logmin) / n_steps;
        var thresholds = _.map(_.range(0, n_steps), function(i) {
            return Math.pow(10, logmin + (i * step));
        });
        thresholds[0] = 0;
        return thresholds;
    },
    compute_thresholds_quantiles : function(data, n_steps) {
        n_steps = _.min([n_steps, data.length]);
        
        var sorted_data = _.sortBy(data, function(x) {return x;});

        var step = data.length / n_steps;
        var thresholds = _.map(_.range(0, n_steps), function(i) {
            return sorted_data[Math.round(i * step)];
        });
        return thresholds;
    }
});

App.RegionStyler = App.Styler.extend({
	get_layer_params : function(self) {
        var _this = this;
        var style = _this.make_style(self);
        return {
            style         : style,
            onEachFeature : _this.make_onEachFeature(self, style)
        };
	},
    set_thresholds : function() {
        var data           = this.get('targetObject.data');
        //	var metric_type    = this.get('targetObject.state.metric_type.value');
        var metric_type    = 'metric_val';
        var n_steps        = this.get('n_steps');

        var threshold_type      = this.get('threshold_type');
        var threshold_transform = this.get('threshold_transform');
        
        var d = _.chain(data).pluck(metric_type).pluck(threshold_type).value();
        
        var thresholds  = App.Styler.compute_thresholds(d, n_steps, threshold_type, threshold_transform);
        this.set('thresholds', thresholds);
    },
	make_style : function(self) {
        var _this = this;
		return function style_region(feature, is_selected) {
            if(!is_selected) { is_selected = false; }
            
            var data           = self.get('data');
            var state          = self.get('state');
//          var metric_type    = self.get('state.metric_type.value');
            var metric_type    = 'metric_val';
	        var selected       = self.get('state.selected');
            var threshold_type = _this.get('threshold_type');
	        var thresholds     = _this.get('thresholds');
	        var ths            = _.where(data, {"locus_id" : feature.properties[App.Helper.locus_property(state)]})[0];
                        
            if(selected && is_selected === false) {
                is_selected = _.where(selected, {"locus_id" : feature.properties[App.Helper.locus_property(state)]}).length > 0;
            }
            
            if(ths) {
                if(!ths[metric_type]) {
                    return;
                }
            }
            
			return {
				weight      : 2,
				opacity     : is_selected * 1,
                color       : config.REGION_BORDER_COLOR,
				fillColor   : ths ? _this.get_color(ths[metric_type][threshold_type]) : 'rgba(255, 255, 255, .05)',
				fillOpacity : config.REGION_BASE_OPACITY + is_selected / 5
			};
		};
	},
	make_onEachFeature : function(self, style){
		var info           = self.get('con.heatmap.info');
        var state          = self.get('state');
        var leafletDraw    = self.get('con.leafletDraw');
	
		function mouseover_region(e) {
            if(leafletDraw.filter.on(e)) {
                e.target.setStyle(style(e.target.feature, true));
                if(e.target.feature.properties.is_selected === true) {
                    e.target.setStyle(style(e.target.feature, true));
                }
                info.update(e.target.feature.properties[App.Helper.locus_property(state)], e.target.feature.properties.NAME);
            }
		}
		function mouseout_region(e) {
		  e.target.setStyle(style(e.target.feature, false));
		  // info.update() --> removes info box
		  info.update();
		}
		function click_region(e) {
            var locus_id     = e.target.feature.properties[App.Helper.locus_property(state)];
            var selected_ids = _.pluck(self.get('state.selected'), 'locus_id');

            // If the clicked region is new...
            if(_.difference([locus_id], selected_ids).length !== 0) {
                self.get('con').transitionToRoute('main', e.target.feature.properties[App.Helper.locus_property(state)]);
            }
		}
        function right_click_region(e) {
            var locus_id       = e.target.feature.properties[App.Helper.locus_property(state)];
            var selected_ids   = _.pluck(self.get('state.selected'), 'locus_id');
            
            // If clicked a region that's already selected...
            if(_.contains(selected_ids, locus_id)) {
                selected_ids = _.difference(selected_ids, [locus_id]);
            // else...
            } else {
                selected_ids = _.union(selected_ids, [locus_id]);
            }
            
            var new_route = selected_ids.join(',');
            self.get('con').transitionToRoute('main', new_route);
        }
		return function(feature, layer) {
			layer.on({
				mouseover   : mouseover_region,
				mouseout    : mouseout_region,
				click       : click_region,
                contextmenu : right_click_region
			});
		};
	}
});

App.CityStyler = App.Styler.extend({
	get_layer_params : function(self) {
        var style         = this.make_style(self);
        var onEachFeature = this.make_onEachFeature(self);

        return {
            style         : style,
            pointToLayer  : function(feature, latlng) { return L.circleMarker(latlng); },
            onEachFeature : onEachFeature
        };
	},
    set_thresholds : function() {
        var data           = _.pluck(this.get('targetObject.data'), 'properties');
//		var metric_type    = this.get('targetObject.state.metric_type.value');
        var metric_type 	= 'metric_val';
        var n_steps        	= this.get('n_steps');
        var threshold_type      = this.get('threshold_type');
        var threshold_transform = this.get('threshold_transform');

        var thresholds = App.Styler.compute_thresholds(_.pluck(data, metric_type), n_steps, threshold_type, threshold_transform);
        console.log('CityStyler :: thresholds :: ', thresholds);
        this.set('thresholds', thresholds);
    },
	make_style : function(self) {
        var _this = this;
		return function (feature, latlng) {
            var metric_type = 'metric_val';
			var thresholds  = _this.get('thresholds');

			d   = feature.properties[metric_type];
            col = _this.get_color(d);
			return {
			    radius      : _this.get_radius(d),
			    fillColor   : col,
			    weight      : 1,
			    opacity     : 1,
                color       : 'grey',
			    fillOpacity : 0.8
			};
		};
	},
    make_onEachFeature : function(self) {
        return function(feature, layer) {
        
            var metric_type         = self.get('state.metric_type.value');
            var metric_type_options = self.get('con.metric_type_options');
            
            var out = '<h1 class="tooltip-header"><center>';
            out    += feature.properties.city_name;
            out    += '</center></h1><h4>' + _.findWhere(metric_type_options, {"value" : metric_type}).label;
            out    += ": " + numeral(feature.properties.metric_val).format('0,0') + '</h4>';

            layer.bindPopup(
                L.popup({"autoPan" : false}).setContent(out)
            );
        };
    }
});

App.BranchStyler = App.CityStyler.extend({

    make_onEachFeature : function(self) {
        return function(feature, layer) {
            var metric_type         = self.get('state.metric_type.value');
            var metric_type_options = self.get('con.metric_type_options');
            
            var out = '<h1 class="tooltip-header"><center>';
            out    += feature.properties.branch_name + '/' + feature.properties.city_name;
            out    += '</center></h1><h4>' + _.findWhere(metric_type_options, {"value" : metric_type}).label;
            out    += ": " + numeral(feature.properties.metric_val).format('0,0') + '</h4>';

            layer.bindPopup(
                L.popup({"autoPan" : false}).setContent(out)
            );
        };
    }

});


App.SubjectStyler = App.Styler.extend({
    get_layer_params : function(self) {
        var _this = this;
        
        var center;
        if(config.SUBJECT_GEO_TYPE == 'line') {
            center = _.filter(self.get('data'), function(x) {
                return x.properties.locus_actor == 'subject';
            })[0].geometry.coordinates;
        }
        
        return {
            style        : _this.make_style(),
            pointToLayer : function(feature, latlng) {
                if(config.SUBJECT_GEO_TYPE === 'point') {
                    return L.circleMarker(latlng);
                } else if (config.SUBJECT_GEO_TYPE === 'line'){
                    return L.polyline([new L.LatLng(center[1], center[0]), latlng], {
                        weight  : config.SUBJECT_LINE_WEIGHT,
                        opacity : config.SUBJECT_LINE_OPACITY
                    });
                }
            },
            onEachFeature : _this.make_onEachFeature()
        };
    },
    set_thresholds : function() {
        var data           = _.pluck(this.get('targetObject.data'), 'properties');
//		var metric_type    = this.get('targetObject.state.metric_type.value');
        var metric_type = 'metric_val';
        var n_steps        = this.get('n_steps');

        var threshold_type = this.get('threshold_type');
        var threshold_transform = this.get('threshold_transform');

        var thresholds = App.Styler.compute_thresholds(_.pluck(data, metric_type), n_steps, threshold_type, threshold_transform);
        this.set('thresholds', thresholds);
    },
    make_style : function() {
        return function(feature, latlng) {
            return {
                fillColor   : config.SUBJECT_GEOPOINT_COLORS[feature.properties.locus_actor],
                color       : config.SUBJECT_GEOPOINT_COLORS[feature.properties.locus_actor],
                fillOpacity : 0.5,
                opacity     : 0.5,
                radius      : feature.properties.locus_actor == 'subject' ? 6 : 2
            };
        };
    },
    make_onEachFeature : function() {
        return function(feature, layer) {
            var out = '<h1 class="tooltip-header"><center>';
            out    += feature.properties.city_name;
            out    += '</center></h1><h5> Filings </h5>';
            out    += feature.properties.id; // FEATURE -- this should be a link
            out    += "<h5> Location of </h5>";
            out    += feature.properties.locus_actor;
            layer.bindPopup(out);
        };
    },
    set_legend : function() {
        return false;
    },
    clear_legend : function() {
        return false;
    }
});

App.Legend = Ember.Object.extend({
    widget     : undefined,
    title      : "",
    get_html   : function(thresholds, colors) {
        if(!thresholds) {
            return '<div></div>';
        }
        
		var labels = [];
		var from, to, col;
		for (var i = 0; i < thresholds.length; i++) {
			from = thresholds[i];
			to   = thresholds[i + 1];
            
            from_nice = numeral(from).format('0.[000]a');
            to_nice   = numeral(to).format('0.[000]a');
                        
			col = colors[i];
            
            var str = (i + 1) == thresholds.length ?
                        (from_nice + '+') :
                        (from_nice + '&ndash;' + to_nice);
            
			labels.push(
				'<tr>' +
                    '<td>' + str + '</td>' +
                    '<td> <i style="background:' + col + '"></i> </td>' +
                '</tr>'
			);
		}
        return '<div class="legend-title"> ' + this.get('title') + ' </div> <table>' + labels.join('') + '</table>';
    },
    change_html : function(thresholds, colors) {
        var widget = this.get('widget');
        widget._container.innerHTML = this.get_html(thresholds, colors);
    },
    show : function() {
        var widget = this.get('widget');
        $(widget._container).css('display', 'block');
    },
    hide : function() {
        var widget = this.get('widget');
        $(widget._container).css('display', 'none');
    },
    // *** COLORPICKER : actual modal ***
    color_picker_modal : function(targetObject) {
        Ember.Widgets.ModalComponent.popup({
			primary : {
            // *** COLORPICKER : (basically) treat as a controller ***
            targetObject     : targetObject,
            rawColors	     : targetObject.get('colors'),
            colors		     : targetObject.get('colors').map(function (ele) {return {"value":ele};}),
            numButtons	     : targetObject.get('colors').length,
            n_steps          : targetObject.get('n_steps'),
            n_ticks          : parseInt(1),
            n_min            : parseInt(2),
            n_max            : parseInt(12),
            threshold_type   : targetObject.get('threshold_type'),
            // colorpicker : undefined,
            headerText       : "Legend Colors",
            confirmText      : "Done",
            cancelText       : undefined,
            // *** COLORPICKER : function that gets called with you click DONE ***
            confirm          : function() {
                var targetObject = this.get('targetObject');
                var n_steps      = parseInt(this.get('n_steps'));
                var colors	     = [];
                var i	     = 0;
		
                for(i=0;i<this.colors.length;i++){
                    colors.push(this.colors[i].value);
                }

				n_steps = $("#color-slider").slider('value');
                    
				targetObject.set('colors', colors);
					
                if(isNaN(n_steps)) {
                    alert('Invalid number!');
                } else {
                    targetObject.set('n_steps', n_steps);
                }
            },
            classNames : ['color-picker-modal'],
     
            // Broke out this function, so we can call it from multipe places
            add_widgets : function() {
                Ember.$(".basic").spectrum({
                    preferredFormat        : "name",
                    showAlpha              : true,
                });
            },
			get_colors : function() {
				return this.get('colors');
			},
            // *** COLORPICKER : Reference to the view
            contentViewClass : App.ColorPickerModalView,
            }
    });
  }
});

App.Legend.reopenClass({
    make : function(self, map, params) {
        params = params || {};
        var legend = App.Legend.create(params);
		var widget = L.control({position: 'bottomright'});
		widget.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			div.innerHTML = legend.get_html();
            
            // ** COLORPICKER : function that triggers the popup *//
            div.oncontextmenu = function(e) {
				legend.color_picker_modal(self);
                return false;
            };
			return div;
		};
		widget.addTo(map);
        legend.set('widget', widget);
        return legend;
    }
});

// COLORPICKER : View for colorpicker modal
App.ColorPickerModalView = Ember.View.extend({
    templateName : 'color-picker',
    didInsertElement : function() {
        // Call the function to initialize the widgets
        var con = this.get('controller');
        con.add_widgets();
        Ember.$("#color-slider").slider({
            min   	 : con.get('n_min'),
            max    	 : con.get('n_max'),
            step   	 : con.get('n_ticks'),
            value    : con.get('n_steps'),
            change   : function(event, ui) {
                con.set('n_steps', ui.value);
			}
        });
    },    
	actions: {
		numColors : function(value) {
        var con    = this.get('controller');
        var colors = con.get_colors();

		if (value === 'more') {
			if(colors.length < con.get('n_max')){ 
				colors.pushObject({'value':'red'});
		}		
        } else {
			if(colors.length > con.get('n_min')){
                colors.popObject();
			}
        }
                        
        con.set('numButtons', colors.length);
                        
           // Run the add_widgets function, but on the next
          // event cycle
         // This adds the bit of delay necessary to allow jQuery
        // to find the element, apparently.
        Ember.run.next(con, con.add_widgets);
		}
	}
});


App.GFLayer = Ember.Object.extend({
    name  : undefined,
    map   : undefined,
    con   : undefined,
    state : undefined,

    params : undefined,

    init_layer : undefined,
    
    layer     : undefined,
    has_layer : function(){ return this.get('layer') || undefined;},

    data          : [],
    styler        : undefined,
    endpoint_name : undefined, // Which endpoint to hit for data
    
    // Shapefile borders on map
    all_borders : undefined,
    borders : function() {
        return this.get('all_borders')[this.get('state.borders_selection.value')];
    }.property('state.borders_selection.value'),
    border_selection_did_change : function() {
        this.pop_layer();
    }.observes('state.borders_selection.value'),
    
    // Whether the layer is shown on the map
    visible            : true,
    visible_did_change : function() { this.draw_if_visible(); }.observes('visible'),

    // If visible, set color thresholds, add legend and draw layer
    // Otehrwise, remove the legend and remove the layer
    draw_if_visible : function() {
        var self   = this;
        var styler = this.get('styler');
        
        if(self.get('visible')) {
            if(!self.has_layer() && self.init_layer) {
                self.init_layer();
            }
            styler.set_thresholds();
            styler.set_legend();
            self.redraw_layer();
        } else {
            styler.clear_legend();
            self.pop_layer();
        }
    },
    
    // Refresh data if visible or forced to
    // Otherwise, just redraw
    refresh : function(force) {
        var self = this;
        var params;
        params = this.get('params');
        if(self.get('visible') || force) {
            console.log('sending force -- ', self.get('state'));
            self.get('con.client')[self.get('endpoint_name')](self.get('state'), function(response) {
                console.log('getting -- ');
                console.log('refreshing data:: ', response);
                
                self.set('data', response.data);
                self.set('eub',  response.eub);
                self.draw_if_visible();
            }, params);
        } else {
            self.draw_if_visible();
        }
    },
    // Remove layer from map
    pop_layer : function() {
        if(this.has_layer()) {
            this.get('map').removeLayer(this.get('layer'));
            this.set('layer', undefined);
        }
    },
    // Remove highlighting from layer
    reset_layer : function() {
        this.draw_if_visible(); // ()_
        if(this.has_layer()) {
            var layer = this.get('layer');
            _.map(layer._layers, function(l) {
                l.feature.properties.is_selected = false;
                layer.resetStyle(l);
            });
        }
    },
    grab : function(leafletDraw) {
        return leafletDraw.filter.getBounds();
    },
    
    // > 1.0.0 DEV
    // Handling optional parameters
    params_observer : function() {
        console.log('data layer observing local parameter change');
        this.refresh(true);
    },
    bind_params_on_init : function() {
        var self = this;
        var param_keys = _.keys(this.get('params'));
        _.map(param_keys, function(k) {
            self.get('params').addObserver(k, self, 'params_observer');
        });
    }.on('init')

});

App.RegionLayer = App.GFLayer.extend({
    init_layer : function() {
        var self    = this;
        var map     = self.get('map');
        var styler  = self.get('styler');
        var borders = self.get('borders');
        
        if(self.get('visible')) {
            var params = styler.get_layer_params(self);
            var layer  = L.geoJson(borders, params);
            layer.addTo(map);
            self.set('layer', layer);
        }
    },
    redraw_layer : function() {
        var self   = this;
        var styler = this.get('styler');
        self.get('layer').setStyle(
            styler.make_style(self)
        );
    },
    bounds_from_selected : function(selected) {
        var borders_selection = this.get('state.borders_selection');
        var mtc = _.filter(this.get('layer')._layers, function(e) {
            return e.feature.properties[App.Helper.locus_property(borders_selection)] == selected[0].locus_id;
        })[0];
        return mtc.getBounds();
    },
    grab : function(leafletDraw) {
        var layer = this.get('layer');
        var borders_selection = this.get('state.borders_selection');
        
        if(layer !== undefined) {
            var res = _.chain(layer._layers)
            .map(function(l) {
                leafletDraw.isWithinSelectedRegion(l);
                layer.resetStyle(l);
                return l.feature.properties.is_selected ? l : undefined;
            })
            .filter(function(l) {return l !== undefined;})
            .filter(function(l) {return l.feature.properties[App.Helper.locus_property(borders_selection)];})
            .value();

            return _.map(res, function(l) {
                return {
                    "name"     : l.feature.properties.NAME,
                    "locus_id" : l.feature.properties[App.Helper.locus_property(borders_selection)]
                };
            });
        }
    }
});

// This looks slightly different from
// the country object, because we aren't refreshing
// country data each time...
App.GFPointLayer = App.GFLayer.extend({
    redraw_layer : function() {
        var self   = this;
        var data   = self.get('data');
        var map    = self.get('map');
        var styler = self.get('styler');
        
        self.pop_layer();
        if(data) {
            var params = styler.get_layer_params(self);
            layer      = L.geoJson(_.filter(data, function(x) {return x.geometry.coordinates;}), params);
            layer.addTo(map);
            self.set('layer', layer);
        }
    }
});

App.CityLayer    = App.GFPointLayer.extend();
App.BranchLayer  = App.GFPointLayer.extend();

App.ApsLayer = App.GFPointLayer.extend({
    params : Ember.Object.create({
        "profile_type"      : "freq",
        "profile_fieldname" : "gfloc.best.id"
    })
});

App.SubjectLayer = App.GFPointLayer.extend({
    params : Ember.Object.create({
        "single_subject_key"      : undefined
    })
});

App.Heatmap = Ember.Object.extend({
    con         : undefined,
    state       : undefined,
    map         : function() {return App.LeafletMap.make();}.property(),
    all_borders : undefined,
    
    // This is undesirable -- should store country list
    // in another file, or in an index...
    borders : function() {
        return this.get('all_borders')[this.get('state.borders_selection.value')];
    }.property('state.borders_selection.value'),
    
    // Geofin-1.0.1
    // This is sortof a hack -- should just be able to zoom to the extend of
    // the shape files, though that doesn't work for continental US.
    borders_did_change : function() {
        cont_us_bounds = [[25, -124],[50,-59]];
            global_bounds  = [[-60, -180], [60, 180]];
        if(this.get('state.borders_selection.value') == 'state') {
            this.get('map').fitBounds(cont_us_bounds);
        } else {
            this.get('map').fitBounds(global_bounds);
        }
    }.observes('state.borders_selection.value').on('init'),
    
    
	place_list  : function() {
		return App.Helper.make_place_list(this.get('borders'), this.get('state.borders_selection'));
	}.property('borders'),
    
	info : function() {
        return App.Info.make(this, this.get('con'));
    }.property(),

    // Update all layers
    update_all  : function() {
        var self        = this;
        var layer_names = this.get('layer_names');
        _.map(layer_names, function(ln) { self.get(ln).refresh(); });
    },
    
    reset_all  : function() {
        var self = this;
        var layer_names = this.get('layer_names');
        _.map(layer_names, function(ln) { self.get(ln).reset_layer(); });
    },

    layer_names : ['region', 'city', 'branch', 'subject'],
    region : function() {
        var region =  App.RegionLayer.create({
            name          : "Regions",
            con           : this.get('con'),
            map           : this.get('map'),
            state         : this.get('state'),
            endpoint_name : 'run_fetch_global',
            visible       : true,
            all_borders   : this.get('all_borders')
        });
        region.set('styler', App.RegionStyler.create({
            targetObject : region,
            colors       : config.DEFAULT_REGION_COLORS
        }));
        return region;
    }.property(),
    city : function() {
        var city = App.CityLayer.create({
            name		  : "Cities",
            con           : this.get('con'),
            map           : this.get('map'),
            state         : this.get('state'),
            endpoint_name : 'run_fetch_populated_places',
            visible       : false,
            all_borders   : this.get('all_borders')
        });
        city.set('styler', App.CityStyler.create({
            targetObject : city,
            colors       : config.DEFAULT_CITY_COLORS,
            n_steps      : 3
        }));
        return city;
    }.property(),
    branch : function() {
        var branch =  App.BranchLayer.create({
            name		  : "Branches",
            con           : this.get('con'),
            map           : this.get('map'),
            state         : this.get('state'),
            endpoint_name : 'run_fetch_branches',
            visible       : false,
            all_borders   : this.get('all_borders')
        });
        branch.set('styler', App.BranchStyler.create({
            targetObject : branch,
            colors       : ['black', 'lightgreen', 'lime']
        }));
        return branch;
    }.property(),
    subject : function() {return App.SubjectLayer.create({
        name		  : "Subjects",
        con           : this.get('con'),
        map           : this.get('map'),
        state         : this.get('state'),
        styler        : App.SubjectStyler.create(),
        endpoint_name : 'run_fetch_subject_geo',
        visible       : true,
        all_borders   : this.get('all_borders')
    });}.property() //,

//    aps : function() {return App.ApsLayer.create({
//        name : "Associated Places",
//        con           : this.get('con'),
//        map           : this.get('map'),
//        state         : this.get('state'),
//        styler        : App.SubjectStyler.create(),
//        endpoint_name : 'run_fetch_associated_places',
//        visible       : false,
//        all_borders   : this.get('all_borders')
//    })}.property()
});

App.LeafletMap = Ember.Object.extend({});

App.LeafletMap.reopenClass({
    make : function() {
        console.log((config.TESTING ? config.TESTING_DOMAIN : '') + config.TILE_IP);

        var map = L.map('map', {worldCopyJump : false, keyboard : false}).setView([0, 0], 2);
        L.tileLayer((config.TESTING ? config.TESTING_DOMAIN : '') + config.TILE_IP, config.LEAFLET_CONFIG).addTo(map);
        return map;
    }
});

App.Info = Ember.Object.extend({});
App.Info.reopenClass({
    make : function(self, con) {
        var map  = self.get('map');
        var info = L.control();
        info.onAdd = function () {
            this._div = L.DomUtil.create('div', 'info');
            this.update();
            return this._div;
        };
        info.update = function (iso, name) {
            var content;

            if(iso && name) {
                // _.findWhere returns undefined if nothing is found
                var rel = _.findWhere(self.get('region.data'), {'locus_id' : iso});
                
                if(!rel) {
                    rel = {};
                }
                var excluded = ['doc_count', 'locus_id', 'metric_val'];
                
                content = '<div id="info-box"><h4>' + name + '</h4>';

                _.chain(rel)
                 .keys()
                 .difference(excluded)
                 .map(function(k) {
                    content += '<h4 style="margin-bottom:0px">' + _.findWhere(con.get('metric_type_options'), {"value" : k}).label + ' : ' + numeral(rel[k].val).format('0.[00]a') + ' </h4>' + '<span>(Rank: ' + rel[k].rank + ')</span>';
                });
                    
                content += '</div>';
                this._div.innerHTML = content;
            } else {
				content += '';
				this._div.innerHTML = content;
			}
        };
        info.addTo(map);
        return info;
    }
});


App.LeafletDraw = Ember.Object.extend({
	filter : undefined,
	isWithinSelectedRegion : function(layer) {
	    var bounds = this.filter.getBounds();
        var val;
        if (bounds) {
            val = bounds.contains(layer.getBounds());
        }else{
            val = false;
        }
	    layer.feature.properties.is_selected = val;
	}
});

App.LeafletDraw.reopenClass({
    make : function() {
		var leafletDraw = App.LeafletDraw.create();
		leafletDraw.set('filter',new L.FeatureGroup());
		return leafletDraw;
	}
});

App.State = Ember.Object.extend(App.Serializable, {
    counter : 0,

    borders_selection : config.BORDER_TYPE_OPTIONS[config.DEFAULT_BORDER_TYPE],
    
	start_date        : config.DEFAULT_SLIDER_START_DATE,
	end_date          : config.DEFAULT_SLIDER_END_DATE,
	selected          : undefined,
    selected_bounds   : undefined,
	conditioned       : false,
	form_types        : undefined,

    user_query        : config.SUBSET_OPTIONS[config.DEFAULT_SUBSET],
	metric_type       : config.METRIC_TYPE_OPTIONS[config.DEFAULT_METRIC_TYPE],
	norm_type         : config.NORM_TYPE_OPTIONS[config.DEFAULT_NORM_TYPE],

    ts_resolution     : config.TS_RESOLUTION_OPTIONS[config.DEFAULT_TS_RESOLUTION],
    exact_geoname     : config.DEFAULT_EXACT_GEONAME,
    
    // This is hacky, but seems necessary because properties weren't getting serialized properly
    active_columns  : [],
    _active_columns : function() {
        this.set('active_columns', [this.get('metric_type')]);
    }.observes('metric_type.value').on('init'),

    accuracies : config.DEFAULT_ACCURACIES,

    clear_state: function() {
        this.set('selected',        undefined);
        this.set('selected_bounds', undefined);
        this.set('conditioned',     false);
    },
});

App.MainRoute = App.GRoute.extend({
	model : function(params) {
        var state, client, client_promise, con, self;
        
        con = this.get('controller');
        if(con) {
            // Keep track of where we're coming from
            con.set('prevRoute', App.__container__.lookup("controller:application").get("currentRouteName"));

            // Using existing state
            self   = this;
            state  = con.get('state');
            client = con.get('client');
            
            if(params.selection_url != config.DEFAULT_PATH) {
                try {
                    var selection_url_json = JSON.parse(params.selection_url);
                    console.log('selection_url_json', selection_url_json);
                    con.get('heatmap.map').fitBounds(selection_url_json, {"animate" : true});
                } catch(e) {
                    // This means that we're making a server call for every region that's clicked
                    // This is slower.  Might want to add an option that we don't make the call
                    // if we already have the borders locally...
                    
                    client.get_locus_name(params.selection_url, state, function(selected) {
                        state.set('selected', selected);
                        con.send('selected_changed');
                        
                        // Go back to where you came from
                        var prevRoute = con.get('prevRoute');
                        console.log('++ prevRoute', prevRoute);
                        if (prevRoute && (prevRoute !== 'main.index')) {
                            self.transitionTo(prevRoute);
                        }else{
                            self.transitionTo(config.DEFAULT_GFPANEL);
                        }
                    }, con.get('heatmap.all_borders'));
                }
            } else { // +_+
                var prevRoute = con.get('prevRoute');
                console.log('++ prevRoute', prevRoute);
                if (prevRoute && (prevRoute !== 'main.index')) {
                    self.transitionTo(prevRoute);
                } else {
                    self.transitionTo(config.DEFAULT_GFPANEL);
                }
            }

            return new Ember.RSVP.Promise(function(resolve, reject) {
                Ember.run(this, resolve, [client, state]);
            });
        } else {
            // Making a new state, client, ...
            state          = App.State.create();
            client_promise = App.Client.make(config.TESTING ? config.TESTING_DOMAIN : config.NODE_PATH);

            return new Ember.RSVP.Promise(function(resolve, reject) {
                client_promise.then(function(client) {
                
                    if(params.selection_url != config.DEFAULT_PATH) {
                        client.get_locus_name(params.selection_url, state, function(selected) {
                            state.set('selected', selected);
                        });
                    }

                    Ember.run(this, resolve, [client, state]);
                    
                    // After client and state exist
                    if(config.DO_MSH) { client.__msh__(); }
                });
            });
        }
    },
	setupController : function(con, model) {
        con.set('client', model[0]);
        con.set('state', model[1]);
    }
});


App.MainController = Ember.Controller.extend({

	needs        : ['application'],
    slider_open  : false,

	client         : undefined,
    state          : null,

	heatmap        : undefined,
	leafletDraw    : undefined,

	locus          : undefined, // For dropdown menu
	
	norm_type_options     : config.NORM_TYPE_OPTIONS,
    metric_type_options   : config.METRIC_TYPE_OPTIONS,
    subset_options        : config.SUBSET_OPTIONS,
            
    border_type_options   : config.BORDER_TYPE_OPTIONS,
    ts_resolution_options : config.TS_RESOLUTION_OPTIONS,

    snapper                   : undefined,
    // <sidebar>
    expanded                 : false,
    tsdata                   : undefined,
    dissect_form_type        : undefined,
    dissect_form_type_fields : [],
    dissect_form_type_field  : undefined,
    dissection               : undefined,
    // </sidebar>
    
    isAdmin : function() {return App.isAdmin();}.property(),
    
	locus_changed : function() {
        var locLocus = this.get('locus');
        var stated   = this.get('state.selected');
		
        if(locLocus && (!stated || !_.isEqual(locLocus.locii[0], stated[0]))) {
            this.transitionToRoute('main', _.pluck(locLocus.locii, 'locus_id').join(','));
		}
	}.observes('locus'),
    
    state_changed: function() {
        console.log('! --- state changed --- !', + new Date());
        this.update_all();
    }, // Observes counter

    _force_state_change : function(){
        console.log('! --- force_state_change --- !', + new Date());
        var c = this.get('state.counter');

        if(this.get('state')) {
            console.log('! --- counter:', c + 1, ' --- !');
            this.set('state.counter', c + 1);
        }
    },

    force_state_change : function() {
        Ember.run.debounce(this, '_force_state_change', 250 + (config.TESTING * 1500), true);
    },
    
    state_observer : function(){
        console.log('! --- state observer --- !');
        Ember.run.debounce(this, 'force_state_change', 250 + (config.TESTING * 1500), true);
    }.observes("state.start_date","state.end_date","state.selected","state.selected_bounds","state.form_types","state.norm_type","state.borders_selection","state.user_query","state.ts_resolution","state.exact_geoname","state.metric_type"),


    borders_selection_changed : function() {
        this.send('clear_selection');
    },

	// Update both
    //  map view
    //  selected data
	update_all : function() {
        if(this.get('heatmap')){
            this.get('heatmap').update_all();
        } else {
            console.log('? -- no heatmap -- ?');
        }
    },
    reset_all : function() {
        if(this.get('heatmap')) {
            this.get('heatmap').reset_all();
        } else {
            console.log('? -- no heatmap -- ?');
        }
    },
    
    // ----------------- From sidebar -------------------
    show_form_modal : function(f) {
        var self       = this;
        var form_types = _.findWhere(this.get('state.form_types'), {'form_type' : f});
        Ember.Widgets.ModalComponent.popup({
            primary : {
                targetObject     : self,
                headerText       : form_types.form_type.toUpperCase().replace('TYPE_', '') + ' Definitions',
                confirmText      : "Done",
                cancelText       : undefined,
                content          : form_types,
                classNames       : ['form-type-modal'],
                contentViewClass : App.FormTypeModalView,
            },
            computed : {
                actions : {
                    toggle_subfield : function(subfield) {
                        if(subfield.toggled) {
                            Ember.set(subfield, 'toggled', false);
                        } else {
                            Ember.set(subfield, 'toggled', true);
                        }
                        self.force_state_change();
                    }
                }
            }
        });
    },
    
    actions : {
        go_to_default: function() {
            this.transitionToRoute("main", config.DEFAULT_PATH);
        },

        selected_changed : function() {
            // Change select menu as appropriate
            var selected = this.get('state.selected');
            var locLocus = this.get('locus');

            if(!selected) {
                this.set('locus', undefined);
            } else if(selected.length === 1) {
                if(!locLocus || !selected || !_.isEqual(locLocus.locii[0], selected[0])) {
                    this.set('locus', {name : selected[0].name, locii : selected});
                }
            } else if(selected.length > 1) {
                this.set('locus', {name : "Multiple Regions", locii : selected});
            }
                        
            // Open snapper and zoom
            if(selected) {
                this.get('snapper').open('left');
                if(selected.length === 1) {
                    try {
                        // BUG -- This won't work when we're looking at cities or multiple countries
                        // Should be able to extend this to any layer...
                        var bounds = this.get('heatmap.region').bounds_from_selected(selected);
                        
                        this.get('heatmap.map').fitBounds(bounds, {"animate" : false});

                        // Adjust center
                        var map    = this.get('heatmap.map');
                        var offset = config.OFFSET_CONSTANT * map.getSize().x;
                        map.panBy(new L.Point(offset, 0), {"animate": false});
                    } catch(e) {
                        console.log('failing to fit bounds!');
                    }
                }
            }
            
        },

		toggle_form : function(f) {
            var n_toggled = _.chain(this.get('state.form_types')).pluck('toggled').filter().value().length;
            if(f.toggled & n_toggled === 1) {
                alert('Cannot disable all form types.');
            } else {
                f.toggleProperty('toggled');
                this.force_state_change();
            }
		},
				
		// -----------------------------------------------------------
		// A bunch of the styling here should be moved to Heatmap.js
		grab_regions : function() {
			var leafletDraw  = this.get('leafletDraw');
            var selected     = this.get('heatmap.region').grab(leafletDraw);

            var currRoute = _.pluck(this.get('state.selected'), 'locus_id').join(',');
            var newRoute  = _.pluck(selected, 'locus_id').join(',');
            
            if(newRoute !== currRoute & newRoute !== '') {
                this.send('clear_selection');
                this.transitionToRoute('main', newRoute);
            }
		},

        grab_cities : function(){
            this.send('clear_selection');

            var leafletDraw     = this.get('leafletDraw');
            var selected_bounds = this.get('heatmap.city').grab(leafletDraw);

            this.set('state.selected_bounds', selected_bounds);

            this.transitionToRoute('city');

            this.get('snapper').open('left');

            this.set('state.selected', true);
            this.set('heatmap.city.visible', true);

            this.update_all();
		},

		clear_selection : function() {
            this.get('state').clear_state();
            
            this.reset_all();
            this.update_all();
            
            this.send('go_to_default');
		},
        
        define_metric : function() {
            App.AddColumnModal.add_modal(this);
        }
    }
});

App.MainView = Ember.View.extend({
  didInsertElement : function() {
        console.log('& --- inserting main view --- &');

		var con     = this.get('controller');
		var client  = con.get('client');
		var state   = con.get('state');
		
		client.get_borders(function(all_borders) {
            // Setup form types -- there's a bug in the types somewhere -- why do I need to copy?
            state.set('form_types', _.map(client.get('form_types'), function(x) {
                return Ember.Object.create(x);
            }));

            var heatmap = App.Heatmap.create({
                "con"          : con,
                "state"        : state,
                "all_borders"  : all_borders
            });
            con.set('heatmap', heatmap);

            // DOM Elements //
            
            /* On Window Resize */
            // Just some housekeeping on DOM positions, etc...
            $( window ).on('resize', function() {
                // Keep Leaflet attribution above bottom navbar
               
                // reset the heat map size for redrawing
                var map = con.get('heatmap.map');
                // heat map is not always up on resizing
                if(map !== undefined){
                    map.invalidateSize();
                }
                
                $('.leaflet-bottom').css('padding-bottom', $('#lower-navbar').css('height'));

                // Width of snapper drawer
                var width = Math.round($(window).width() * config.SNAPPER_WIDTH);
                con.get('snapper').settings({
                    maxPosition : width
                });
                $(".drawer-inner").css('width', width);
            });
            
            /* Snapper (i.e. Drawers on LHS) */
            var snapper = new Snap({
              element      : document.getElementById('content'),
              disable      : 'right'
            });
            snapper.on('open', function() {
                con.set('slider_open', true);
                Ember.run.next(this, function() {
                    Ember.$(window).trigger('resize');
                });
            });
            snapper.on('close', function() {
                con.set('slider_open', false);
                Ember.run.next(this, function() {
                    Ember.$(window).trigger('resize');
                });
            });
            con.set('snapper', snapper);
            
            document.getElementById('open-left').addEventListener('click', function(){
                if(con.get('slider_open') === true) {
                    snapper.close('left');
                    con.set('slider_open', false);
                } else {
                    snapper.open('left');
                    con.set('slider_open', true);
                }
                Ember.run.next(this, function() {
                    Ember.$(window).trigger('resize');
                });
            });
            /* End Snapper */

            /* Date Range Slider */
            /* This gives an error with Karma tests for some reason, so
                we turn it off in testing mode and hardcode the dates.
                Weird, but I don't see any real problem with it. 
                Error is I think due to misordering of events in the 
                teardown/setup loop. */
            if(!config.TESTING){
                Ember.$("#slider").dateRangeSlider({
                    bounds: {
                        min: new Date(config.SLIDER_LOWER_LIMIT),
                        max: new Date(config.SLIDER_UPPER_LIMIT)  
                    },
                    defaultValues: {
                        min: new Date(config.DEFAULT_SLIDER_START_DATE),
                        max: new Date(config.DEFAULT_SLIDER_END_DATE)
                    },
                    step: {
                        months : config.SLIDER_STEP_IN_MONTHS
                    }
                });
                
                $("#slider").bind("valuesChanged", function(e, data) {
                    if(con.get('state.start_date') != data.values.min) {
                        con.set('state.start_date', data.values.min);
                    }
                    if(con.get('state.end_date') != data.values.max) {
                        con.set('state.end_date', data.values.max);
                    }
                });
            } else {
                con.set('state.start_date', config.DEFAULT_SLIDER_START_DATE);
                con.set('state.end_date', config.DEFAULT_SLIDER_END_DATE);
            }
            /* End Slider */

            /* Form Selector */
            document.addEventListener('contextmenu', function(e) {
                if($(e.target).attr('class') == 'form-select-link') {
                    con.show_form_modal($(e.target).attr('id'));
                    e.preventDefault();
                }
            }, false);
            /* End Form Selector */
            // End DOM Elements //
            
            /* Leaflet.draw  */
            var map = con.get('heatmap.map');

            L.drawLocal.draw.toolbar.buttons.rectangle        = "Select Regions";
            L.drawLocal.draw.handlers.rectangle.tooltip.start = "Click and Drag to Select Region";
            L.drawLocal.draw.toolbar.buttons.square           = "Select Cities";
            L.drawLocal.draw.handlers.square.tooltip.start    = "Click and Drag to Select Cities";

            var leafletDraw = App.LeafletDraw.make();
            var drawnItems  = new L.FeatureGroup();

            drawControl = new L.Control.Draw({
                draw: {
                     rectangle : {
                        shapeOptions: {
                            color: '#fff'
                             },
                        repeatMode: false
                     },
                     square : {
                         shapeOptions: {
                             color: '#fff'
                         },
                        repeatMode: false
                     },
                     polygon   : false,
                     marker    : false,
                     polyline  : false,
                     circle    : false
                },
                edit: {
                    featureGroup : drawnItems,
                    remove       : false,
                    edit         : false
                }
            });


            map.on('draw:created', function(e) {
                var type  = e.layerType;
                var layer = e.layer;
               
                layer.addTo(drawnItems);
                leafletDraw.filter.addLayer(layer);

                if(type === 'rectangle') {
                    con.send('grab_regions');
                } else if(type === 'square') {
                    con.send('grab_cities');
                }
                
                leafletDraw.filter.removeLayer(layer);
            });

            
            map.addControl(drawControl);

            con.set('leafletDraw',leafletDraw);
             
            $(".nav-tabs-sidebar li").on('click', function(e) {
                Ember.$('.nav-tabs-sidebar li').not(Ember.$(e.target.parentNode)).removeClass('clicked');
                Ember.$(e.target.parentNode).addClass('clicked');
            });
            /* End change color on click */

            // Load data, setup observers, etc
            con.update_all();
            state.addObserver('counter', con, 'state_changed');
            state.addObserver('borders_selection.value', con, 'borders_selection_changed'); // +_+
            Ember.$(window).trigger('resize');
        });
    }
});

App.GfSelectComponent = Ember.Widgets.SelectComponent.extend({});


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



//App.DissectionChartView = Ember.ContainerView.extend({
//	has_charts : false,
//	init : function() {
//		this._super();
//		this.append_charts();
//	},
//	childViews : [],
//	
//    append_charts: function(){
//		var field_type = this.get('controller.dissect_form_type_field.type');
//        var dissection = this.get('controller.dissection');
//        
//		if(dissection != undefined) {
//			if(this.toArray().length > 0) {
//				this.popObject();
//                this.popObject();
//			}
//            
//            // Only happens if we're looking at something categorical
//            if(field_type == 'string') {
//                this.add_bar_data(this, dissection);
//            }
//            
//            this.add_time_data(this, dissection);
//		}
//    }.observes('controller.dissection'),
//    
//    add_bar_data : function(container, dissection) {
//        var bar_data = _.map(dissection, function(x) {
//            return {
//                "label" : x.key,
//                "value" : x.count,
//                "group" : 'Group'
//            }
//        });
//        
//        container.pushObject(Ember.View.create({
//            templateName : 'barchart',
//            data         : bar_data,
//            title        : "Dissection Chart (Bar)"
//        }));
//    },
//    
//    add_time_data : function(container, dissection) {
//    	console.log('dissection', dissection)
//        var time_data = _.chain(dissection).map(function(x) {
//			var key = x.key;
//			return _.map(x.date_agg.buckets, function(b) {
//				return {
//					value : b.doc_count,
//					time  : new Date(b.key),
//					label : key
//				}
//			})
//        }).flatten().value();
//
//        container.pushObject(Ember.View.create({
//            templateName : 'timechart',
//            data         : time_data,
//            title        : "Dissection Chart (Time)"
//        }));
//    }
//});
//
////App.ChartView = Ember.ContainerView.extend({
////
////	has_charts : false,
////	init : function() {
////		this._super();
////		this.append_charts();
////	},
////	childViews : [],
////	
////    append_charts: function(){
////		var tsdata = this.get('controller').get('tsdata');
////		var has_charts = this.get('has_charts');
////		if(!has_charts && tsdata != undefined) {
////			this.set('has_charts', true);
////
////			count_data = _.map(tsdata, function(x) {
////				return {
////					"time"  : new Date(x.date),
////					"value" : Math.log(x.count + 1) / Math.LN10,
////					"label" : x.type
////				}
////			});
////			var count_view = Ember.View.create({
////				templateName : 'timeserieschart',
////				data         : count_data,
////				title        : "Transaction Volume over Time (logscale)"
////			});
////			this.pushObject(count_view);
////			
////			amount_data = _.map(tsdata, function(x) {
////				return {
////					"time"  : new Date(x.date),
////					"value" : Math.log(x.amount + 1) / Math.LN10,
////					"label" : x.type
////				}
////			});
////			var amount_view = Ember.View.create({
////				templateName : 'timeserieschart',
////				data         : amount_data,
////				title        : "Transaction Value over Time (logscale)"
////			})
////			this.pushObject(amount_view)
////		}
////    }.observes('controller.tsdata')
////});
////

var registerRowProperty = function(fname) {
    return function(key, value) {
        var column, row;
        row    = this.get('rowContent');
        column = this.get('column');
        if (!(row && column)) {
            return;
        }
        if (arguments.length === 1) {
            value = column[fname](row);
        } else {
            column.setCellContent(row, value);
        }
        return value;
    };
};

App.TimeSeriesSparkCellHeaderView = Ember.Table.HeaderCell.extend({
    templateName : 'table_cells/time-series-header-cell',

    didInsertElement : function() {
        this._super();

        var _this = this;
        $('#time-series-context').contextmenu({
            target : '#time-series-context-menu',
            onItem : function(context, e) {
                _this.send('toggle_property', $(e.target).attr('id'));
                $(e.target).toggleClass('context-menu-selected');
            }
        });
    },

    click : function() {
        console.log('clicking disabled... right click instead...');
    },
    
    actions : {
        toggle_property : function(p) {
            this.toggleProperty('controller.' + p, true);
        }
    }
});

// Hardcoded dependency on having the contentpath be "data"
App.ServerHeaderCell = Ember.Table.HeaderCell.extend({
    templateName : 'table_cells/server-header-cell',
    targetDataPath : 'data',
    server_sort_simple_column : function(table_con, view) {
        var self = this;
        
        var content               = table_con.get('content');
        var current_sorted_column = table_con.get('current_sorted_column');
        var can_sort              = view.content.can_sort;
        
        if(can_sort) {
            var new_sorted_column = view.content.sortPath || view.content.contentPath;
            if(current_sorted_column == new_sorted_column) {
                table_con.toggleProperty('reverseSort');
            } else {
                table_con.set('reverseSort', true);
            }
            
            var reversed = table_con.get('reverseSort');
            
            // Update state of modal
            var targ = table_con.get('targetObject');
            targ.set('sortBy', new_sorted_column);
            targ.set('reverse', reversed);
            targ.set('page', 0);
            
            targ.get('fetchers')[targ.get('current_fetcher')]({
                     'sortBy'  : new_sorted_column,
                     'reverse' : reversed,
                     'page'    : 0
            }, function(new_content) {
                    table_con.set('current_sorted_column', new_sorted_column);
                    table_con.set('content', new_content.reports);

                    targ.set(self.get('targetDataPath'), new_content);
                });
            
            return reversed;
        }
    },
    click : function(event) {
        // Sort on clicked
        var $headerView = $(event.target).parents('.ember-table-cell');
        var headerId = $headerView.attr('id');
        var view = Ember.View.views[headerId];
        if (view) {
            view.set('sortingOn', true);
            var reversed = this.server_sort_simple_column(this.get('controller'), view);
            view.set('reversed', reversed);
        }
        
        var $headerViewSiblings = $headerView.parent().children();
        _.map($headerViewSiblings, function($siblingView) {
            console.log('$siblingView', [$siblingView]);
            var siblingId = $($siblingView).attr('id');
            if(siblingId != headerId) {
                var siblingView = Ember.View.views[siblingId];
                if(siblingView) {
                    siblingView.set('sortingOn', false);
                }
            }
        });
    }
});

// Nested Table (Region)
App.TreeTableCell = Ember.Table.TableCell.extend({
    templateName: 'table_cells/financial-table-cell',
    
    cellContent_pct  : Ember.computed(registerRowProperty('getCellContent_pct')).property('rowContent.isLoaded', 'column'),
    cellContent_rank : Ember.computed(registerRowProperty('getCellContent_rank')).property('rowContent.isLoaded', 'column')
});

// Ranked Table (Global, Region)
App.RankedTableCell = Ember.Table.TableCell.extend({
    templateName     : 'table_cells/ranked-table-cell',
    classNames       : 'table_cells/ranked-table-cell',
    
    cellContent_rank : Ember.computed(registerRowProperty('getCellContent_rank')).property('rowContent.isLoaded', 'column'),
    highlighted      : Ember.computed(registerRowProperty('getHighlighted')).property('rowContent.isLoaded', 'column')
});

// Name + location (Branches)
App.BranchTableCell = Ember.Table.TableCell.extend({
    templateName: 'table_cells/branch-table-cell',
    
    cellContent_branch  : Ember.computed(registerRowProperty('getCellContent_branch')).property('rowContent.isLoaded', 'column'),
    cellContent_loc     : Ember.computed(registerRowProperty('getCellContent_loc')).property('rowContent.isLoaded', 'column'),
    cellContent_address : Ember.computed(registerRowProperty('getCellContent_address')).property('rowContent.isLoaded', 'column')
});

// Spark Line Cells
App.SparkCellView = Ember.Table.TableCell.extend({
    template      : Ember.Handlebars.compile(""),
    
    scale : Ember.computed.alias('controller.scale'),
    log   : Ember.computed.alias('controller.log'),
    
    heightBinding : 'controller.rowHeight',

    update : function() {
        if(this.$('svg')) { this.$('svg').remove(); }
        return this.renderD3View !== undefined ? this.renderD3View() : false;
    },
    onWidthDidChange: Ember.observer(function() { this.update(); }, 'width'),
    contentDidChange: Ember.observer(function() { this.update(); }, 'row'),
    didInsertElement: function() { this.update(); },

    onScaleDidChange : function() { this.update(); }.observes('scale', 'log')
});

App.FinancialTableSparkCell = App.SparkCellView.extend({
	// Used to make bar graph in Regions
    templateName    : 'table_cells/financial-table-spark-cell',
    
    cellContent_pct : Ember.computed(registerRowProperty('getCellContent_pct')).property('rowContent.isLoaded', 'column'),
    cellContent_ts  : Ember.computed(registerRowProperty('getCellContent_ts')).property('rowContent.isLoaded', 'column'),
    ts_resolution   : Ember.computed(registerRowProperty('get_ts_resolution')).property('rowContent.isLoaded', 'column'),
    
    renderD3View: function() {
        try {
			/* get the first row that is populated and set index with it
			   index get passed down to the xaxis drawing to be populated */
			var row = Ember.$(this.get('element')).parent().parent();
			if(row) {
				var all_rows = row.parent().children();
				this.set('index', all_rows.index(row));
			}
            App.D3Engine.make_time_series(this.get('cellContent_ts'), this.get('ts_resolution'), this);
        } catch(e) {
            console.log('+ Financial table could not draw spark cell +');
			console.log(e);
        }
    }
});

App.TimeSeriesSparkCellView = App.SparkCellView.extend({
	// Used in subjects/cities
    ts_resolution   : Ember.computed(registerRowProperty('get_ts_resolution')).property('rowContent.isLoaded', 'column'),

    renderD3View: function() {
		try {
			/* get the first row that is populated and set index with it
			   index get passed down to the xaxis drawing to be populated */
			var row = Ember.$(this.get('element')).parent().parent();
			if(row) {
				var all_rows = row.parent().children();
				this.set('index', all_rows.index(row));
			}
			App.D3Engine.make_time_series(this.get('row.timeseries'), this.get('ts_resolution'),  this);
		} catch(e) {
			console.log('+ Financial table could not draw spark cell +');
			console.log(e);
		}
    }
});



// Should fix the names to be consistent so I don't have to set these parameters
// in such a gross way
//App.MoreLikeThisSparkCellView = App.SparkCellView.extend({
//    renderD3View : function() {
//        var path   = 'row.proportions';
//        var metric = 'prop';
//        var name   = 'type';
//        App.D3Engine.make_histogram(this, path, name, metric);
//    }
//});

App.TypeSparkCellView = App.SparkCellView.extend({
    renderD3View : function() {
        var path   = 'row.types';
        var name   = 'key';
        App.D3Engine.make_histogram(this, path, name);
    }
});



App.D3Engine = Ember.Object.extend();
App.D3Engine.reopenClass({
    
    date_diff : function(units, d1, d2) {
        return App.D3Engine[units + '_diff'](d1, d2);
    },
    day_diff : function(d1, d2) {
        return d2.getDay() - d1.getDay() + 31 * App.D3Engine.month_diff(d1, d2);
    },
    week_diff : function(d1, d2) {
        return App.D3Engine.day_diff(d1, d2) / 7;
    },
    month_diff : function(d1, d2) {
        return d2.getMonth() - d1.getMonth() + 12 * App.D3Engine.year_diff(d1, d2);
    },
    year_diff : function(d1, d2) {
        return d2.getFullYear() - d1.getFullYear();
    },
    
    validate_time_series : function(ts) { return ts && ts.xmin && ts.xmax; },
    
    make_time_series : function(ts, ts_resolution, self) {
        if(!App.D3Engine.validate_time_series(ts)){ return; }

        // Get cell height
        var index       = self.get('index');
        var height      = self.get('height');
        var width       = self.get('width');

        // Format time series
		var parseDate = d3.time.format('%Y-%m-%d').parse;
		var data = _.map(ts.data, function(x) {
            return {
                "date"    : parseDate(App.Helper.dateToYMD(new Date(x.key))),
                "value"   : + x.metric_val
            };
        });

       
        // Apply log transform if applicable
        if(self.get('log')) {
            _.map(data, function(d) {
                d.value = _.max([0, Math.log(d.value) / Math.LN10]);
            });
        }
        
        // Calculate bar width
        var n_periods = App.D3Engine.date_diff(ts_resolution.value, new Date(ts.xmin), new Date(ts.xmax));
        var bar_width = _.max([1, (1 - config.SPARKCELL_INTER_BAR_PADDING) * (width / Math.ceil(n_periods)) ]);
        
        var svg = d3.select("#" + (self.get('elementId')))
		                  .append('svg:svg')
                          .attr('height', height)
						  .attr('width',width);

	  // scaling the x axis 
      var x = d3.time.scale().range([0, width]);
      x.domain(d3.extent([data, {'date' : ts.xmax}, {'date': ts.xmin}], function(d) { return d.date; })).nice();

      // x axis time series ------------------------------------------------------------------------------------>
	  var xaxis = d3.svg.axis()
	    .scale(x)
	    .orient("bottom")
	    .tickSize(3)
	    .ticks(4)
	    .tickPadding(0)
	    .tickFormat(d3.time.format("%b-%y"));

		svg.append("g")
		  .attr("class","x axis")
		  .attr("width", bar_width)
		  // rotate the x-axis in two steps. (0,0) is the top left hand corner
		  // translate moves the x axis 0,0 coordinate to the the coordinates we provide
		  // when we rotate the x axis it pivots on the coordinates we provide translate
		  .attr("transform","translate("+width+",0) rotate(180) translate("+width+",0) rotate(180)")
		  .call(xaxis)
		  .selectAll("text")
		  .style("text-anchor","end")
		  .attr("dx","2.0em");

		if(index % 4 !== 0){
		  // index is set when the financial tables are drawn
		  svg.selectAll("text").remove();
		}
			 
	   var y = d3.scale.linear().range([0, height * (1-config.SPARKCELL_ABOVE_BAR_PADDING)]);
		
       y.domain([0, _.max(_.pluck(data, 'value')) ]);

        svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .style("fill",   config.SPARKCELL_TS_COLOR)
            .attr("x",       function(d) { return x(d.date); })
            .attr("width",   bar_width)
            .attr("y",       function(d) { return (height+11) - y(d.value);})
            .attr("height",  function(d) { return y(d.value);})
            .on('mouseover', function(e) {
                d3.select(this).style('fill', function() {return config.SPARKCELL_TS_HOVER_COLOR;});
                d3.select(this).attr('width', function() {return bar_width + 1;});
            })
            .on('mouseout',  function(e) {
                d3.select(this).style('fill', function() {return config.SPARKCELL_TS_COLOR;});
                d3.select(this).attr('width', function() {return bar_width;});
            })
            .append('title')
            //.text(function(d) { return d.date.toDateString() + ' / ' + numeral(d.value).format('0.0a') + ' (' + ts_resolution.label + ')'; });
			.text(function(d) { return d.date.toDateString()  + ' / ' + numeral(d.value).format('0.0a');});
    },
    
    make_histogram : function(self, path, name) {
        var data = self.get(path);
        if(!data) { return; }

        var height = self.get('height');
        var width  = self.get('width');

        var total_count = _.reduce(_.pluck(data, 'metric_val'), function(a, b) {return a + b;});

        var x = d3.scale.linear().range([0, width]).domain([0, data.length]);
        var y = d3.scale.linear().range([height * (1 - config.SPARKCELL_ABOVE_BAR_PADDING), 0]).domain([0, total_count]);

        var barWidth = _.max([1, (1 - config.SPARKCELL_INTER_BAR_PADDING) * (width / data.length)]);
        
        var svg = d3.select("#" + (self.get('elementId')))
                    .append('svg:svg')
                    .attr('height', height)
                    .attr('width', width);
        
        svg.selectAll('bar')
            .data(data)
            .enter().append('rect')
            .style("fill",  config.SPARKCELL_HIST_COLOR)
            .attr("x", function(d, i) {
                return x(i);
            })
            .attr('width', barWidth)
            .attr("y",      function(d) {
                return y(d.metric_val) + height * config.SPARKCELL_ABOVE_BAR_PADDING;
            })
            .attr("height", function(d) {
                return (height * (1 - config.SPARKCELL_ABOVE_BAR_PADDING)) - y(d.metric_val);
            })
            .on('mouseover', function(e) {
                d3.select(this).style('fill', function() {return config.SPARKCELL_HIST_HOVER_COLOR;});
            })
            .on('mouseout',  function(e) {
                d3.select(this).style('fill', function() {return config.SPARKCELL_HIST_COLOR;});
            })
            .append('title')
            .text(function(d) {
                return d[name] + ' / ' + d.metric_val;
            });
    }

});

App.ContextMenuHeaderCellView = Ember.Table.HeaderCell.extend({
    templateName : "table_cells/context-menu-header-cell"
});

App.GFPanelRoute = App.GRoute.extend({
    setupController : function(con, model) {
        console.log('trying to set up controller...');
        var already_watching = _.chain(con.get('state').observersForKey('counter'))
                                .map(function(x) {return x[0];})
                                .contains(con)
                                .value();
        if(!already_watching) { con.state_observer(); }
        con.get('state').addObserver('counter', con, 'state_observer');
    },
    deactivate : function() {
        var con = this.get('controller');
        con.get('state').removeObserver('counter', con, 'state_observer');
    }
});

App.GFPanelController = Ember.Controller.extend(Ember.Evented, {
    needs          : ['main', 'application'],
    client         : Ember.computed.alias('controllers.main.client'),
    state          : Ember.computed.alias('controllers.main.state'),
    all_borders    : Ember.computed.alias('controllers.main.heatmap.all_borders'),

    isAdmin : function() {return App.isAdmin();}.property(),

    col_width     : 150,
    set_col_width : function() {
        var n_cols = this.get('table_columns') ? this.get('table_columns').length : 4;
        var col_width = $('.drawer-inner').width() / n_cols - 1;
        if(col_width > 0) {
            this.set('col_width', col_width);
        }
    }.observes('table_columns.length').on('init'),
    
    clear_data : function() {
        this.set('table_data', undefined);
        this.set('eub', undefined);
    },

    table_data    : undefined,
    table_columns : undefined,
    eub           : undefined,

    name          : 'no-name-controller'
});

// Panel controller where data is not linked directly to data_layers
// Needs to have action called "get_table_data" that fetches the
// data for the table
App.GFPanelIndependantController = App.GFPanelController.extend({
    state_observer : function() {
        console.log(')))))))) ' + this.get('name') + ' observer firing ))))))))');
        this.send('get_table_data');
    }
});

// Panel controller where data is linked directly to data_layers
// Do not need "get_table_data", since the data is aliased
App.GFPanelLinkedController = App.GFPanelController.extend({
    linked_to : undefined,
    
    state_observer : function() {
        if(this.get('data_layer') && !this.get('visible')) {
            console.log(')))))))) ' + this.get('name') + ' observer firing -- getting new data (forcing refresh)');
            this.send('refresh_underlying_data');
        } else {
            console.log(')))))))) ' + this.get('name') + ' observer firing -- doing nothing');
        }
    },
    defineComputed : function() {
        var linked_to = this.get('linked_to');
        Ember.defineProperty(this, 'data_layer',    Ember.computed.alias('controllers.main.heatmap.' + linked_to));
        Ember.defineProperty(this, 'table_data',    Ember.computed.alias('controllers.main.heatmap.' + linked_to + '.data'));
        Ember.defineProperty(this, 'visible',       Ember.computed.alias('controllers.main.heatmap.' + linked_to + '.visible'));
        Ember.defineProperty(this, 'eub',           Ember.computed.alias('controllers.main.heatmap.' + linked_to + '.eub'));
    }.on('init'),
    
    actions : {
        refresh_underlying_data : function() {
            this.get('data_layer').refresh(true);
        }
    }
});


App.GlobalRoute = App.GFPanelRoute.extend();

App.GlobalController = App.GFPanelLinkedController.extend({
    name       : 'global',
    linked_to  : 'region',

    // Extra linked properties
    active_columns : Ember.computed.alias('controllers.main.state.active_columns'),
    active_columns_did_change : function() {
        this.send('refresh_underlying_data');
    }.observes('active_columns.@each'),
    
    // Templates for table columns
    table_columns : function() {
        var self              = this;
        var borders_selection = this.get('state.borders_selection');
        var col_width         = this.get('col_width');
        var all_borders       = this.get('all_borders');
        
        var active_columns = this.get('active_columns');
        
        return _.flatten([
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width,
              textAlign           : 'text-align-left',
              headerCellName      : 'ID',
              contentPath         : 'locus_id',
              getCellContent : function(row) {
                return App.Helper.iso2name(row.locus_id, borders_selection, all_borders) + ' (' + row.locus_id + ')';
              },
              can_sort : true
            }),
            _.map(active_columns, function(col) {
                console.log('col', col);
                var val = col.value;
                return Ember.Table.ColumnDefinition.create({
                  defaultColumnWidth  : col_width,
                  headerCellName      : "'" + col.label + "'",
                  contentPath         : val + '.val',
                  tableCellViewClass  : 'App.RankedTableCell',
                  getCellContent      : function(row) {
                    var suffix = (val.match('amount') || val.match('amnt')) ? ' ($)' : '';
                    if(row[val].val > 1000) {
                        return numeral(row[val].val).format('0.000a') + suffix;
                    } else {
                        return numeral(row[val].val).format('0.00') + suffix;
                    }
                  },
                  getCellContent_rank : function(row) {
                    return row[val].rank;
                  },
                  getHighlighted : function(row) {
                    var selected = self.get('state.selected');
                    return _.where(selected, {'locus_id' : row.locus_id}).length > 0;
                  },
                  can_sort : true,
                  rank     : 100
                });
            })
        ]);
    }.property('table_data'),

    actions : {
        export_data : function() {
            var data = _.map(this.get('table_data'), App.Helper.flattenJSON);
            var csvHeader  = _.keys(data[0]).join(',');
            var csvContent = _.map(data, function(row) {
                return _.values(row).join(',');
            }).join('\n');

            App.Helper.download(csvHeader + '\n' + csvContent, 'global_download_' + ( + new Date() ) + '.csv', 'text/csv');
        }
    }
});

App.RegionRoute      = App.GFPanelRoute.extend();
App.RegionController = App.GFPanelIndependantController.extend({
    name : 'region',

    visible : Ember.computed.alias('controllers.main.heatmap.region.visible'),

    groupingColumn : Ember.computed(function() {
        var self			  = this;
        var col_width		  = this.get('col_width');
        var borders_selection = this.get('state.borders_selection');
        var all_borders       = this.get('all_borders');
        
        return Ember.Table.ColumnDefinition.create({
          headerCellName      : '',
          columnWidth         : col_width,
          isTreeColumn        : true,
          isSortable          : true,
          textAlign           : 'text-align-left',
          headerCellViewClass : 'App.FinancialTableHeaderTreeCell',
          tableCellViewClass  : 'App.FinancialTableTreeCell',
          contentPath         : 'group_value',
          getCellContent      : function(row) {
            if(row.group_name == 'Country') {
                return App.Helper.iso2name(row.group_value, borders_selection, all_borders);
            } else {
                return row.group_value.replace('TYPE_', '');
            }
          },
          can_sort : false
        });
    }).property('table_data.grouping_factors.@each', 'table_data', 'state.borders_selection.value', 'col_width'),
  
    table_columns : Ember.computed(function() {
        var columns, content, names, vf, con, ts_resolution;
        
        con = this;
        if (!this.get('table_data')) { return; }
        
        vf            = this.get('table_data.value_factors');
        ts_resolution = this.get('state.ts_resolution');

        if(vf) {
              columns = _.map(vf, function(v, index) {
			  //v is cell header and index is the index of the cell header
              return Ember.Table.ColumnDefinition.create({
                index               : index,
                columnWidth         : con.get('col_width'),
                headerCellName      : v.display_name,
                headerCellViewClass : 'App.FinancialTableHeaderCell',
                tableCellViewClass  : v.is_time_series ? 'App.FinancialTableSparkCell' : 'App.TreeTableCell',
                can_sort            : !v.is_time_series,
                can_scale           : v.is_time_series,
                get_ts_resolution : function() {
                    return con.get('state.ts_resolution');
                },
                getCellContent: function(row) {
                    var pretty_value;
                    try {
                        var object   = row.values[this.get('index')];
                        pretty_value = object.value;
                        pretty_value = parseInt(pretty_value);
                        if(pretty_value > 1000) {
                            pretty_value = numeral(pretty_value).format('0,0');
                        }
                    } catch(e) {
                        pretty_value = '';
                    }
                    return pretty_value;
                },
                getCellContent_pct : function(row) {
                    var object = row.values[this.get('index')];
                    return object.pct;
                },
                getCellContent_ts : function(row) {
                    var object = row.values[this.get('index')];
                    return object.timeseries;
                },
                getCellContent_rank : function(row) {
                    var object = row.values[this.get('index')];
                    return object.rank;
                }
              });
            });
            columns.unshiftObject(this.get('groupingColumn'));
            return columns;
        }
    }).property('table_data'),
  
    selected_did_clear : function() { // +_+
        this.set('table_data', undefined);
    }.observes('state.selected'),
    
    actions : {
        get_table_data : function() {
            var self  = this;
            self.get('client').run_fetch_locus(self.get('state'), function(response) {
                self.set('table_data', response.data);
            });
        },
        
        // Get reports from region
        // Injecting fetchers to generic report
        // viewer
        run_selected_reports: function() {
            var client    = this.get('client');
            var state     = this.get('state');
            var main_con  = this.get('controllers.main');
            
            function fetch_filtered(params, callback) {
                params.data_type = 'region';
                params.n_reports = 100;

                client.run_fetch_reports(state, params, function(data) {
                    Ember.run(this, callback, data);
                });
            }
//            function fetch_unfiltered(params, callback) {
//                client.run_fetch_reports(state, params, function(data) {
//                    data.reports.length = 5;
//                    callback(data)
//                })
//            }
            
            App.Report.make_report_modal({
                "fetchers" : {
                    'filtered'   : fetch_filtered,
                },
                'controller' : main_con,
                'title'      : 'Reports for ' + _.map(state.get('selected'), function(x) {
                    return x.name;
                }).join(', ')
            });
        }
    }
});

App.CityRoute = App.GFPanelRoute.extend();

App.CityController = App.GFPanelLinkedController.extend({
    name       : 'city',
    linked_to  : 'city',

    table_columns : function() {
        console.log('making table columns');
        var con       = this;
        var col_width = this.get('col_width');
        return[
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width * 1,
              textAlign          : 'text-align-left',
              headerCellName     : 'Name',
              contentPath        : 'properties.city_name',
              can_sort           : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width * 0.5,
              headerCellName     : "'" + this.get('state.metric_type.label') + "'",
              contentPath        : 'properties.metric_val',
              getCellContent : function(row) {
                if(row.properties.metric_val > 1000) {
                    return numeral(row.properties.metric_val).format('0.0a');
                } else {
                    return row.properties.metric_val;
                }
              },
              can_sort : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1.5,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' Over Time",
              headerCellViewClass : 'App.TimeSeriesSparkCellHeaderView',
              tableCellViewClass  : 'App.TimeSeriesSparkCellView',
              getCellContent      : 'properties.timeseries',
              can_sort            : false,
              can_scale           : true,
              get_ts_resolution   : function() {
                return con.get('state.ts_resolution');
              }
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' By Type",
              tableCellViewClass  : 'App.TypeSparkCellView',
              getCellContent      : 'properties.types',
              can_sort            : false,
              get_ts_resolution : function() {
                return con.get('state.ts_resolution');
              }
            })
        ];
    }.property('state.metric_type.label'),

    table_onClick : function(selected_city, con) {
        var client = con.get('client');
        var state  = con.get('state');

        function fetch_filtered(params, callback) {
            params.data_type     = 'city';
            params.selected_city = {"properties" : {"key" : selected_city.properties.key}};
            params.n_reports     = 100;
            
            client.run_fetch_reports(state, params, function(data) {
                Ember.run(this, callback, data);
            });
        }
//        function fetch_unfiltered(params, callback) {
//            client.run_fetch_city_reports(city_row, state, params, function(data) {
//                data.reports.length = 5;
//                Ember.run(this, callback, data);
//            })
//        }
        
        App.Report.make_report_modal({
            "fetchers" : {
                'filtered'   : fetch_filtered,
//                'unfiltered' : fetch_unfiltered,
            },
            'controller' : con,
            'title'      : 'Reports for ' + selected_city.properties.city
        });
    },
    
    table_onMouseEnter : function(city_row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
        
            console.log('data_layer :: ', data_layer);
            console.log('city_row :: ', city_row);
            
            var point = _.findWhere(data_layer._layers, function(e) {
                return e.feature.properties.key === city_row.properties.key;
            });
            point.bringToFront();
            point.openPopup();
        }
    },
    table_onMouseLeave : function(city_row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
            _.map(data_layer._layers, function(e) {
                return e.closePopup();
            });
        }
    },

    actions : {
        // Toolbar functions
        export_data : function() {
            var data = this.get('table_data');
            
            var csvContent = _.map(data, function(row) {
                var subRow = row.properties.loc;
                var slmRow = _.omit(row.properties, 'loc');
                var extRow = _.extend(subRow, slmRow);

                var properties = _.values(extRow).join(',');
                var types      = _.map(row.types, function(type) {
                    return properties + ',' + _.values(_.omit(type, 'count')).join(',');
                }).join('\n');
                var timeseries = _.map(row.timeseries.data, function(date) {
                    return properties + ',' + _.values(_.omit(date, 'count')).join(',');
                }).join('\n');
                return {'properties' : properties, 'types' : types, "timeseries" : timeseries};
            });
            
            var ready = _.keys(data[0].properties);
            ready.unshift('lon', 'lat');
            var headerHead = ready.join(',');

            var csvHeaders = {
                'properties' : headerHead,
                'types'      : headerHead + ',' + _.keys(_.omit(data[0].types[0], 'count')).join(','),
                'timeseries' : headerHead + ',' + _.keys(_.omit(data[0].timeseries.data[0], 'count')).join(',')
            };

            _.map(_.keys(csvHeaders), function(key) {
                var content = _.pluck(csvContent, key).join('\n');
                var header  = csvHeaders[key];
                App.Helper.download(header + '\n' + content, key + '_city_download_' + ( + new Date() ) + '.csv', 'text/csv');
            });
        },
        run_er_cities: function(resolved) {
            var self   = this;
            var client = this.get('client');
            var state  = this.get('state');

            function fetch_er_cities(params, callback) {
                params.resolved = resolved;
                client.run_fetch_er_cities(params, state, function(response) {
                    Ember.run(this, callback, response);
                });
            }

            App.ER.make_er_modal({
                "fetch_er_cities" : fetch_er_cities
            }, self, resolved ? "Resolved Cities": "Unresolved Cities");
        }
    }
});

App.BranchRoute = App.GFPanelRoute.extend();

App.BranchController = App.GFPanelLinkedController.extend({
    name      : 'branch',
    linked_to : 'branch',
    
    table_columns : function() {
        console.log('making table columns');
        var con       = this;
        var col_width = this.get('col_width');
        return[
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width,
              textAlign          : 'text-align-left',
              headerCellName     : 'Name',
              contentPath        : 'properties.city_name',
              tableCellViewClass : 'App.BranchTableCell',
              getCellContent_loc : function(row) {
                console.log('row', row);
                return row.properties.city_name;
              },
              getCellContent_branch : function(row) {
                return row.properties.branch_name;
              },
              getCellContent_address : function(row) {
                return row.properties.address;
              },
              can_sort : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width * 0.5,
              headerCellName     : "'" + this.get('state.metric_type.label') + "'",
              contentPath        : 'properties.metric_val',
              getCellContent : function(row) {
                if(row.properties.metric_val > 1000) {
                    return numeral(row.properties.metric_val).format('0.0a');
                } else {
                    return row.properties.metric_val;
                }
              },
              can_sort : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1.5,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' Over Time",
              headerCellViewClass : 'App.TimeSeriesSparkCellHeaderView',
              tableCellViewClass  : 'App.TimeSeriesSparkCellView',
              getCellContent      : 'properties.timeseries',
              can_sort            : false,
              can_scale           : true,
              get_ts_resolution   : function() {
                return con.get('state.ts_resolution');
              }
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' By Type",
              tableCellViewClass  : 'App.TypeSparkCellView',
              getCellContent      : 'properties.types',
              can_sort            : false,
              get_ts_resolution : function() {
                return con.get('state.ts_resolution');
              }
            })
        ];
    }.property('state.metric_type.label'),
    
    table_onClick : function(selected_branch, con) {
        var client = con.get('client');
        var state  = con.get('state');
        
        function fetch_filtered(params, callback) {
            params.data_type       = 'branch';
            params.selected_branch = {"properties" : {"key" : selected_branch.properties.key}};
            params.n_reports       = 100;
            
            client.run_fetch_reports(state, params, function(data) {
                Ember.run(this, callback, data);
            });
        }
        
//        function fetch_unfiltered(params, callback) {
//        
//        }
        
        App.Report.make_report_modal({
            "fetchers" : {
                'filtered'   : fetch_filtered,
//                'unfiltered' : fetch_unfiltered,
            },
            'controller' : con,
            'title'      : 'Reports for ' +
                selected_branch.properties.branch_name +
                ',' +
                selected_branch.properties.address +
                ', ' +
                selected_branch.properties.city
        });
    },

    table_onMouseEnter : function(row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
            // BUG -- Locus_id should be computed in a better way, so that it's actually a unique identifier
            var point = _.findWhere(data_layer._layers, function(e) {
                return ( e.feature.properties.locus_id === row.properties.locus_id ) &&
                       ( e.feature.properties.address  === row.properties.address );
            });
            point.bringToFront();
            point.openPopup();
        }
    },

    table_onMouseLeave : function(row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
            _.map(data_layer._layers, function(e) {
                return e.closePopup();
            });
        }
    },
    
    actions : { 
        export_data : function() {
            var data = this.get('table_data');
            
            var csvContent = _.map(data, function(row) {
                var subRow = row.properties.loc;
                var slmRow = _.omit(row.properties, 'loc');
                var extRow = _.extend(subRow, slmRow);

                var properties = _.values(extRow).join(',');
                var types      = _.map(row.types, function(type) {
                    return properties + ',' + _.values(_.omit(type, 'count')).join(',');
                }).join('\n');
                var timeseries = _.map(row.timeseries.data, function(date) {
                    return properties + ',' + _.values(_.omit(date, 'count')).join(',');
                }).join('\n');
                return {'properties' : properties, 'types' : types, "timeseries" : timeseries};
            });

            var ready = _.keys(data[0].properties);
            ready.unshift('lon', 'lat');
            var headerHead = ready.join(',');

            var csvHeaders = {
                'properties' : headerHead,
                'types'      : headerHead + ',' + _.keys(_.omit(data[0].types[0], 'count')).join(','),
                'timeseries' : headerHead + ',' + _.keys(_.omit(data[0].timeseries.data[0], 'count')).join(',')
            };
            
            _.map(_.keys(csvHeaders), function(key) {
                var content = _.pluck(csvContent, key).join('\n');
                var header  = csvHeaders[key];
                App.Helper.download(header + '\n' + content, key + '_branch_download_' + ( + new Date() ) + '.csv', 'text/csv');
            });
        }
    }
});


App.SubjectRoute = App.GFPanelRoute.extend();

App.SubjectController = App.GFPanelIndependantController.extend({
    name : 'subject',

    single_subject          : undefined,
    single_subject_key      : Ember.computed.alias('controllers.main.heatmap.subject.params.single_subject_key'),
    
    single_subject_did_change : function() {
        this.set('single_subject_key', this.get('single_subject.key'));
    }.observes('single_subject.key'),
    
    subject_search : undefined,
    table_columns : function() {
        var con       = this;
        var col_width = this.get('col_width');
        
        return [
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : 'Subject ID',
                contentPath    : "key",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : "'" + this.get('state.metric_type.label') + "'",
                contentPath    : 'metric_val',
                can_sort       : true,
                getCellContent : function(row) {
                    console.log('row', row);
                    if(row.metric_val > 1000) {
                        return numeral(row.metric_val).format('0.0a');
                    } else {
                        return row.metric_val;
                    }
                }
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth  : col_width * 2,
                headerCellName      : "'" + this.get('state.metric_type.label') + "' Over Time",
                headerCellViewClass : 'App.TimeSeriesSparkCellHeaderView',
                tableCellViewClass  : 'App.TimeSeriesSparkCellView',
                getCellContent      : 'timeseries',
                can_sort            : false,
                can_scale           : true,
                get_ts_resolution : function() {
                    return con.get('state.ts_resolution');
                }
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                headerCellName     : "'" + this.get('state.metric_type.label') + "' By Type",
                tableCellViewClass : 'App.TypeSparkCellView',
                getCellContent     : 'types',
                can_sort           : false
            })
        ];
    }.property('state.metric_type.label'),
    
    // When table row is clicked, opens report viewer
    table_onClick : function(single_subject, main_con) {
        var client = main_con.get('client');
        var state  = main_con.get('state');
        
        // Dependency injection, since report viewer is
        // generic
        function fetch_unfiltered(params, callback) {
            params.data_type      = 'subject';
            params.single_subject = single_subject;
            params.n_reports      = 100;
            
            client.run_fetch_reports(state, params, function(data) {
                Ember.run(this, callback, data);
            });
        }
        
        App.Report.make_report_modal({
            "fetchers" : {
                "unfiltered" : fetch_unfiltered,
            },
            "controller" : main_con,
            "title"      : 'All Reports for ID ' + single_subject.key
        }); // FEAT: Change this to reflect the actual type of ID this isq
    },
    
    // On right-click, shows geographic activity of subject
    // on map
    table_onRightClick: function(single_subject, con) {
        console.log('bad actor table on right click', con);
        con.set('single_subject', single_subject);
        return false;
    },
    
    // Bad actor is sometimes undefined
    _get_table_data : function(subject) {
        var self   = this;
        self.get('client').run_fetch_subjects(self.get('state'), function(response) {
            self.set('table_data', response.data);
            self.set('eub', response.eub);
        }, subject);
    },
    
    actions : {
        search_subject: function(subject) {
            this._get_table_data(subject);
        },
        // Removes points on map
        clear_subject : function() {
            this.set('single_subject', undefined);
        },
        get_table_data: function() {
            // If no search term, gets everything
            if(!this.get('subject_search')) {
                Ember.run.debounce(this, '_get_table_data', 500, true);
            // Otherwise, only gets matches
            } else {
                this.send('search_subject', this.get('subject_search'));
            }
        },

        export_data : function() {
            var data = this.get('table_data');
            
            var csvContent = _.map(data, function(row) {
                var properties = row.key + ',' + row.count;
                var types      = _.map(row.types, function(type) {
                    return properties + ',' + _.values(_.omit(type, 'count')).join(',');
                }).join('\n');
                var timeseries = _.map(row.timeseries.data, function(date) {
                    return properties + ',' + _.values(_.omit(date, 'count')).join(',');
                }).join('\n');
                return {'properties' : properties, 'types' : types, "timeseries" : timeseries};
            });

            var csvHeaders = {
                'properties' : ['id', 'n_filings'].join(','),
                'types'      : ['id', 'n_filings'].join(',') + ',' + _.keys(_.omit(data[0].types[0], 'count')).join(','),
                'timeseries' : ['id', 'n_filings'].join(',') + ',' + _.keys(_.omit(data[0].timeseries.data[0], 'count')).join(',')
            };
            
            _.map(_.keys(csvHeaders), function(key) {
                var content = _.pluck(csvContent, key).join('\n');
                var header  = csvHeaders[key];
                App.Helper.download(header + '\n' + content, key + '_subject_download_' + ( + new Date() ) + '.csv', 'text/csv');
            });
        }
    }
});

App.MorelikethisRoute = App.GFPanelRoute.extend();

App.MorelikethisController = App.GFPanelIndependantController.extend({
    name : 'morelikethis',

    table_columns : function() {
        var col_width = this.get('col_width');
        
        return [
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : 'Region',
                contentPath    : "name",
                getCellContent : function(row) {
                    return row.name;
                },
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width / 2,
                headerCellName : 'Relevant Filings',
                contentPath    : "tot",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width / 2,
                headerCellName : "Similarity Rank",
                contentPath    : "rank",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width * 1.5,
                headerCellName     : 'Distribution Over Form Types',
                tableCellViewClass : 'App.MoreLikeThisSparkCellView',
                contentPath        : 'proportions',
                can_sort           : false
            })
        ];
    }.property(),
    
    actions : {
        get_table_data : function() {
            var self   = this;
            var client = this.get('client');
            var state  = this.get('state');

            client.run_fetch_more_like_this(state, function(more_like_this) {
                console.log('more like this', more_like_this);
            
                var place_list = self.get('controllers.main.heatmap.place_list');
                var new_more_like_this = _.filter(
                    _.map(more_like_this, function(mlt) {
                        var mtc = _.filter(place_list, function(cl) {
                            return cl.locii[0].locus_id == mlt.name.toUpperCase();
                        })[0];

                        if(mtc) {
                            mlt.name = mtc.name;
                        }else{
                            mlt.name = '';
                        }

                        return mlt;
                    }),
                    function(x) {return x.name !== '';});
                self.set('table_data', new_more_like_this);
            });
        }
    }
});

// Is this necessary?
App.MoreLikeThisView = Ember.View.extend({
    templateName : "morelikethis",
    more_like_this_did_change: function() {
        this.rerender();
    }.observes('more_like_this')
});


// -- QED -- //

App.ApsRoute = App.GFPanelRoute.extend({});

App.ApsController = App.GFPanelLinkedController.extend({
    name       : 'aps',
    linked_to  : 'aps',

    profile_type : Ember.computed.alias('controllers.main.heatmap.aps.params.profile_type'),
    
    profile_type_sig : false,
    profile_type_did_change : function() {
        console.log('profile_type_sig did change');
        if(this.get('profile_type_sig')) {
            this.set('profile_type', 'sig');
        } else {
            this.set('profile_type', 'freq');
        }
    }.observes('profile_type_sig'),
    
    table_columns : function() {
        var con       = this;
        var col_width = this.get('col_width');
        return [
            Ember.Table.ColumnDefinition.create({
				// cities bar graph... maybe?
                defaultColumnWidth : col_width * 1,
                textAlign          : 'text-align-left',
                headerCellName     : "Name",
                contentPath        : "properties.city_name",
                can_sort           : true
            }),
            Ember.Table.ColumnDefinition.create({
			  // Regions bar graph
              defaultColumnWidth : col_width * 0.75,
              headerCellName     : 'Count',
              contentPath        : 'properties.count',
              getCellContent : function(row) {
                if(row.properties.count > 1000) {
                    return numeral(row.properties.count).format('0.0a');
                } else {
                    return row.properties.count;
                }
              },
              can_sort : true
            })
        ];
    }.property()
});


// ---------

App.ProfilerRoute = App.GFPanelRoute.extend({});

App.ProfilerController = App.GFPanelIndependantController.extend({
    name       : "profiler",
    child_data : undefined,
    
    title : function() {
        return _.pluck(this.get('state.selected'), 'name').join(', ');
    }.property('state.selected'),
    
    actions : {
        get_table_data : function() {
            var self = this;
            this.get('client').run_fetch_form_type_fields(
                self.get('state.form_types'),
                function(ftf) {
                    self.set('child_data', App.PWidgetData.create({
                        form_type_fields : ftf,
                        top_level : true
                    }));
                });
        }
    }
});

App.PWidgetData = Ember.Object.extend({
    form_type_fields : undefined,
    profile_field : undefined,
    profile_type : "freq",
    data      : undefined,
    top_level : false,

    subset : [],
    pretty_subset : function() {
        return "Universe: Location" + ' + ' + _.map(this.get('subset'), function(subset) {
            return [subset.field.field, subset.key].join(':');
        }).join(' + ');
    }.property('subset'),
    
    parents : function() {
        var parents = JSON.parse(JSON.stringify(this.get('subset')));
        parents.pop();
        return parents;
    }.property('subset')
});

App.PwidgetController = Ember.Controller.extend({
    needs  : ['main'],
    client : Ember.computed.alias('controllers.main.client'),
    state  : Ember.computed.alias('controllers.main.state'),

    child_data       : undefined,
    loading          : false,
    profile_type_sig : false,
    
    get_data : function() {
        var self = this;
        
        var profile_field = this.get('model.profile_field');
        var profile_type  = this.get('model.profile_type');
        var subset       = this.get('model.subset');
        
        if(profile_field) {
            this.set('loading', true);
            self.set('model.data', undefined);
            this.get('client').run_fetch_profiler(
                profile_field.field,
                profile_type,
                subset,
                this.get('state'),
                function(data) {
                    self.set('model.data', data);
                    self.set('loading', false);
                }
            );
        }
    },
    
    profile_type_did_change : function() {
        if(this.get('profile_type_sig')) {
            this.set('model.profile_type', 'sig');
        } else {
            this.set('model.profile_type', 'freq');
        }
    }.observes('profile_type_sig'),
    
    select_form_type_field : function() {
        this.get_data();
    }.observes('model.profile_field.field', 'model.profile_type'),

    add_subset : function(clicked, swap) {
        var subset = JSON.parse(JSON.stringify(this.get('model.subset')));
        if(swap) {
            subset.pop();
        }
        clicked.field = this.get('model.profile_field');
        subset.push(clicked);
        return subset;
    },
    
    actions : {
        select_item : function(clicked) {
            var subset;
            if(this.get('child_data')) {
                subset = this.add_subset(clicked, true);
            } else {
                subset = this.add_subset(clicked, false);
            }
            
            this.set('child_data', App.PWidgetData.create({
                form_type_fields : this.get('model.form_type_fields'),
                subset : subset,
                profile_field : undefined
            }));
        }
    }
});

App.PwidgetView = Ember.View.extend({
    templateName : "pwidget"
});

App.ReportView = Ember.View.extend({
	templateName : "report",
    didInsertElement : function() {
        try {
            var report = ace.edit("report-viewer");
            report.setTheme("ace/theme/monokai");
            report.getSession().setMode("ace/mode/javascript");

            // parent_con
            this.set('controller.targetObject.report', report);

            console.log(' -- using JSON report viewer --');
        } catch(e) {
            console.log(' -- using graphene report viewer --');
        }
    }
});

App.Report = Ember.Object.extend({});

App.Report.reopenClass({
    grapheneReport : function(parent_con, x, clickType) {
        function make_report_url(x) {
            var clean_report_id = _.filter(x.id.split('_'), function(x) {return x !== '';})[0];
            var clean_report_type = config.GRAPHENE_REPORT_KEY[x.type];
            var report_url = config.GRAPHENE_URL_BASE + clean_report_type + "/" + clean_report_id;
            return report_url;
        }

        var report_url = make_report_url(x);
        parent_con.set('report_url', report_url);
        if(clickType == 'right') {
            window.open(report_url, '_blank');
        }
    },
    yamlReport : function(parent_con, x, clickType) {
        parent_con.get('client').get_report(x.type, x.id, function(response) {
            parent_con.set('report_data', response);
            var report = parent_con.get('report');
            console.log('report', report);
            
            report.getSession().setValue(JSON.stringify(response, null, '\t'));
        });
    },
    clickHelper : function(x, controller, direction) {
        if(config.GRAPHENE_URL_BASE) {
            App.Report.grapheneReport(controller, x, direction);
        } else {
            App.Report.yamlReport(controller, x, direction);
        }
    },
    make_report_modal : function(params) {
      
      var fetchers = params.fetchers,
        parent_con = params.controller,
        title      = params.title;
      
      // How does the client know the name of the sorting options?
      // Column names of tables?
      var fetch      = fetchers[_.keys(fetchers)[0]];
      var parameters = {reverse : false, page : 0, sortBy : 'total_amount'};

      parent_con.set('report_url', undefined);

      fetch(parameters, function(data) {
          Ember.Widgets.ModalComponent.popup({
                primary : {
                    classNames       : ['report-modal'],
                    contentViewClass : App.ReportView,

                    targetObject     : parent_con,
                    headerText       : title,
                    confirmText      : "Done",
                    cancelText       : undefined,
                    
                    fetchers         : fetchers,
                    current_fetcher  : _.keys(fetchers)[0],
                    fetcher_names    : _.keys(fetchers),
                    
                    // More elegant way to set these?
                    data    : data,
                    sortBy  : parameters.sortBy,
                    reverse : parameters.reverse,
                    page    : parameters.page,
                    
                    show_page_down : data.min_showing > 0,
                    show_page_up   : data.max_showing < data.total_count,
                    
                    use_graphene : config.GRAPHENE_URL_BASE || false,
                    onClick : function(x) {
                        App.Report.clickHelper(x, parent_con, 'left');
                    },
                    // BUG: This closes the modal window for some reason
                    onRightClick : function(x) {
                        App.Report.clickHelper(x, parent_con, 'right');
                    }
                }, 
                computed : {
                    col_width : 99, // (*) stupid hardcode hack
                    table_columns: function() {
                        var col_width = this.get('col_width');
                        return [ 
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 9/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Report ID',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "id",
                                can_sort            : true,
                                getCellContent : function(row) {
                                    return row.id;
                                }
                            }),
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 5/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Report Type',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "type",
                                can_sort            : true,
                                getCellContent : function(row) {
                                    return row.type.replace('type_', '').toUpperCase();
                                }
                            }),
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 5/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Date',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "date_filed",
                                can_sort            : true
                            }),
//                            Ember.Table.ColumnDefinition.create({
//                                defaultColumnWidth  : col_width * 5/6,
//                                textAlign           : 'text-align-left',
//                                headerCellName      : 'Amount',
//                                headerCellViewClass : 'App.ServerHeaderCell',
//                                contentPath         : "total_amount",
//                                getCellContent : function(row) {
//                                    return numeral(row.total_amount).format('0.00a');
//                                },
//                                can_sort : true
//                            })
                        ];}.property(),
                    actions : {
                        export_data : function() {
                            var self_modal   = this;
                            this.get('fetchers')[this.get('current_fetcher')]({
                                'sortBy'       : self_modal.get('sortBy'),
                                'reverse'      : self_modal.get('reverse'),
                                'page'         : 0,
                                'n_reports'    : config.MAX_EXPORT_REPORTS
                            }, function(data) {
                                console.log('data report export', data);
                                var csvHeader  = _.keys(data.reports[0]);
                                var csvContent = _.map(data.reports, function(row) {
                                    return _.values(row).join(',');
                                }).join('\n');
                                                                
                                App.Helper.download(csvHeader + '\n' + csvContent, 'reports_download_' + ( + new Date() ) + '.csv', 'text/csv');
                            });
                        },
                        fetch : function(fetcher_name) {
                            var self_modal = this;
                            this.set('current_fetcher', fetcher_name);
                            this.get('fetchers')[fetcher_name](function(data) {
                                self_modal.set('data', data);
                                self_modal.set('show_page_down', data.min_showing > 0);
                                self_modal.set('show_page_up', data.max_showing < data.total_count);
                            });
                        },
                        // Need to handle going past the end
                        paginate : function(direction) {
                            var self_modal = this;
                            
                            // Update page
                            var page = this.get('page');
                            this.set('page', Math.max(page + direction, 0));
                            
                            // Get new data
                            this.get('fetchers')[this.get('current_fetcher')]({
                                'sortBy'  : self_modal.get('sortBy'),
                                'reverse' : self_modal.get('reverse'),
                                'page'    : self_modal.get('page')
                            }, function(data) {
                                self_modal.set('data', data);

                                self_modal.set('show_page_down', data.min_showing > 0);
                                self_modal.set('show_page_up', data.max_showing < data.total_count);
                            });
                        }
                    }
                }
            });
        });
    }
});


App.FinancialTableHeaderCell = Ember.Table.HeaderCell.extend({
  templateName: 'table_cells/financial-table-header-cell',

  // other functions declared in helpers.js
  sort_column : function(self, view) {
    var content               = self.get('controller.content');
    var current_sorted_column = self.get('controller.current_sorted_column');
    var new_sorted_column     = view.contentIndex;
    var new_content           = JSON.parse(JSON.stringify(content)); // Hack
    new_content.root.children = App.Helper.nested_sortBy(content.root.children, new_sorted_column);
    if(current_sorted_column == new_sorted_column) {
        self.toggleProperty('controller.reverseSort');
    } else {
        self.set('controller.reverseSort', true);
    }
    if(self.get('controller.reverseSort')) {
        new_content.root.children = App.Helper.nested_reverse(new_content.root.children, new_sorted_column);
    }

    self.set('controller.current_sorted_column', new_sorted_column);
    self.set('controller.content', []);
    self.set('controller.content', new_content);
  },
  scale_column : function(self, view) {
    console.log('scaling column', self, view);
  },
  click : function(event) {
    $headerView = $(event.target).parents('.ember-table-cell');
    view = Ember.View.views[$headerView.attr('id')];
    if (view) {
        var can_sort   = view.content.can_sort;
        var can_scale  = view.content.can_scale;
        if(can_sort) {
            this.sort_column(this, view);
        } else if(can_scale) {
            this.toggleProperty('controller.scale');
        }
    }
  }
});

App.FinancialTableTreeCell = Ember.Table.TableCell.extend({
  templateName : 'table_cells/financial-table-tree-cell',
  classNames   : 'ember-table-table-tree-cell',
  paddingStyle : Ember.computed(function() {
    return "padding-left:" + (this.get('row.indentation')) + "px;";
  }).property('row.indentation'),
  rowNumber : Ember.computed(function() {
    return this.get('row.rowNumber');
  }).property('row.rowNumber')
});

App.FinancialTableHeaderTreeCell = Ember.Table.HeaderCell.extend({
  templateName : 'table_cells/financial-table-header-tree-cell',
  classNames   : 'ember-table-table-header-tree-cell'
});

App.FinancialTableTreeTableRow = Ember.Table.Row.extend({
  content            : null,
  children           : null,
  parent             : null,
  isRoot             : false,
  isLeaf             : false,
  isCollapsed        : false,
  isShowing          : true,
  indentationSpacing : 20,
  groupName          : null,
  rowNumber          : 0,
  computeStyles: function(parent) {
    var groupingLevel, indentType, indentation, isShowing, pGroupingLevel, spacing;
    groupingLevel = 0;
    indentation   = 0;
    isShowing     = true;
    if (parent) {
      isShowing      = parent.get('isShowing') && !parent.get('isCollapsed');
      pGroupingLevel = parent.get('groupingLevel');
      groupingLevel  = pGroupingLevel;
      if (parent.get('groupName') !== this.get('groupName')) {
        groupingLevel += 1;
      }
      indentType = groupingLevel === pGroupingLevel ? 'half' : 'full';
      spacing = this.get('indentationSpacing');
      if (!parent.get('isRoot')) {
        indentation = parent.get('indentation');
        indentation += (indentType === 'half' ? spacing / 2 : spacing);
      }
    }
    this.set('groupingLevel', groupingLevel);
    this.set('indentation', indentation);
    return this.set('isShowing', isShowing);
  },
  computeRowStyle: function(maxLevels) {
    var level;
    level = this.getFormattingLevel(this.get('groupingLevel'), maxLevels);
    return this.set('rowStyle', "ember-table-row-style-" + level);
  },
  recursiveCollapse: function(isCollapsed) {
    this.set('isCollapsed', isCollapsed);
    return this.get('children').forEach(function(child) {
      return child.recursiveCollapse(isCollapsed);
    });
  },
  getFormattingLevel: function(level, maxLevels) {
    switch (maxLevels) {
      case 1:
        return 5;
      case 2:
        if (level === 1) {
          return 2;
        }
        return 5;
      case 3:
        if (level === 1) {
          return 1;
        }
        if (level === 2) {
          return 3;
        }
        return 5;
      case 4:
        if (level === 1) {
          return 1;
        }
        if (level === 2) {
          return 2;
        }
        if (level === 4) {
          return 4;
        }
        return 5;
      case 5:
        return level;
      default:
        if (level === maxLevels) {
          return 5;
        }
        return Math.min(level, 4);
    }
  }
});

App.FinancialTableComponent = Ember.Table.EmberTableComponent.extend({
  numFixedColumns         : 1,
  isCollapsed             : false,
  isHeaderHeightResizable : true,
  rowHeight               : 30,
  hasHeader               : true,
  hasFooter               : true,
  sortAscending           : false,
  sortColumn              : null,
  selection               : null,
  actions: {
    toggleTableCollapse: function(event) {
      var children, isCollapsed;
      this.toggleProperty('isCollapsed');
      isCollapsed = this.get('isCollapsed');
      children    = this.get('root.children');
      if (!(children && children.get('length') > 0)) {
        return;
      }
      children.forEach(function(child) {
        return child.recursiveCollapse(isCollapsed);
      });
      return this.notifyPropertyChange('rows');
    },
    toggleCollapse: function(row) {
      row.toggleProperty('isCollapsed');
      return Ember.run.next(this, function() {
        return this.notifyPropertyChange('rows');
      });
    }
  },

  content : null,
  columns: null,
  
  // Assumes that

  
  root: Ember.computed(function() {
    var content;
    content = this.get('content');
    if (!content) {
      return;
    }
    
    return this.createTree(null, content.root);
  }).property('content', 'sortAscending', 'sortColumn'),
  rows: Ember.computed(function() {
    var maxGroupingLevel, root, rows;
    root = this.get('root');
    if (!root) {
      return Ember.A();
    }
    rows = this.flattenTree(null, root, Ember.A());
    this.computeStyles(null, root);
    maxGroupingLevel = Math.max.apply(rows.getEach('groupingLevel'));
    rows.forEach(function(row) {
      return row.computeRowStyle(maxGroupingLevel);
    });
    return rows;
  }).property('root', 'content'),
  bodyContent: Ember.computed(function() {
    var rows;
    rows = this.get('rows');
    if (!rows) {
      return Ember.A();
    }
    rows = rows.slice(1, rows.get('length'));
    return rows.filterProperty('isShowing');
  }).property('rows'),
  footerContent: Ember.computed(function() {
    var rows;
    rows = this.get('rows');
    if (!rows) {
      return Ember.A();
    }
    return rows.slice(0, 1);
  }).property('rows'),
//  orderBy: function(item1, item2) {
//    var result, sortAscending, sortColumn, value1, value2;
//    sortColumn    = this.get('sortColumn');
//    sortAscending = this.get('sortAscending');
//    if (!sortColumn) {
//      return 1;
//    }
//    value1 = sortColumn.getCellContent(item1.get('content'));
//    value2 = sortColumn.getCellContent(item2.get('content'));
//    result = Ember.compare(value1, value2);
//    if (sortAscending) {
//      return result;
//    } else {
//      return -result;
//    }
//  },
  createTree: function(parent, node, counter) {
    var children, row;
    var _this = this;
    row = App.FinancialTableTreeTableRow.create();
    if(node) {

        var in_counter = 0;
        children = (node.children || []).map(function(child) {
          var out = _this.createTree(row, child, in_counter);
          in_counter = in_counter + 1;
          return out;
        });
        
        row.setProperties({
          isRoot      : !parent,
          isLeaf      : Ember.isEmpty(children),
          content     : node,
          parent      : parent,
          children    : children,
          groupName   : node.group_name,
          isCollapsed : parent ? parent.isCollapsed : false,
          rowNumber   : counter
        });
        return row;
    }
  },
  flattenTree: function(parent, node, rows) {
    var _this = this;
    rows.pushObject(node);
    (node.children || []).forEach(function(child) {
      return _this.flattenTree(node, child, rows);
    });
    return rows;
  },
  computeStyles: function(parent, node) {
    var _this = this;
    node.computeStyles(parent);
    return node.get('children').forEach(function(child) {
      return _this.computeStyles(node, child);
    });
  }
});

Number.prototype.toCurrency = function() {
  var value;
  if (isNaN(this) || !isFinite(this)) {
    return '-';
  }
  value = Math.abs(this).toFixed(2);
  value = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return (this < 0 ? '-$' : '$') + value;
};

Number.prototype.toPercent = function() {
  if (isNaN(this) || !isFinite(this)) {
    return '-';
  }
  return Math.abs(this * 100).toFixed(2) + '%';
};
