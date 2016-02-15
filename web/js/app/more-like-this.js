App.MorelikethisRoute = App.GFPanelRoute.extend();

App.MorelikethisController = App.GFPanelIndependantController.extend({
    name : 'morelikethis',

    table_columns : function() {
        var col_width = this.get('col_width');
        
        return [
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width,
                textAlign      : 'text-align-left',
                headerCellName : 'Region',
                contentPath    : "name",
                getCellContent : function(row) {
                    return row.name;
                },
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width / 2,
                headerCellName : 'Relevant Filings',
                contentPath    : "tot",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width / 2,
                headerCellName : "Similarity Rank",
                contentPath    : "rank",
                can_sort       : true
            }),
            Ember.Table.ColumnDefinition.create({
                defaultColumnWidth : col_width * 1.5,
                headerCellName     : 'Distribution Over Form Types',
                tableCellViewClass : 'App.MoreLikeThisSparkCellView',
                contentPath        : 'proportions',
                can_sort           : false
            })
        ];
    }.property(),
    
    actions : {
        get_table_data : function() {
            var self   = this;
            var client = this.get('client');
            var state  = this.get('state');

            client.run_fetch_more_like_this(state, function(more_like_this) {
                console.log('more like this', more_like_this);
            
                var place_list = self.get('controllers.main.heatmap.place_list');
                var new_more_like_this = _.filter(
                    _.map(more_like_this, function(mlt) {
                        var mtc = _.filter(place_list, function(cl) {
                            return cl.locii[0].locus_id == mlt.name.toUpperCase();
                        })[0];

                        if(mtc) {
                            mlt.name = mtc.name;
                        }else{
                            mlt.name = '';
                        }

                        return mlt;
                    }),
                    function(x) {return x.name !== '';});
                self.set('table_data', new_more_like_this);
            });
        }
    }
});

// Is this necessary?
App.MoreLikeThisView = Ember.View.extend({
    templateName : "morelikethis",
    more_like_this_did_change: function() {
        this.rerender();
    }.observes('more_like_this')
});


// -- QED -- //
