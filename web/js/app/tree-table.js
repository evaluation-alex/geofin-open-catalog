
App.FinancialTableHeaderCell = Ember.Table.HeaderCell.extend({
  templateName: 'table_cells/financial-table-header-cell',

  // other functions declared in helpers.js
  sort_column : function(self, view) {
    var content               = self.get('controller.content');
    var current_sorted_column = self.get('controller.current_sorted_column');
    var new_sorted_column     = view.contentIndex;
    var new_content           = JSON.parse(JSON.stringify(content)); // Hack
    new_content.root.children = App.Helper.nested_sortBy(content.root.children, new_sorted_column);
    if(current_sorted_column == new_sorted_column) {
        self.toggleProperty('controller.reverseSort');
    } else {
        self.set('controller.reverseSort', true);
    }
    if(self.get('controller.reverseSort')) {
        new_content.root.children = App.Helper.nested_reverse(new_content.root.children, new_sorted_column);
    }

    self.set('controller.current_sorted_column', new_sorted_column);
    self.set('controller.content', []);
    self.set('controller.content', new_content);
  },
  scale_column : function(self, view) {
    console.log('scaling column', self, view);
  },
  click : function(event) {
    $headerView = $(event.target).parents('.ember-table-cell');
    view = Ember.View.views[$headerView.attr('id')];
    if (view) {
        var can_sort   = view.content.can_sort;
        var can_scale  = view.content.can_scale;
        if(can_sort) {
            this.sort_column(this, view);
        } else if(can_scale) {
            this.toggleProperty('controller.scale');
        }
    }
  }
});

App.FinancialTableTreeCell = Ember.Table.TableCell.extend({
  templateName : 'table_cells/financial-table-tree-cell',
  classNames   : 'ember-table-table-tree-cell',
  paddingStyle : Ember.computed(function() {
    return "padding-left:" + (this.get('row.indentation')) + "px;";
  }).property('row.indentation'),
  rowNumber : Ember.computed(function() {
    return this.get('row.rowNumber');
  }).property('row.rowNumber')
});

App.FinancialTableHeaderTreeCell = Ember.Table.HeaderCell.extend({
  templateName : 'table_cells/financial-table-header-tree-cell',
  classNames   : 'ember-table-table-header-tree-cell'
});

App.FinancialTableTreeTableRow = Ember.Table.Row.extend({
  content            : null,
  children           : null,
  parent             : null,
  isRoot             : false,
  isLeaf             : false,
  isCollapsed        : false,
  isShowing          : true,
  indentationSpacing : 20,
  groupName          : null,
  rowNumber          : 0,
  computeStyles: function(parent) {
    var groupingLevel, indentType, indentation, isShowing, pGroupingLevel, spacing;
    groupingLevel = 0;
    indentation   = 0;
    isShowing     = true;
    if (parent) {
      isShowing      = parent.get('isShowing') && !parent.get('isCollapsed');
      pGroupingLevel = parent.get('groupingLevel');
      groupingLevel  = pGroupingLevel;
      if (parent.get('groupName') !== this.get('groupName')) {
        groupingLevel += 1;
      }
      indentType = groupingLevel === pGroupingLevel ? 'half' : 'full';
      spacing = this.get('indentationSpacing');
      if (!parent.get('isRoot')) {
        indentation = parent.get('indentation');
        indentation += (indentType === 'half' ? spacing / 2 : spacing);
      }
    }
    this.set('groupingLevel', groupingLevel);
    this.set('indentation', indentation);
    return this.set('isShowing', isShowing);
  },
  computeRowStyle: function(maxLevels) {
    var level;
    level = this.getFormattingLevel(this.get('groupingLevel'), maxLevels);
    return this.set('rowStyle', "ember-table-row-style-" + level);
  },
  recursiveCollapse: function(isCollapsed) {
    this.set('isCollapsed', isCollapsed);
    return this.get('children').forEach(function(child) {
      return child.recursiveCollapse(isCollapsed);
    });
  },
  getFormattingLevel: function(level, maxLevels) {
    switch (maxLevels) {
      case 1:
        return 5;
      case 2:
        if (level === 1) {
          return 2;
        }
        return 5;
      case 3:
        if (level === 1) {
          return 1;
        }
        if (level === 2) {
          return 3;
        }
        return 5;
      case 4:
        if (level === 1) {
          return 1;
        }
        if (level === 2) {
          return 2;
        }
        if (level === 4) {
          return 4;
        }
        return 5;
      case 5:
        return level;
      default:
        if (level === maxLevels) {
          return 5;
        }
        return Math.min(level, 4);
    }
  }
});

