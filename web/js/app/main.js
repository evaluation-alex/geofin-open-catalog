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

