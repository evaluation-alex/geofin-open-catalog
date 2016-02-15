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

