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
