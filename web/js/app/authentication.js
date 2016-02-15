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
