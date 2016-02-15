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
