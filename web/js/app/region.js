App.RegionRoute      = App.GFPanelRoute.extend();
App.RegionController = App.GFPanelIndependantController.extend({
    name : 'region',

    visible : Ember.computed.alias('controllers.main.heatmap.region.visible'),

    groupingColumn : Ember.computed(function() {
        var self			  = this;
        var col_width		  = this.get('col_width');
        var borders_selection = this.get('state.borders_selection');
        var all_borders       = this.get('all_borders');
        
        return Ember.Table.ColumnDefinition.create({
          headerCellName      : '',
          columnWidth         : col_width,
          isTreeColumn        : true,
          isSortable          : true,
          textAlign           : 'text-align-left',
          headerCellViewClass : 'App.FinancialTableHeaderTreeCell',
          tableCellViewClass  : 'App.FinancialTableTreeCell',
          contentPath         : 'group_value',
          getCellContent      : function(row) {
            if(row.group_name == 'Country') {
                return App.Helper.iso2name(row.group_value, borders_selection, all_borders);
            } else {
                return row.group_value.replace('TYPE_', '');
            }
          },
          can_sort : false
        });
    }).property('table_data.grouping_factors.@each', 'table_data', 'state.borders_selection.value', 'col_width'),
  
    table_columns : Ember.computed(function() {
        var columns, content, names, vf, con, ts_resolution;
        
        con = this;
        if (!this.get('table_data')) { return; }
        
        vf            = this.get('table_data.value_factors');
        ts_resolution = this.get('state.ts_resolution');

        if(vf) {
              columns = _.map(vf, function(v, index) {
			  //v is cell header and index is the index of the cell header
              return Ember.Table.ColumnDefinition.create({
                index               : index,
                columnWidth         : con.get('col_width'),
                headerCellName      : v.display_name,
                headerCellViewClass : 'App.FinancialTableHeaderCell',
                tableCellViewClass  : v.is_time_series ? 'App.FinancialTableSparkCell' : 'App.TreeTableCell',
                can_sort            : !v.is_time_series,
                can_scale           : v.is_time_series,
                get_ts_resolution : function() {
                    return con.get('state.ts_resolution');
                },
                getCellContent: function(row) {
                    var pretty_value;
                    try {
                        var object   = row.values[this.get('index')];
                        pretty_value = object.value;
                        pretty_value = parseInt(pretty_value);
                        if(pretty_value > 1000) {
                            pretty_value = numeral(pretty_value).format('0,0');
                        }
                    } catch(e) {
                        pretty_value = '';
                    }
                    return pretty_value;
                },
                getCellContent_pct : function(row) {
                    var object = row.values[this.get('index')];
                    return object.pct;
                },
                getCellContent_ts : function(row) {
                    var object = row.values[this.get('index')];
                    return object.timeseries;
                },
                getCellContent_rank : function(row) {
                    var object = row.values[this.get('index')];
                    return object.rank;
                }
              });
            });
            columns.unshiftObject(this.get('groupingColumn'));
            return columns;
        }
    }).property('table_data'),
  
    selected_did_clear : function() { // +_+
        this.set('table_data', undefined);
    }.observes('state.selected'),
    
    actions : {
        get_table_data : function() {
            var self  = this;
            self.get('client').run_fetch_locus(self.get('state'), function(response) {
                self.set('table_data', response.data);
            });
        },
        
        // Get reports from region
        // Injecting fetchers to generic report
        // viewer
        run_selected_reports: function() {
            var client    = this.get('client');
            var state     = this.get('state');
            var main_con  = this.get('controllers.main');
            
            function fetch_filtered(params, callback) {
                params.data_type = 'region';
                params.n_reports = 100;

                client.run_fetch_reports(state, params, function(data) {
                    Ember.run(this, callback, data);
                });
            }
//            function fetch_unfiltered(params, callback) {
//                client.run_fetch_reports(state, params, function(data) {
//                    data.reports.length = 5;
//                    callback(data)
//                })
//            }
            
            App.Report.make_report_modal({
                "fetchers" : {
                    'filtered'   : fetch_filtered,
                },
                'controller' : main_con,
                'title'      : 'Reports for ' + _.map(state.get('selected'), function(x) {
                    return x.name;
                }).join(', ')
            });
        }
    }
});
