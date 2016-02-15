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