App.FinancialTableComponent = Ember.Table.EmberTableComponent.extend({
  numFixedColumns         : 1,
  isCollapsed             : false,
  isHeaderHeightResizable : true,
  rowHeight               : 30,
  hasHeader               : true,
  hasFooter               : true,
  sortAscending           : false,
  sortColumn              : null,
  selection               : null,
  actions: {
    toggleTableCollapse: function(event) {
      var children, isCollapsed;
      this.toggleProperty('isCollapsed');
      isCollapsed = this.get('isCollapsed');
      children    = this.get('root.children');
      if (!(children && children.get('length') > 0)) {
        return;
      }
      children.forEach(function(child) {
        return child.recursiveCollapse(isCollapsed);
      });
      return this.notifyPropertyChange('rows');
    },
    toggleCollapse: function(row) {
      row.toggleProperty('isCollapsed');
      return Ember.run.next(this, function() {
        return this.notifyPropertyChange('rows');
      });
    }
  },

  content : null,
  columns: null,
  
  // Assumes that

  
  root: Ember.computed(function() {
    var content;
    content = this.get('content');
    if (!content) {
      return;
    }
    
    return this.createTree(null, content.root);
  }).property('content', 'sortAscending', 'sortColumn'),
  rows: Ember.computed(function() {
    var maxGroupingLevel, root, rows;
    root = this.get('root');
    if (!root) {
      return Ember.A();
    }
    rows = this.flattenTree(null, root, Ember.A());
    this.computeStyles(null, root);
    maxGroupingLevel = Math.max.apply(rows.getEach('groupingLevel'));
    rows.forEach(function(row) {
      return row.computeRowStyle(maxGroupingLevel);
    });
    return rows;
  }).property('root', 'content'),
  bodyContent: Ember.computed(function() {
    var rows;
    rows = this.get('rows');
    if (!rows) {
      return Ember.A();
    }
    rows = rows.slice(1, rows.get('length'));
    return rows.filterProperty('isShowing');
  }).property('rows'),
  footerContent: Ember.computed(function() {
    var rows;
    rows = this.get('rows');
    if (!rows) {
      return Ember.A();
    }
    return rows.slice(0, 1);
  }).property('rows'),
//  orderBy: function(item1, item2) {
//    var result, sortAscending, sortColumn, value1, value2;
//    sortColumn    = this.get('sortColumn');
//    sortAscending = this.get('sortAscending');
//    if (!sortColumn) {
//      return 1;
//    }
//    value1 = sortColumn.getCellContent(item1.get('content'));
//    value2 = sortColumn.getCellContent(item2.get('content'));
//    result = Ember.compare(value1, value2);
//    if (sortAscending) {
//      return result;
//    } else {
//      return -result;
//    }
//  },
  createTree: function(parent, node, counter) {
    var children, row;
    var _this = this;
    row = App.FinancialTableTreeTableRow.create();
    if(node) {

        var in_counter = 0;
        children = (node.children || []).map(function(child) {
          var out = _this.createTree(row, child, in_counter);
          in_counter = in_counter + 1;
          return out;
        });
        
        row.setProperties({
          isRoot      : !parent,
          isLeaf      : Ember.isEmpty(children),
          content     : node,
          parent      : parent,
          children    : children,
          groupName   : node.group_name,
          isCollapsed : parent ? parent.isCollapsed : false,
          rowNumber   : counter
        });
        return row;
    }
  },
  flattenTree: function(parent, node, rows) {
    var _this = this;
    rows.pushObject(node);
    (node.children || []).forEach(function(child) {
      return _this.flattenTree(node, child, rows);
    });
    return rows;
  },
  computeStyles: function(parent, node) {
    var _this = this;
    node.computeStyles(parent);
    return node.get('children').forEach(function(child) {
      return _this.computeStyles(node, child);
    });
  }
});

Number.prototype.toCurrency = function() {
  var value;
  if (isNaN(this) || !isFinite(this)) {
    return '-';
  }
  value = Math.abs(this).toFixed(2);
  value = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  return (this < 0 ? '-$' : '$') + value;
};

Number.prototype.toPercent = function() {
  if (isNaN(this) || !isFinite(this)) {
    return '-';
  }
  return Math.abs(this * 100).toFixed(2) + '%';
};
