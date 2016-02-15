App.SubjectRoute = App.GFPanelRoute.extend();

App.SubjectController = App.GFPanelIndependantController.extend({
    name : 'subject',

    single_subject          : undefined,
    single_subject_key      : Ember.computed.alias('controllers.main.heatmap.subject.params.single_subject_key'),
    
    single_subject_did_change : function() {
        this.set('single_subject_key', this.get('single_subject.key'));
    }.observes('single_subject.key'),
    
    subject_search : undefined,
    table_columns : function() {
        var con       = this;
        var col_width = this.get('col_width');
        
        return [
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : 'Subject ID',
                contentPath    : "key",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : "'" + this.get('state.metric_type.label') + "'",
                contentPath    : 'metric_val',
                can_sort       : true,
                getCellContent : function(row) {
                    console.log('row', row);
                    if(row.metric_val > 1000) {
                        return numeral(row.metric_val).format('0.0a');
                    } else {
                        return row.metric_val;
                    }
                }
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth  : col_width * 2,
                headerCellName      : "'" + this.get('state.metric_type.label') + "' Over Time",
                headerCellViewClass : 'App.TimeSeriesSparkCellHeaderView',
                tableCellViewClass  : 'App.TimeSeriesSparkCellView',
                getCellContent      : 'timeseries',
                can_sort            : false,
                can_scale           : true,
                get_ts_resolution : function() {
                    return con.get('state.ts_resolution');
                }
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                headerCellName     : "'" + this.get('state.metric_type.label') + "' By Type",
                tableCellViewClass : 'App.TypeSparkCellView',
                getCellContent     : 'types',
                can_sort           : false
            })
        ];
    }.property('state.metric_type.label'),
    
    // When table row is clicked, opens report viewer
    table_onClick : function(single_subject, main_con) {
        var client = main_con.get('client');
        var state  = main_con.get('state');
        
        // Dependency injection, since report viewer is
        // generic
        function fetch_unfiltered(params, callback) {
            params.data_type      = 'subject';
            params.single_subject = single_subject;
            params.n_reports      = 100;
            
            client.run_fetch_reports(state, params, function(data) {
                Ember.run(this, callback, data);
            });
        }
        
        App.Report.make_report_modal({
            "fetchers" : {
                "unfiltered" : fetch_unfiltered,
            },
            "controller" : main_con,
            "title"      : 'All Reports for ID ' + single_subject.key
        }); // FEAT: Change this to reflect the actual type of ID this isq
    },
    
    // On right-click, shows geographic activity of subject
    // on map
    table_onRightClick: function(single_subject, con) {
        console.log('bad actor table on right click', con);
        con.set('single_subject', single_subject);
        return false;
    },
    
    // Bad actor is sometimes undefined
    _get_table_data : function(subject) {
        var self   = this;
        self.get('client').run_fetch_subjects(self.get('state'), function(response) {
            self.set('table_data', response.data);
            self.set('eub', response.eub);
        }, subject);
    },
    
    actions : {
        search_subject: function(subject) {
            this._get_table_data(subject);
        },
        // Removes points on map
        clear_subject : function() {
            this.set('single_subject', undefined);
        },
        get_table_data: function() {
            // If no search term, gets everything
            if(!this.get('subject_search')) {
                Ember.run.debounce(this, '_get_table_data', 500, true);
            // Otherwise, only gets matches
            } else {
                this.send('search_subject', this.get('subject_search'));
            }
        },

        export_data : function() {
            var data = this.get('table_data');
            
            var csvContent = _.map(data, function(row) {
                var properties = row.key + ',' + row.count;
                var types      = _.map(row.types, function(type) {
                    return properties + ',' + _.values(_.omit(type, 'count')).join(',');
                }).join('\n');
                var timeseries = _.map(row.timeseries.data, function(date) {
                    return properties + ',' + _.values(_.omit(date, 'count')).join(',');
                }).join('\n');
                return {'properties' : properties, 'types' : types, "timeseries" : timeseries};
            });

            var csvHeaders = {
                'properties' : ['id', 'n_filings'].join(','),
                'types'      : ['id', 'n_filings'].join(',') + ',' + _.keys(_.omit(data[0].types[0], 'count')).join(','),
                'timeseries' : ['id', 'n_filings'].join(',') + ',' + _.keys(_.omit(data[0].timeseries.data[0], 'count')).join(',')
            };
            
            _.map(_.keys(csvHeaders), function(key) {
                var content = _.pluck(csvContent, key).join('\n');
                var header  = csvHeaders[key];
                App.Helper.download(header + '\n' + content, key + '_subject_download_' + ( + new Date() ) + '.csv', 'text/csv');
            });
        }
    }
});
