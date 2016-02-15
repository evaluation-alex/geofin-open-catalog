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
