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
