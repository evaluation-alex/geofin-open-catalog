App.BranchRoute = App.GFPanelRoute.extend();

App.BranchController = App.GFPanelLinkedController.extend({
    name      : 'branch',
    linked_to : 'branch',
    
    table_columns : function() {
        console.log('making table columns');
        var con       = this;
        var col_width = this.get('col_width');
        return[
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width,
              textAlign          : 'text-align-left',
              headerCellName     : 'Name',
              contentPath        : 'properties.city_name',
              tableCellViewClass : 'App.BranchTableCell',
              getCellContent_loc : function(row) {
                console.log('row', row);
                return row.properties.city_name;
              },
              getCellContent_branch : function(row) {
                return row.properties.branch_name;
              },
              getCellContent_address : function(row) {
                return row.properties.address;
              },
              can_sort : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth : col_width * 0.5,
              headerCellName     : "'" + this.get('state.metric_type.label') + "'",
              contentPath        : 'properties.metric_val',
              getCellContent : function(row) {
                if(row.properties.metric_val > 1000) {
                    return numeral(row.properties.metric_val).format('0.0a');
                } else {
                    return row.properties.metric_val;
                }
              },
              can_sort : true
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1.5,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' Over Time",
              headerCellViewClass : 'App.TimeSeriesSparkCellHeaderView',
              tableCellViewClass  : 'App.TimeSeriesSparkCellView',
              getCellContent      : 'properties.timeseries',
              can_sort            : false,
              can_scale           : true,
              get_ts_resolution   : function() {
                return con.get('state.ts_resolution');
              }
            }),
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width * 1,
              headerCellName      : "'" + this.get('state.metric_type.label') + "' By Type",
              tableCellViewClass  : 'App.TypeSparkCellView',
              getCellContent      : 'properties.types',
              can_sort            : false,
              get_ts_resolution : function() {
                return con.get('state.ts_resolution');
              }
            })
        ];
    }.property('state.metric_type.label'),
    
    table_onClick : function(selected_branch, con) {
        var client = con.get('client');
        var state  = con.get('state');
        
        function fetch_filtered(params, callback) {
            params.data_type       = 'branch';
            params.selected_branch = {"properties" : {"key" : selected_branch.properties.key}};
            params.n_reports       = 100;
            
            client.run_fetch_reports(state, params, function(data) {
                Ember.run(this, callback, data);
            });
        }
        
//        function fetch_unfiltered(params, callback) {
//        
//        }
        
        App.Report.make_report_modal({
            "fetchers" : {
                'filtered'   : fetch_filtered,
//                'unfiltered' : fetch_unfiltered,
            },
            'controller' : con,
            'title'      : 'Reports for ' +
                selected_branch.properties.branch_name +
                ',' +
                selected_branch.properties.address +
                ', ' +
                selected_branch.properties.city
        });
    },

    table_onMouseEnter : function(row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
            // BUG -- Locus_id should be computed in a better way, so that it's actually a unique identifier
            var point = _.findWhere(data_layer._layers, function(e) {
                return ( e.feature.properties.locus_id === row.properties.locus_id ) &&
                       ( e.feature.properties.address  === row.properties.address );
            });
            point.bringToFront();
            point.openPopup();
        }
    },

    table_onMouseLeave : function(row, con) {
        var data_layer = con.get('data_layer.layer');
        if(data_layer) {
            _.map(data_layer._layers, function(e) {
                return e.closePopup();
            });
        }
    },
    
    actions : { 
        export_data : function() {
            var data = this.get('table_data');
            
            var csvContent = _.map(data, function(row) {
                var subRow = row.properties.loc;
                var slmRow = _.omit(row.properties, 'loc');
                var extRow = _.extend(subRow, slmRow);

                var properties = _.values(extRow).join(',');
                var types      = _.map(row.types, function(type) {
                    return properties + ',' + _.values(_.omit(type, 'count')).join(',');
                }).join('\n');
                var timeseries = _.map(row.timeseries.data, function(date) {
                    return properties + ',' + _.values(_.omit(date, 'count')).join(',');
                }).join('\n');
                return {'properties' : properties, 'types' : types, "timeseries" : timeseries};
            });

            var ready = _.keys(data[0].properties);
            ready.unshift('lon', 'lat');
            var headerHead = ready.join(',');

            var csvHeaders = {
                'properties' : headerHead,
                'types'      : headerHead + ',' + _.keys(_.omit(data[0].types[0], 'count')).join(','),
                'timeseries' : headerHead + ',' + _.keys(_.omit(data[0].timeseries.data[0], 'count')).join(',')
            };
            
            _.map(_.keys(csvHeaders), function(key) {
                var content = _.pluck(csvContent, key).join('\n');
                var header  = csvHeaders[key];
                App.Helper.download(header + '\n' + content, key + '_branch_download_' + ( + new Date() ) + '.csv', 'text/csv');
            });
        }
    }
});

