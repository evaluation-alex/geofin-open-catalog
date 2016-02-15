
//App.DissectionChartView = Ember.ContainerView.extend({
//	has_charts : false,
//	init : function() {
//		this._super();
//		this.append_charts();
//	},
//	childViews : [],
//	
//    append_charts: function(){
//		var field_type = this.get('controller.dissect_form_type_field.type');
//        var dissection = this.get('controller.dissection');
//        
//		if(dissection != undefined) {
//			if(this.toArray().length > 0) {
//				this.popObject();
//                this.popObject();
//			}
//            
//            // Only happens if we're looking at something categorical
//            if(field_type == 'string') {
//                this.add_bar_data(this, dissection);
//            }
//            
//            this.add_time_data(this, dissection);
//		}
//    }.observes('controller.dissection'),
//    
//    add_bar_data : function(container, dissection) {
//        var bar_data = _.map(dissection, function(x) {
//            return {
//                "label" : x.key,
//                "value" : x.count,
//                "group" : 'Group'
//            }
//        });
//        
//        container.pushObject(Ember.View.create({
//            templateName : 'barchart',
//            data         : bar_data,
//            title        : "Dissection Chart (Bar)"
//        }));
//    },
//    
//    add_time_data : function(container, dissection) {
//    	console.log('dissection', dissection)
//        var time_data = _.chain(dissection).map(function(x) {
//			var key = x.key;
//			return _.map(x.date_agg.buckets, function(b) {
//				return {
//					value : b.doc_count,
//					time  : new Date(b.key),
//					label : key
//				}
//			})
//        }).flatten().value();
//
//        container.pushObject(Ember.View.create({
//            templateName : 'timechart',
//            data         : time_data,
//            title        : "Dissection Chart (Time)"
//        }));
//    }
//});
//
////App.ChartView = Ember.ContainerView.extend({
////
////	has_charts : false,
////	init : function() {
////		this._super();
////		this.append_charts();
////	},
////	childViews : [],
////	
////    append_charts: function(){
////		var tsdata = this.get('controller').get('tsdata');
////		var has_charts = this.get('has_charts');
////		if(!has_charts && tsdata != undefined) {
////			this.set('has_charts', true);
////
////			count_data = _.map(tsdata, function(x) {
////				return {
////					"time"  : new Date(x.date),
////					"value" : Math.log(x.count + 1) / Math.LN10,
////					"label" : x.type
////				}
////			});
////			var count_view = Ember.View.create({
////				templateName : 'timeserieschart',
////				data         : count_data,
////				title        : "Transaction Volume over Time (logscale)"
////			});
////			this.pushObject(count_view);
////			
////			amount_data = _.map(tsdata, function(x) {
////				return {
////					"time"  : new Date(x.date),
////					"value" : Math.log(x.amount + 1) / Math.LN10,
////					"label" : x.type
////				}
////			});
////			var amount_view = Ember.View.create({
////				templateName : 'timeserieschart',
////				data         : amount_data,
////				title        : "Transaction Value over Time (logscale)"
////			})
////			this.pushObject(amount_view)
////		}
////    }.observes('controller.tsdata')
////});
////
