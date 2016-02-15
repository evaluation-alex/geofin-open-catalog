
App.GlobalRoute = App.GFPanelRoute.extend();

App.GlobalController = App.GFPanelLinkedController.extend({
    name       : 'global',
    linked_to  : 'region',

    // Extra linked properties
    active_columns : Ember.computed.alias('controllers.main.state.active_columns'),
    active_columns_did_change : function() {
        this.send('refresh_underlying_data');
    }.observes('active_columns.@each'),
    
    // Templates for table columns
    table_columns : function() {
        var self              = this;
        var borders_selection = this.get('state.borders_selection');
        var col_width         = this.get('col_width');
        var all_borders       = this.get('all_borders');
        
        var active_columns = this.get('active_columns');
        
        return _.flatten([
            Ember.Table.ColumnDefinition.create({
              defaultColumnWidth  : col_width,
              textAlign           : 'text-align-left',
              headerCellName      : 'ID',
              contentPath         : 'locus_id',
              getCellContent : function(row) {
                return App.Helper.iso2name(row.locus_id, borders_selection, all_borders) + ' (' + row.locus_id + ')';
              },
              can_sort : true
            }),
            _.map(active_columns, function(col) {
                console.log('col', col);
                var val = col.value;
                return Ember.Table.ColumnDefinition.create({
                  defaultColumnWidth  : col_width,
                  headerCellName      : "'" + col.label + "'",
                  contentPath         : val + '.val',
                  tableCellViewClass  : 'App.RankedTableCell',
                  getCellContent      : function(row) {
                    var suffix = (val.match('amount') || val.match('amnt')) ? ' ($)' : '';
                    if(row[val].val > 1000) {
                        return numeral(row[val].val).format('0.000a') + suffix;
                    } else {
                        return numeral(row[val].val).format('0.00') + suffix;
                    }
                  },
                  getCellContent_rank : function(row) {
                    return row[val].rank;
                  },
                  getHighlighted : function(row) {
                    var selected = self.get('state.selected');
                    return _.where(selected, {'locus_id' : row.locus_id}).length > 0;
                  },
                  can_sort : true,
                  rank     : 100
                });
            })
        ]);
    }.property('table_data'),

    actions : {
        export_data : function() {
            var data = _.map(this.get('table_data'), App.Helper.flattenJSON);
            var csvHeader  = _.keys(data[0]).join(',');
            var csvContent = _.map(data, function(row) {
                return _.values(row).join(',');
            }).join('\n');

            App.Helper.download(csvHeader + '\n' + csvContent, 'global_download_' + ( + new Date() ) + '.csv', 'text/csv');
        }
    }
});
