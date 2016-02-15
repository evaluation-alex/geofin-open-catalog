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

