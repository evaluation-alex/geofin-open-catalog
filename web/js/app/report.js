App.ReportView = Ember.View.extend({
	templateName : "report",
    didInsertElement : function() {
        try {
            var report = ace.edit("report-viewer");
            report.setTheme("ace/theme/monokai");
            report.getSession().setMode("ace/mode/javascript");

            // parent_con
            this.set('controller.targetObject.report', report);

            console.log(' -- using JSON report viewer --');
        } catch(e) {
            console.log(' -- using graphene report viewer --');
        }
    }
});

App.Report = Ember.Object.extend({});

App.Report.reopenClass({
    grapheneReport : function(parent_con, x, clickType) {
        function make_report_url(x) {
            var clean_report_id = _.filter(x.id.split('_'), function(x) {return x !== '';})[0];
            var clean_report_type = config.GRAPHENE_REPORT_KEY[x.type];
            var report_url = config.GRAPHENE_URL_BASE + clean_report_type + "/" + clean_report_id;
            return report_url;
        }

        var report_url = make_report_url(x);
        parent_con.set('report_url', report_url);
        if(clickType == 'right') {
            window.open(report_url, '_blank');
        }
    },
    yamlReport : function(parent_con, x, clickType) {
        parent_con.get('client').get_report(x.type, x.id, function(response) {
            parent_con.set('report_data', response);
            var report = parent_con.get('report');
            console.log('report', report);
            
            report.getSession().setValue(JSON.stringify(response, null, '\t'));
        });
    },
    clickHelper : function(x, controller, direction) {
        if(config.GRAPHENE_URL_BASE) {
            App.Report.grapheneReport(controller, x, direction);
        } else {
            App.Report.yamlReport(controller, x, direction);
        }
    },
    make_report_modal : function(params) {
      
      var fetchers = params.fetchers,
        parent_con = params.controller,
        title      = params.title;
      
      // How does the client know the name of the sorting options?
      // Column names of tables?
      var fetch      = fetchers[_.keys(fetchers)[0]];
      var parameters = {reverse : false, page : 0, sortBy : 'total_amount'};

      parent_con.set('report_url', undefined);

      fetch(parameters, function(data) {
          Ember.Widgets.ModalComponent.popup({
                primary : {
                    classNames       : ['report-modal'],
                    contentViewClass : App.ReportView,

                    targetObject     : parent_con,
                    headerText       : title,
                    confirmText      : "Done",
                    cancelText       : undefined,
                    
                    fetchers         : fetchers,
                    current_fetcher  : _.keys(fetchers)[0],
                    fetcher_names    : _.keys(fetchers),
                    
                    // More elegant way to set these?
                    data    : data,
                    sortBy  : parameters.sortBy,
                    reverse : parameters.reverse,
                    page    : parameters.page,
                    
                    show_page_down : data.min_showing > 0,
                    show_page_up   : data.max_showing < data.total_count,
                    
                    use_graphene : config.GRAPHENE_URL_BASE || false,
                    onClick : function(x) {
                        App.Report.clickHelper(x, parent_con, 'left');
                    },
                    // BUG: This closes the modal window for some reason
                    onRightClick : function(x) {
                        App.Report.clickHelper(x, parent_con, 'right');
                    }
                }, 
                computed : {
                    col_width : 99, // (*) stupid hardcode hack
                    table_columns: function() {
                        var col_width = this.get('col_width');
                        return [ 
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 9/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Report ID',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "id",
                                can_sort            : true,
                                getCellContent : function(row) {
                                    return row.id;
                                }
                            }),
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 5/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Report Type',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "type",
                                can_sort            : true,
                                getCellContent : function(row) {
                                    return row.type.replace('type_', '').toUpperCase();
                                }
                            }),
                            Ember.Table.ColumnDefinition.create({
                                defaultColumnWidth  : col_width * 5/6,
                                textAlign           : 'text-align-left',
                                headerCellName      : 'Date',
                                headerCellViewClass : 'App.ServerHeaderCell',
                                contentPath         : "date_filed",
                                can_sort            : true
                            }),
//                            Ember.Table.ColumnDefinition.create({
//                                defaultColumnWidth  : col_width * 5/6,
//                                textAlign           : 'text-align-left',
//                                headerCellName      : 'Amount',
//                                headerCellViewClass : 'App.ServerHeaderCell',
//                                contentPath         : "total_amount",
//                                getCellContent : function(row) {
//                                    return numeral(row.total_amount).format('0.00a');
//                                },
//                                can_sort : true
//                            })
                        ];}.property(),
                    actions : {
                        export_data : function() {
                            var self_modal   = this;
                            this.get('fetchers')[this.get('current_fetcher')]({
                                'sortBy'       : self_modal.get('sortBy'),
                                'reverse'      : self_modal.get('reverse'),
                                'page'         : 0,
                                'n_reports'    : config.MAX_EXPORT_REPORTS
                            }, function(data) {
                                console.log('data report export', data);
                                var csvHeader  = _.keys(data.reports[0]);
                                var csvContent = _.map(data.reports, function(row) {
                                    return _.values(row).join(',');
                                }).join('\n');
                                                                
                                App.Helper.download(csvHeader + '\n' + csvContent, 'reports_download_' + ( + new Date() ) + '.csv', 'text/csv');
                            });
                        },
                        fetch : function(fetcher_name) {
                            var self_modal = this;
                            this.set('current_fetcher', fetcher_name);
                            this.get('fetchers')[fetcher_name](function(data) {
                                self_modal.set('data', data);
                                self_modal.set('show_page_down', data.min_showing > 0);
                                self_modal.set('show_page_up', data.max_showing < data.total_count);
                            });
                        },
                        // Need to handle going past the end
                        paginate : function(direction) {
                            var self_modal = this;
                            
                            // Update page
                            var page = this.get('page');
                            this.set('page', Math.max(page + direction, 0));
                            
                            // Get new data
                            this.get('fetchers')[this.get('current_fetcher')]({
                                'sortBy'  : self_modal.get('sortBy'),
                                'reverse' : self_modal.get('reverse'),
                                'page'    : self_modal.get('page')
                            }, function(data) {
                                self_modal.set('data', data);

                                self_modal.set('show_page_down', data.min_showing > 0);
                                self_modal.set('show_page_up', data.max_showing < data.total_count);
                            });
                        }
                    }
                }
            });
        });
    }
});
