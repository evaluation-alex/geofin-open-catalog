App.Serializable = Ember.Mixin.create({
    serialize: function () {
        var result = {};
        for (var key in $.extend(true, {}, this)) {
            // Skip these
            if (
                key === 'isInstance' ||
                key === 'isDestroyed' ||
                key === 'isDestroying' ||
                key === 'concatenatedProperties' ||
                typeof this[key] === 'function'
            ) {
                    continue;
            }
            result[key] = this[key];
        }
        return result;
    }
});

App.Helper = Ember.Object.extend();
App.Helper.reopenClass({
    flattenJSON : function(data) {
        var result = {};
        function recurse (cur, prop) {
            if (Object(cur) !== cur) {
                result[prop] = cur;
            } else if (Array.isArray(cur)) {
                 for(var i=0, l=cur.length; i<l; i++)
                     recurse(cur[i], prop + "[" + i + "]");
                if (l === 0)
                    result[prop] = [];
            } else {
                var isEmpty = true;
                for (var p in cur) {
                    isEmpty = false;
                    recurse(cur[p], prop ? prop+"."+p : p);
                }
                if (isEmpty && prop)
                    result[prop] = {};
            }
        }
        recurse(data, "");
        return result;
    },

  dateToYMD : function(date) {
    var y = date.getFullYear();
    var m = date.getMonth() + 1;
    var d = date.getDate();
    return '' + y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d);
  },

  locus_property : function(inp) {
    if(inp.borders_selection !== undefined) {
      inp = inp.borders_selection;
    }

    if(inp.value === 'world') {
      return 'ISO2';
    } else if (inp.value === 'state') {
      return 'STUSPS';
    }
  },
  
  nested_sortBy : function(children, column) {
    var self = this;
    children = _.sortBy(children, function(x) {
      return parseInt(x.values[column - 1].value, 10);
    });
    _.map(children, function(child) {
      if(child.children) {
        child.children = self.nested_sortBy(child.children, column);
      }
    });
    return children;
  },
  nested_reverse : function(children, column) {
    var self = this;
    children.reverse();
    _.map(children, function(child) {
      if(child.children) {
        child.children = self.nested_reverse(child.children, column);
      }
    });
    return children;
  },


    smart_sortBy : function(x, path) {        
        var out;
        if(path.match('\\.')) {
            path = path + '';
            var path_arr = path.split('.');
            out = _.sortBy(x, function(e) {
                var out = e;
                _.map(path_arr, function(i) {
                    out = out[i];
                });
                return undefined || out;
            });
        } else {
            out = _.sortBy(x, function(x) {return undefined || x[path];});
        }
        return out;
    },

  capitalize : function(str) {
    return str.replace(/^./g, str.charAt(0).toUpperCase());
  },

  iso2name : function(iso, borders_selection, all_borders) {
    var self = this;
    var out  = [];
    // all_borders is sometimes undefined coming out of the region controller
    if(all_borders){
        out = _.filter(all_borders[borders_selection.value], function(x) {
            return x.properties[self.locus_property(borders_selection)] === iso;
        });
    }
    return out.length > 0 ? out[0].properties.NAME : 'No Region';
  },

  clean_class : function(str) {
    return str.replace(/\./g, '_').replace(/-/g, '_');
  },

  // Financial Tree table

  make_place_list : function(borders, borders_selection) {
    var self = this;
    return _.map(borders, function(x) {
      return {
        "name" : x.properties.NAME,
        "locii" : [{
          'name'      : x.properties.NAME,
          'locus_id'  : x.properties[self.locus_property(borders_selection)]
        }]
      };
    });
  },
  
    download : function(strData, strFileName, strMimeType) {
        var D = document,
            a = D.createElement("a");
            strMimeType= strMimeType || "application/octet-stream";

        if (navigator.msSaveBlob) { // IE10
            return navigator.msSaveBlob(new Blob([strData], {type: strMimeType}), strFileName);
        } /* end if(navigator.msSaveBlob) */

        if ('download' in a) { //html5 A[download]
            a.href = "data:" + strMimeType + "," + encodeURIComponent(strData);
            a.setAttribute("download", strFileName);
            a.innerHTML = "downloading...";
            D.body.appendChild(a);
            setTimeout(function() {
                a.click();
                D.body.removeChild(a);
            }, 66);
            return true;
        } /* end if('download' in a) */

        //do iframe dataURL download (old ch+FF):
        var f = D.createElement("iframe");
        D.body.appendChild(f);
        f.src = "data:" +  strMimeType   + "," + encodeURIComponent(strData);

        setTimeout(function() {
            D.body.removeChild(f);
        }, 333);
        return true;
    }
});
