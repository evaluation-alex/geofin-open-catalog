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
