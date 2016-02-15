Ember.TEMPLATES["_contracted"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push(" Global ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push(" Regions ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push(" Cities ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push(" Subjects ");
  }

  data.buffer.push("<div class=\"row-fluid\">\n    <ul ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":nav :nav-tabs :nav-tabs-sidebar client.loading:loading")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <li> ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "global", options) : helperMissing.call(depth0, "link-to", "global", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </li>\n        <li> ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "region", options) : helperMissing.call(depth0, "link-to", "region", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </li>\n        <li> ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "city", options) : helperMissing.call(depth0, "link-to", "city", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </li>\n        \n        <li> ");
  stack1 = (helper = helpers['link-to'] || (depth0 && depth0['link-to']),options={hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "subject", options) : helperMissing.call(depth0, "link-to", "subject", options));
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </li>\n\n\n\n\n\n\n    </ul>\n\n    <div class=\"tab-content tab-content-sidebar col-xs-12\">\n        ");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["account"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers._triageMustache.call(depth0, "accuracies.city", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program3(depth0,data) {
  
  
  data.buffer.push(" Infinite ");
  }

function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers._triageMustache.call(depth0, "accuracies.branch", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push(" ");
  stack1 = helpers._triageMustache.call(depth0, "accuracies.subject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" ");
  return buffer;
  }

  data.buffer.push("\n<div class=\"list-group\">\n    <div class=\"list-group-item\" style=\"height:60px;\">\n        <label> Username </label>\n        ");
  stack1 = helpers._triageMustache.call(depth0, "username", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n\n\n\n    <div class=\"list-group-item\" style=\"height:60px;\">\n        <label style=\"float:left;\"> Exact Location Name Matches Only </label>\n        <span style=\"float:right;\">\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("exact_geoname")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </span>\n    </div>\n    \n    <div class=\"list-group-item\" style=\"height:60px;\">\n        <label style=\"float:left;\"> Time Series Resolution </label>\n        <div class=\"gf-select-menu\" style=\"width:50%; float:right;\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers['select-component'] || (depth0 && depth0['select-component']),options={hash:{
    'id': ("ts-resolution-select"),
    'contentBinding': ("ts_resolution_options"),
    'prompt': (" - Set Time Series Resolution - "),
    'selectionBinding': ("ts_resolution"),
    'optionLabelPath': ("label"),
    'optionValuePath': ("value")
  },hashTypes:{'id': "STRING",'contentBinding': "STRING",'prompt': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING"},hashContexts:{'id': depth0,'contentBinding': depth0,'prompt': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-component", options))));
  data.buffer.push("\n        </div>\n    </div>\n\n    <div class=\"list-group-item\">\n        <label> Speed/Accuracy Tradeoff </label>\n        <p> Higher values indicate higher precision and slower performance </p>\n\n        <b> City Precision</b>\n        ");
  stack1 = helpers['if'].call(depth0, "accuracies.city", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div id=\"city-slider\" class=\"slider-precision\"></div>\n\n        <b> Branch Precision</b>\n        ");
  stack1 = helpers['if'].call(depth0, "accuracies.branch", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div id=\"branch-slider\" class=\"slider-precision\"></div>\n        \n        <b> Subject Precision </b>\n        ");
  stack1 = helpers['if'].call(depth0, "accuracies.subject", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        <div id=\"subject-slider\" class=\"slider-precision\"></div>\n    </div>\n\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["application"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "invalidateSession", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" id=\"btn-logout\" class=\"btn btn-primary navbar-btn navbar-right\">\n            <i class=\"fa fa-close\"></i>\n        </a>\n        <br>\n        <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "accountSettings", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(" id=\"btn-account-settings\"\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":btn :btn-primary :navbar-btn :navbar-right controllers.main.state.user_query.def:has-user-query")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            <i class=\"fa fa-plug\"></i>\n        </a>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    <div id=\"global-dropzone\"  ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":dropzone showDropZone:visible")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n    <div id=\"subject-dropzone\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":dropzone showDropZone:visible")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    <div id=\"no-permission-dropzone\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":dropzone showDropZone:visible")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></div>\n");
  return buffer;
  }

  data.buffer.push("\n<div id=\"login-wrapper\">\n    ");
  stack1 = helpers['if'].call(depth0, "session.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</div>\n\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  stack1 = helpers['if'].call(depth0, "isAdmin", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(5, program5, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["barchart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<div class=\"chart-wrapper col-sm-6\"\n        style=\"width:50%; background-color:rgb(240,240,240); \\\n        color:black; z-index:999; border-right: 1px solid black;\">\n    <div class=\"chart-container\" style=\"overflow-y:auto;\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['horizontal-bar-chart'] || (depth0 && depth0['horizontal-bar-chart']),options={hash:{
    'data': ("view.data"),
    'selectedSeedColor': ("rgb(140, 202, 197)")
  },hashTypes:{'data': "ID",'selectedSeedColor': "STRING"},hashContexts:{'data': depth0,'selectedSeedColor': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "horizontal-bar-chart", options))));
  data.buffer.push("\n    </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["branch"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"table-container\" id=\"branch-table\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'hasFooter': (false),
    'forceFillColumns': (true),
    'columnsBinding': ("table_columns"),
    'contentBinding': ("table_data"),
    'onClick': ("table_onClick"),
    'onMouseEnter': ("table_onMouseEnter"),
    'onMouseLeave': ("table_onMouseLeave"),
    'con': ("controller"),
    'rowHeight': (60)
  },hashTypes:{'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'columnsBinding': "STRING",'contentBinding': "STRING",'onClick': "ID",'onMouseEnter': "ID",'onMouseLeave': "ID",'con': "ID",'rowHeight': "INTEGER"},hashContexts:{'hasFooter': depth0,'forceFillColumns': depth0,'columnsBinding': depth0,'contentBinding': depth0,'onClick': depth0,'onMouseEnter': depth0,'onMouseLeave': depth0,'con': depth0,'rowHeight': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <span style=\"color:red;text-align:right;\"> Values accurate &plusmn; ");
  stack1 = helpers._triageMustache.call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program5(depth0,data) {
  
  
  data.buffer.push("\n            Loading...\n        ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n            No Selection or No Data\n            <br>\n            <small style=\"color:#4C4C4C;\">\n                (Note: This view requires 'fin_inst_branch' on the SARs to be enabled.)\n            </small>\n        ");
  }

  data.buffer.push("\n<h4 class=\"sidebar-table-header\"> Activity by Branch </h4>\n\n<div class=\"row control-panel\">\n    <div class=\"col-xs-4\">\n        <label> Show Branches on Map </label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("visible")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </div>\n    <div class=\"col-xs-4\">\n        <button class=\"btn btn-sidebar\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "export_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            Export\n        </button>\n    </div>\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["city"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"table-container\" id=\"pp-table\" style=\"overflow: visible !important;\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'hasFooter': (false),
    'forceFillColumns': (true),
    'columnsBinding': ("table_columns"),
    'contentBinding': ("table_data"),
    'onClick': ("table_onClick"),
    'onMouseEnter': ("table_onMouseEnter"),
    'onMouseLeave': ("table_onMouseLeave"),
    'con': ("controller")
  },hashTypes:{'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'columnsBinding': "STRING",'contentBinding': "STRING",'onClick': "ID",'onMouseEnter': "ID",'onMouseLeave': "ID",'con': "ID"},hashContexts:{'hasFooter': depth0,'forceFillColumns': depth0,'columnsBinding': depth0,'contentBinding': depth0,'onClick': depth0,'onMouseEnter': depth0,'onMouseLeave': depth0,'con': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <span style=\"color:red;text-align:right;\"> Values accurate &plusmn; ");
  stack1 = helpers._triageMustache.call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n    ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program5(depth0,data) {
  
  
  data.buffer.push(" Loading... ");
  }

function program7(depth0,data) {
  
  
  data.buffer.push(" No Selection or No Data ");
  }

  data.buffer.push("\n<h4 class=\"sidebar-table-header\"> Activity by City </h4>\n\n<div class=\"row-fluid control-panel\">\n    <div class=\"col-xs-4\">\n        <label> Show Cities on Map </label>\n        ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("visible")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n    </div>\n    <div class=\"col-xs-4\">\n        <button class=\"btn btn-sidebar\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "export_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            Export\n        </button>\n    </div>\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["color-picker"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n     	<p class=\"col-md-2\"> ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'type': ("text"),
    'class': ("basic"),
    'style': ("color:inherit;"),
    'valueBinding': ("c.value")
  },hashTypes:{'type': "STRING",'class': "STRING",'style': "STRING",'valueBinding': "STRING"},hashContexts:{'type': depth0,'class': depth0,'style': depth0,'valueBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push(" </p>\n    ");
  return buffer;
  }

  data.buffer.push("\nSelect colors for the legend. Click `Done` to apply changes.\n\n<br />\n<hr />\n\n<div class=\"row center\">\n  <button class=\"btn btn-default col-md-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "numColors", "less", {hash:{
    'target': ("view")
  },hashTypes:{'target': "ID"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("> - </button>\n  <div class=\"container col-md-10 \">\n    ");
  stack1 = helpers.each.call(depth0, "c", "in", "colors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </div>\n  <button class=\"btn btn-default col-md-1\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "numColors", "more", {hash:{
    'target': ("view")
  },hashTypes:{'target': "ID"},hashContexts:{'target': depth0},contexts:[depth0,depth0],types:["STRING","STRING"],data:data})));
  data.buffer.push("> + </button>\n</div>\n\n<hr />\nChoose the number of steps for the legend's gradient.\n\n<br>\n<br>\n<!--<div class=\"container col-md-12 text-center\"\">\n  ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'id': ("SliderSingle"),
    'type': ("slider"),
    'name': ("Gradient"),
    'value': ("n_steps")
  },hashTypes:{'id': "STRING",'type': "STRING",'name': "STRING",'value': "ID"},hashContexts:{'id': depth0,'type': depth0,'name': depth0,'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n</div>-->\n\n<div class=\"container col-md-12 text-center\">\n");
  stack1 = helpers._triageMustache.call(depth0, "n_steps", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n<div id=\"color-slider\" class=\"slider-precision\"></div><br>\n<br>\n");
  return buffer;
  
});

Ember.TEMPLATES["compare-popover-content"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"container\">\n  <div class=\"builder builder-wrapper\">\n    ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "define-compare", "builder", options) : helperMissing.call(depth0, "render", "define-compare", "builder", options))));
  data.buffer.push("\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["define-compare"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                <li class=\"list-group-item\" style=\"padding-top:10px;\">\n                    <div class=\"row\">\n                        <div class=\"col-xs-6\">\n                            <div>\n                                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("label"),
    'placeholder': (" - ")
  },hashTypes:{'value': "ID",'placeholder': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                            </div>\n                            <div>\n                                ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("desc"),
    'placeholder': ("Enter Description")
  },hashTypes:{'value': "ID",'placeholder': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                            </div>\n                        </div>\n                        <div class=\"col-xs-2 col-offset-4\">\n                            <button class=\"btn btn-remove\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "remove_norm_type_option", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n                                <i class=\"fa fa-trash\"></i>\n                            </button>\n                        </div>\n                    </div>\n                </li>\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"row-fluid\" style=\"clear:both;\">\n    <div class=\"col-xs-6\">\n        <div class=\"list-group\">\n            <div class=\"list-group-header\">\n                <h4> Create Custom Comparison </h4>\n            </div>\n            <div class=\"list-group-item\">\n                <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "persist_comparison", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\">\n                    Persist Current State\n                </button>\n            </div>\n\n            <div class=\"list-group-item\">\n                <div class=\"accordion\" id=\"norm_accordion\">\n                    <div class=\"accordion-group\">\n                        <div class=\"accordion-heading\">\n                            <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#norm_accordion\" href=\"#targ2\">\n                                <center> Settings </center>\n                            </a>\n                        </div>\n                        <div id=\"targ2\" class=\"accordion-body collapse out\">\n                            <div class=\"row\" style=\"margin-top:5px; margin-bottom:15px;\">\n                                <div class=\"col-xs-4\" style=\"text-align:center\">\n                                    <label> Fixed Time Window </label>\n                                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("fix_time")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                                </div>\n\n                                <div class=\"col-xs-4\" style=\"text-align:center\">\n                                    <label> Fixed Form Types </label>\n                                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("fix_forms")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                                </div>\n\n                                <div class=\"col-xs-4\" style=\"text-align:center\">\n                                    <label> Fixed Metric </label>\n                                    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("fix_metric")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n        </div>\n    </div>\n\n    <div class=\"col-xs-6\">\n        <div class=\"list-group\">\n            <div class=\"list-group-header\">\n                <h4> Manage Custom Comparisons </h4>\n            </div>\n            ");
  stack1 = helpers.each.call(depth0, "norm_type_options", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["define-metric"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  data.buffer.push("<div class=\"row-fluid\" style=\"clear:both;\">\n\n    <div class=\"col-xs-6\">\n        <div class=\"list-group\">\n            <div class=\"list-group-header\">\n                <h4> Manage Custom Metrics </h4>\n            </div>\n        </div>\n    </div>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["define-subset"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n                <li class=\"list-group-item\">\n                    <div class=\"row\">\n                        <div class=\"col-xs-5\">\n                            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("label")
  },hashTypes:{'value': "ID"},hashContexts:{'value': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                        </div>\n                        <div class=\"col-xs-5\">\n                            ");
  stack1 = helpers._triageMustache.call(depth0, "def.query", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                        </div>\n                        <div class=\"col-xs-2\">\n                            <button class=\"btn btn-remove\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "remove_option", "", "subset_options", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0,depth0],types:["STRING","ID","STRING"],data:data})));
  data.buffer.push(">\n                                <i class=\"fa fa-trash\"></i>\n                            </button>\n                        </div>\n                    </div>\n                </li>\n            ");
  return buffer;
  }

  data.buffer.push("<div class=\"row-fluid\" style=\"clear:both;\">\n    <div class=\"col-xs-6\">\n        <div class=\"list-group\">\n            <div class=\"list-group-header\">\n                <h4> Create Custom Subset </h4>\n            </div>\n\n            <div class=\"list-group-item\">\n                <div class=\"row\">\n                    <div class=\"col-xs-6\">\n                        ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'class': ("input-subset"),
    'value': ("subset_query"),
    'placeholder': (" - Enter Query - "),
    'insert-newline': ("add_subset_query")
  },hashTypes:{'class': "STRING",'value': "ID",'placeholder': "STRING",'insert-newline': "STRING"},hashContexts:{'class': depth0,'value': depth0,'placeholder': depth0,'insert-newline': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n                    </div>\n                </div>\n            </div>\n            <div class=\"list-group-item\">\n\n                <div class=\"accordion\" id=\"subset_accordion\">\n                    <div class=\"accordion-group\">\n                        <div class=\"accordion-heading\">\n                            <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#subset_accordion\" href=\"#targ1\">\n                                <center> Build Complex Query </center>\n                            </a>\n                        </div>\n                        <div id=\"targ1\" class=\"accordion-body collapse out\">\n                            <div class=\"accordion-inner\">\n                                <div id=\"editor\" style=\"clear:both;\"> </div>\n                                    <div class=\"accordion\" id=\"mapping_accordion\">\n                                        <div class=\"accordion-group\">\n                                            <div class=\"accordion-heading\">\n                                                <a class=\"accordion-toggle\" data-toggle=\"collapse\" data-parent=\"#mapping_accordion\" href=\"#targ2\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "show_mapping", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push("\">\n                                                    <center> View Data Mapping Details </center>\n                                                </a>\n                                            </div>\n                                            <div id=\"targ2\" class=\"accordion-body collapse out\">\n                                                <div class=\"accordion-inner\">\n                                                    <div id=\"mapping-viewer\" style=\"clear:both;\"> </div>\n                                                </div>\n                                            </div>\n                                        </div>\n                                    </div>\n                            </div>\n                            <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "add_complex_subset_query", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                                Submit\n                            </button>\n                        </div>\n                    </div>\n                </div>\n\n            </div>\n        </div>\n    </div>\n    <div class=\"col-xs-6\">\n        <div class=\"list-group\">\n            <div class=\"list-group-header\">\n                <h4> Manage Custom Subsets </h4>\n            </div>\n            ");
  stack1 = helpers.each.call(depth0, "subset_options", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n    </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["form-toggle"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<li class=\"li-form-toggle\">\n    <a class=\"form-select-link\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggle_form", "f", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("f.form_type")
  },hashTypes:{'id': "ID"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n        ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("f.toggled::inactive-form-type")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n            ");
  stack1 = helpers._triageMustache.call(depth0, "view.form_type_label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </a>\n</li>");
  return buffer;
  
});

Ember.TEMPLATES["form-type-modal"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <li class=\"list-group-item subfield-button\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggle_subfield", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("id")
  },hashTypes:{'id': "ID"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.toggled::hidden-subfield")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "locus_actor", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "toggled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </li>\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <i class=\"fa fa-minus pull-right\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.toggled::hidden-subfield")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n                ");
  return buffer;
  }

function program4(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                    <i class=\"fa fa-plus pull-right\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.toggled::hidden-subfield")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("></i>\n                ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <li class=\"list-group-item subfield-button\"\n            ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggle_subfield", "", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'id': ("id")
  },hashTypes:{'id': "ID"},hashContexts:{'id': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n            ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': ("this.toggled::hidden-subfield")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "amount_type", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                ");
  stack1 = helpers['if'].call(depth0, "toggled", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </li>\n    ");
  return buffer;
  }

  data.buffer.push("\n<h3> Location Definition </h3>\n<p class=\"documentation\">\n    Choose the field(s) used to assign a location to a given report.\n    Note that choosing more than one can result in double counting reports.\n</p>\n<ul class=\"list-group-form-type-modal list-group\" style=\"background:rgba(0, 0, 0, .3); padding:10px;\">\n    ");
  stack1 = helpers.each.call(depth0, "content.locus_actors", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n\n<h3> Amount Definition </h3>\n<p class=\"documentation\">\n    Choose the field(s) used to assign a dollar value to a given report.report\n    Note that choosing more than one can result in double counting reports.\n</p>\n<ul class=\"list-group-form-type-modal list-group\" style=\"background:rgba(0, 0, 0, .3); padding:10px;\">\n    ");
  stack1 = helpers.each.call(depth0, "content.amount_types", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(6, program6, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n</ul>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["global"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"table-container\" id=\"global-table\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'hasFooter': (false),
    'columnsBinding': ("table_columns"),
    'contentBinding': ("table_data"),
    'forceFillColumns': (true)
  },hashTypes:{'hasFooter': "BOOLEAN",'columnsBinding': "STRING",'contentBinding': "STRING",'forceFillColumns': "BOOLEAN"},hashContexts:{'hasFooter': depth0,'columnsBinding': depth0,'contentBinding': depth0,'forceFillColumns': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push(" Loading... ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push(" No Selection or No Data ");
  }

  data.buffer.push("\n<h4 class=\"sidebar-table-header\"> Global Activity </h4>\n\n<div class=\"row control-panel\">\n    <div class=\"col-xs-6 gf-select-menu\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['multi-select-component'] || (depth0 && depth0['multi-select-component']),options={hash:{
    'contentBinding': ("controllers.main.metric_type_options"),
    'prompt': (" - Select metrics - "),
    'optionLabelPath': ("label"),
    'optionValuePath': ("val"),
    'selectionsBinding': ("active_columns")
  },hashTypes:{'contentBinding': "STRING",'prompt': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'selectionsBinding': "STRING"},hashContexts:{'contentBinding': depth0,'prompt': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'selectionsBinding': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "multi-select-component", options))));
  data.buffer.push("\n    </div>\n    <div class=\"col-xs-4\">\n        <button class=\"btn btn-sidebar\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "export_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            Export\n        </button>\n    </div>\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n");
  return buffer;
  
});

Ember.TEMPLATES["login"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n        <div class=\"form-group\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("identification"),
    'placeholder': ("Enter Username"),
    'class': ("form-control"),
    'id': ("input-username")
  },hashTypes:{'value': "ID",'placeholder': "STRING",'class': "STRING",'id': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0,'class': depth0,'id': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n        <div class=\"form-group\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.input || (depth0 && depth0.input),options={hash:{
    'value': ("password"),
    'placeholder': ("Enter Password"),
    'class': ("form-control"),
    'id': ("input-password"),
    'type': ("password")
  },hashTypes:{'value': "ID",'placeholder': "STRING",'class': "STRING",'id': "STRING",'type': "STRING"},hashContexts:{'value': depth0,'placeholder': depth0,'class': depth0,'id': depth0,'type': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "input", options))));
  data.buffer.push("\n        </div>\n\n        ");
  stack1 = helpers.unless.call(depth0, "session.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n            <button id=\"auth-submit\" type=\"submit\" class=\"btn btn-default\">Login</button>\n        ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n            <h3 class=\"splash-header\"> Redirecting... </h3>\n        ");
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers.unless.call(depth0, "session.isAuthenticated", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program7(depth0,data) {
  
  
  data.buffer.push("\n            <h3 class=\"splash-header\"> Verifying Credentials... </h3>\n        ");
  }

function program9(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <div class=\"alert alert-danger alert-danger-login\">\n        <strong> Login failed: </strong> ");
  stack1 = helpers._triageMustache.call(depth0, "errorMessage", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n");
  return buffer;
  }

  data.buffer.push("<form id=\"login-form\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "authenticate", {hash:{
    'on': ("submit")
  },hashTypes:{'on': "STRING"},hashContexts:{'on': depth0},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n\n    <h1 class=\"splash-header\"> Geofin </h1>\n\n    ");
  stack1 = helpers['if'].call(depth0, "show_login", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n</form>\n\n");
  stack1 = helpers['if'].call(depth0, "errorMessage", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  return buffer;
  
});

Ember.TEMPLATES["main"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  
  data.buffer.push("\n                <\n            ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push("\n                >\n            ");
  }

function program5(depth0,data) {
  
  
  data.buffer.push("\n                <i class=\"fa fa-spinner fa-spin\"></i>\n            ");
  }

function program7(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n					<li>\n					<div class=\"gf-select-label\"></div>\n                    	<button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "clear_selection", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                        Clear\n                    </button>\n                </li>\n            ");
  return buffer;
  }

function program9(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.FormToggleView", {hash:{
    'f': ("f")
  },hashTypes:{'f': "ID"},hashContexts:{'f': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n            ");
  return buffer;
  }

  data.buffer.push("<div id=\"content\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":snap-content slider_open:small-content")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" data-snap-ignore=\"true\">\n    <nav ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":navbar :navbar-top :navbar-default client.loading:navbar-loading")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(" role=\"navigation\">\n      <div class=\"container-fluid\">\n\n        <div id=\"open-left\">\n            ");
  stack1 = helpers['if'].call(depth0, "slider_open", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            <br>\n            ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </div>\n\n        <div class=\"navbar-header navbar-right\">\n            <a id=\"geofin-brand\" class=\"navbar-brand\"> Geofin </a>\n        </div>\n\n        <ul class=\"nav navbar-nav morgan-nav\" style=\"padding-left:5px;\">\n            <li class=\"gf-select-menu\">\n                <div class=\"gf-select-label\">\n                    Subset\n                </div>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['select-editor'] || (depth0 && depth0['select-editor']),options={hash:{
    'title': ("Edit Subset"),
    'appView': ("App.SubsetPopoverContentView"),
    'id': ("subset-select"),
    'prompt': (" - Subset -"),
    'contentBinding': ("subset_options"),
    'selectionBinding': ("state.user_query"),
    'optionLabelPath': ("label"),
    'optionValuePath': ("value"),
    'placement': ("bottom-right")
  },hashTypes:{'title': "STRING",'appView': "STRING",'id': "STRING",'prompt': "STRING",'contentBinding': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'placement': "STRING"},hashContexts:{'title': depth0,'appView': depth0,'id': depth0,'prompt': depth0,'contentBinding': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'placement': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-editor", options))));
  data.buffer.push("\n            </li>\n\n            <li class=\"gf-select-menu\">\n                <div class=\"gf-select-label\">\n                    Metric\n                </div>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['select-editor'] || (depth0 && depth0['select-editor']),options={hash:{
    'title': ("Edit Metric"),
    'appView': ("App.MetricPopoverContentView"),
    'id': ("metric-select"),
    'prompt': (" - Metric -"),
    'contentBinding': ("metric_type_options"),
    'selectionBinding': ("state.metric_type"),
    'optionLabelPath': ("label"),
    'optionValuePath': ("value"),
    'placement': ("bottom-right")
  },hashTypes:{'title': "STRING",'appView': "STRING",'id': "STRING",'prompt': "STRING",'contentBinding': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'placement': "STRING"},hashContexts:{'title': depth0,'appView': depth0,'id': depth0,'prompt': depth0,'contentBinding': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'placement': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-editor", options))));
  data.buffer.push("\n            </li>\n\n            <li class=\"gf-select-menu\">\n                <div class=\"gf-select-label\">\n                    Compare\n                </div>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['select-editor'] || (depth0 && depth0['select-editor']),options={hash:{
    'title': ("Edit Compare"),
    'appView': ("App.ComparePopoverContentView"),
    'id': ("normalization-select"),
    'prompt': ("- Compare -"),
    'contentBinding': ("norm_type_options"),
    'selectionBinding': ("state.norm_type"),
    'optionLabelPath': ("label"),
    'optionValuePath': ("value"),
    'placement': ("bottom-right")
  },hashTypes:{'title': "STRING",'appView': "STRING",'id': "STRING",'prompt': "STRING",'contentBinding': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'placement': "STRING"},hashContexts:{'title': depth0,'appView': depth0,'id': depth0,'prompt': depth0,'contentBinding': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'placement': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "select-editor", options))));
  data.buffer.push("\n            </li>\n            ");
  stack1 = helpers['if'].call(depth0, "state.selected", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n      </div>\n    </nav>\n    <div id=\"map\"></div>\n    \n    <div class=\"navbar navbar-default navbar-fixed-bottom\" role=\"navigation\" id=\"lower-navbar\">\n        <ul class=\"nav navbar-nav\" id=\"ul-navbar-bottom\">\n            ");
  stack1 = helpers.each.call(depth0, "f", "in", "state.form_types", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(9, program9, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </ul>\n\n        <ul class=\"nav navbar-nav navbar-right\">\n            <li class=\"gf-select-menu\">\n                <div class=\"gf-select-label\">\n                    Location\n                </div>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gf-select'] || (depth0 && depth0['gf-select']),options={hash:{
    'id': ("locus-select"),
    'contentBinding': ("heatmap.place_list"),
    'prompt': (" - Click To Select -"),
    'label': ("Region"),
    'optionLabelPath': ("name"),
    'optionValuePath': ("name"),
    'selectionBinding': ("locus"),
    'classNames': ("dropup")
  },hashTypes:{'id': "STRING",'contentBinding': "STRING",'prompt': "STRING",'label': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'selectionBinding': "STRING",'classNames': "STRING"},hashContexts:{'id': depth0,'contentBinding': depth0,'prompt': depth0,'label': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'selectionBinding': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gf-select", options))));
  data.buffer.push("\n            </li>\n            <li class=\"gf-select-menu\" id=\"wrapper-dissect-form-type\">\n                <div class=\"gf-select-label\">\n                    Border\n                </div>\n                ");
  data.buffer.push(escapeExpression((helper = helpers['gf-select'] || (depth0 && depth0['gf-select']),options={hash:{
    'id': ("border-select"),
    'prompt': ("- Select -"),
    'contentBinding': ("border_type_options"),
    'selectionBinding': ("state.borders_selection"),
    'optionLabelPath': ("label"),
    'optionValuePath': ("value"),
    'classNames': ("dropup")
  },hashTypes:{'id': "STRING",'prompt': "STRING",'contentBinding': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING",'classNames': "STRING"},hashContexts:{'id': depth0,'prompt': depth0,'contentBinding': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0,'classNames': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gf-select", options))));
  data.buffer.push("\n            </li>\n            <li id=\"slider\"></li>\n        </ul>\n    </div>\n</div>\n\n<div class=\"snap-drawers\">\n    <div class=\"snap-drawer snap-drawer-left\">\n        <div class=\"drawer-inner\" style=\"margin-top:-1px;\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers.partial || (depth0 && depth0.partial),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data},helper ? helper.call(depth0, "contracted", options) : helperMissing.call(depth0, "partial", "contracted", options))));
  data.buffer.push("\n        </div>\n    </div>\n</div>\n\n<!-- This is a total hack.  Need to fix the overflows on the Ember table header... -->\n<div id=\"time-series-context-menu\">\n    <ul class=\"dropdown-menu\" role=\"menu\" style=\"cursor:contextmenu;\">\n        <li><a tabindex=\"-1\" id=\"scale\">Scale To Cell</a></li>\n        <li><a tabindex=\"-1\" id=\"log\">Log Scale</a></li>\n    </ul>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["metric-definition"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push("\n            <i class=\"metric-property\"> Specially defined </i>\n        ");
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "view.explicit", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n                <i class=\"metric-property\"> Explicitly defined </i>\n                <br>\n                ");
  data.buffer.push(escapeExpression((helper = helpers.stringify || (depth0 && depth0.stringify),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data},helper ? helper.call(depth0, "view.def.content", options) : helperMissing.call(depth0, "stringify", "view.def.content", options))));
  data.buffer.push("\n            ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                <span class=\"metric-definition\"> For </span>\n                <span class=\"metric-property\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.pre_def.content.form_types", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(",</span> <br>\n                \n                <span class=\"metric-definition\"> </span>\n                <span class=\"metric-property\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.pre_def.content.statistic", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n                <span class=\"metric-definition\"> of </span>\n                <span class=\"metric-property\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.pre_def.content.field", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span> <br>\n                \n                <span class=\"metric-definition\"> Loc. from </span>\n                <span class=\"metric-property\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.pre_def.content.locus_actors", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n            ");
  return buffer;
  }

  data.buffer.push("        ");
  stack1 = helpers['if'].call(depth0, "view.special", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["metric-popover-content"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"container\">\n  <div class=\"builder builder-wrapper\">\n    ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "define-metric", "builder", options) : helperMissing.call(depth0, "render", "define-metric", "builder", options))));
  data.buffer.push("\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["morelikethis"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"table-container\" id=\"more-like-this-table\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'hasFooter': (false),
    'forceFillColumns': (true),
    'contentBinding': ("table_data"),
    'columnsBinding': ("table_columns"),
    'con': ("controller")
  },hashTypes:{'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'contentBinding': "STRING",'columnsBinding': "STRING",'con': "ID"},hashContexts:{'hasFooter': depth0,'forceFillColumns': depth0,'contentBinding': depth0,'columnsBinding': depth0,'con': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push(" Loading... ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push(" No Selection or No Data ");
  }

  data.buffer.push("\n<h4 class=\"sidebar-table-header\"> Similar Regions </h4>\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["profiler"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("        <h4 class=\"sidebar-table-header\"> Profiler for ");
  stack1 = helpers._triageMustache.call(depth0, "title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </h4>\n        <div>\n            ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "Pwidget", "child_data", options) : helperMissing.call(depth0, "render", "Pwidget", "child_data", options))));
  data.buffer.push("\n        </div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["pwidget"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, self=this, escapeExpression=this.escapeExpression, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                        ");
  stack1 = helpers.each.call(depth0, "m", "in", "model.data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(2, program2, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  return buffer;
  }
function program2(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                            <div class=\"list-group-item\">\n                                <a ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "select_item", "m", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["ID","ID"],data:data})));
  data.buffer.push(" class=\"profile-key\">\n                                    Field <b>");
  stack1 = helpers._triageMustache.call(depth0, "model.profile_field.field", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</b> = <b>");
  stack1 = helpers._triageMustache.call(depth0, "m.key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</b>\n                                    ");
  stack1 = helpers._triageMustache.call(depth0, "m.count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" times in this subset.\n                                </a>\n                                ");
  stack1 = helpers['if'].call(depth0, "profile_type_sig", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                            </div>\n                        ");
  return buffer;
  }
function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                    <br>\n                                    This is anomolous because <b>");
  stack1 = helpers._triageMustache.call(depth0, "model.profile_field.field", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</b> = <b>");
  stack1 = helpers._triageMustache.call(depth0, "m.key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</b>\n                                    only appears in\n                                    the background ");
  stack1 = helpers._triageMustache.call(depth0, "m.bg_count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" times.\n                                    <span class=\"profile-score\">\n                                        (Score: ");
  stack1 = helpers._triageMustache.call(depth0, "m.score", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")\n                                    </span>\n                                    <br>\n                                    The subset is\n                                    <br> <i> form_types </i>\n                                    <br> <i> time range </i>\n                                    <br> <i> location </i>\n                                    ");
  stack1 = helpers['if'].call(depth0, "model.subset", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                    \n                                    <br>\n                                    The background is\n                                    <br> <i> form_types </i>\n                                    <br> <i> time range </i>\n                                    ");
  stack1 = helpers['if'].call(depth0, "model.subset", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                ");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                        ");
  stack1 = helpers.each.call(depth0, "p", "in", "model.subset", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                    ");
  return buffer;
  }
function program5(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                            <br> <i> ");
  stack1 = helpers._triageMustache.call(depth0, "p.field.field", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" = ");
  stack1 = helpers._triageMustache.call(depth0, "p.key", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </i>\n                                        ");
  return buffer;
  }

function program7(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n                                        <br> <i> location </i>\n                                        ");
  stack1 = helpers.each.call(depth0, "p", "in", "model.parents", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(5, program5, data),contexts:[depth0,depth0,depth0],types:["ID","ID","ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                                    ");
  return buffer;
  }

function program9(depth0,data) {
  
  
  data.buffer.push("\n                        ... No data ...\n                    ");
  }

function program11(depth0,data) {
  
  
  data.buffer.push("\n                    <span style=\"color:red\">\n                        Loading...\n                    </span>\n                ");
  }

function program13(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n            <hr>\n            ");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data},helper ? helper.call(depth0, "Pwidget", "child_data", options) : helperMissing.call(depth0, "render", "Pwidget", "child_data", options))));
  data.buffer.push("\n        ");
  return buffer;
  }

  data.buffer.push("        <div class=\"row-fluid\">\n            <div class=\"col-xs-12\">\n                <span style=\"color:red;\"> ");
  stack1 = helpers._triageMustache.call(depth0, "model.pretty_subset", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n                <div class=\"profile list-group\">\n                    <div class=\"list-group-header\">\n                        <div class=\"gf-select-menu\">\n                            ");
  data.buffer.push(escapeExpression((helper = helpers['gf-select'] || (depth0 && depth0['gf-select']),options={hash:{
    'prompt': (" - Select FTF -"),
    'contentBinding': ("model.form_type_fields"),
    'selectionBinding': ("model.profile_field"),
    'optionLabelPath': ("field"),
    'optionValuePath': ("field")
  },hashTypes:{'prompt': "STRING",'contentBinding': "STRING",'selectionBinding': "STRING",'optionLabelPath': "STRING",'optionValuePath': "STRING"},hashContexts:{'prompt': depth0,'contentBinding': depth0,'selectionBinding': depth0,'optionLabelPath': depth0,'optionValuePath': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "gf-select", options))));
  data.buffer.push("\n                        </div>\n                        <div>\n                            <label>\n                                Significant Terms\n                            </label>\n                            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("profile_type_sig")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n                        </div>\n                    </div>\n                    \n                    ");
  stack1 = helpers['if'].call(depth0, "model.data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </div>\n                \n                ");
  stack1 = helpers['if'].call(depth0, "loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(11, program11, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n            </div>\n        </div>\n        \n        ");
  stack1 = helpers['if'].call(depth0, "child_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(13, program13, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["region"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '', helper, options;
  data.buffer.push("\n    <div class=\"table-container\" id=\"fin-table\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['financial-table'] || (depth0 && depth0['financial-table']),options={hash:{
    'hasHeader': (true),
    'hasFooter': (false),
    'forceFillColumns': (true),
    'numFixedColumns': (0),
    'rowHeight': (35),
    'contentBinding': ("table_data"),
    'columnsBinding': ("table_columns"),
    'con': ("controller")
  },hashTypes:{'hasHeader': "BOOLEAN",'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'numFixedColumns': "INTEGER",'rowHeight': "INTEGER",'contentBinding': "STRING",'columnsBinding': "STRING",'con': "ID"},hashContexts:{'hasHeader': depth0,'hasFooter': depth0,'forceFillColumns': depth0,'numFixedColumns': depth0,'rowHeight': depth0,'contentBinding': depth0,'columnsBinding': depth0,'con': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "financial-table", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  
  data.buffer.push(" Loading... ");
  }

function program6(depth0,data) {
  
  
  data.buffer.push(" No Selection or No Data ");
  }

  data.buffer.push("\n");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n<div class=\"control-header-wrapper\">\n    <h4 class=\"sidebar-table-header\"> Activity by Region </h4>\n    <div class=\"row control-panel\">\n        <div class=\"col-xs-4\">\n            <label> Show Regions on Map </label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("visible")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n\n        <div class=\"col-xs-4\">\n            <button id=\"show-reports\" class=\"btn btn-sidebar\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "run_selected_reports", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                View Reports\n            </button>\n        </div>\n    </div>\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["report"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "paginate", -1, {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","INTEGER"],data:data})));
  data.buffer.push("> < </button>\n                    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n                        <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "paginate", 1, {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","INTEGER"],data:data})));
  data.buffer.push("> > </button>\n                    ");
  return buffer;
  }

function program5(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n            <iframe id=\"cse-iframe\"\n             ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'src': ("targetObject.report_url")
  },hashTypes:{'src': "STRING"},hashContexts:{'src': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n             style=\"height:100%; width:100%;\" frameborder=\"0\"></iframe>\n        ");
  return buffer;
  }

function program7(depth0,data) {
  
  
  data.buffer.push("\n            <div id='report-viewer' style=\"height:100%; width:100%;\"></div>\n        ");
  }

  data.buffer.push("\n\n\n<div class=\"row-fluid row-report\" style=\"height:600px;\">\n    <div class=\"col-sm-5\" id=\"report-table-wrapper\" style=\"height:100%;\">\n        <div class=\"row-fluid\">\n            <div class=\"col-xs-4\">\n                ");
  stack1 = helpers._triageMustache.call(depth0, "data.min_showing", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" - ");
  stack1 = helpers._triageMustache.call(depth0, "data.max_showing", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" <br>\n                of ");
  stack1 = helpers._triageMustache.call(depth0, "data.total_count", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" reports\n            </div>\n            <div class=\"col-xs-4\">\n                <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "export_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                    Export\n                </button>\n            </div>\n            <div class=\"col-xs-4 pull-right\">\n                <ul class=\"pager\">\n                    ");
  stack1 = helpers['if'].call(depth0, "show_page_down", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                    ");
  stack1 = helpers['if'].call(depth0, "show_page_up", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n                </ul>\n            </div>\n        </div>\n        <div class=\"table-container\" style=\"height:95%; clear:both;\">\n            ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'columnsBinding': ("table_columns"),
    'contentBinding': ("data.reports"),
    'hasFooter': (false),
    'forceFillColumns': (true),
    'onClick': ("onClick"),
    'onRightClick': ("onRightClick")
  },hashTypes:{'columnsBinding': "STRING",'contentBinding': "STRING",'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'onClick': "ID",'onRightClick': "ID"},hashContexts:{'columnsBinding': depth0,'contentBinding': depth0,'hasFooter': depth0,'forceFillColumns': depth0,'onClick': depth0,'onRightClick': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n        </div>\n    </div>\n    <div class=\"col-sm-7\" style='height:100%;'>\n        ");
  stack1 = helpers['if'].call(depth0, "use_graphene", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(7, program7, data),fn:self.program(5, program5, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["subject"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this, helperMissing=helpers.helperMissing;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n        <div class=\"col-xs-4\">\n            <button class=\"btn btn-primary\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "clear_subject", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n                Clear Subject\n            </button>\n        </div>\n    ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1, helper, options;
  data.buffer.push("\n    ");
  stack1 = helpers['if'].call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(4, program4, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"table-container\" id=\"bad-actor-table\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['table-component'] || (depth0 && depth0['table-component']),options={hash:{
    'hasFooter': (false),
    'forceFillColumns': (true),
    'contentBinding': ("table_data"),
    'columnsBinding': ("table_columns"),
    'onClick': ("table_onClick"),
    'onRightClick': ("table_onRightClick"),
    'con': ("controller")
  },hashTypes:{'hasFooter': "BOOLEAN",'forceFillColumns': "BOOLEAN",'contentBinding': "STRING",'columnsBinding': "STRING",'onClick': "ID",'onRightClick': "ID",'con': "ID"},hashContexts:{'hasFooter': depth0,'forceFillColumns': depth0,'contentBinding': depth0,'columnsBinding': depth0,'onClick': depth0,'onRightClick': depth0,'con': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "table-component", options))));
  data.buffer.push("\n    </div>\n");
  return buffer;
  }
function program4(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        <span style=\"color:red;text-align:right;\"> Values accurate &plusmn; ");
  stack1 = helpers._triageMustache.call(depth0, "eub", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n    ");
  return buffer;
  }

function program6(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <h4 class=\"sidebar-table-header\">\n        ");
  stack1 = helpers['if'].call(depth0, "client.loading", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </h4>\n");
  return buffer;
  }
function program7(depth0,data) {
  
  
  data.buffer.push(" Loading... ");
  }

function program9(depth0,data) {
  
  
  data.buffer.push(" No Selection or No Data ");
  }

  data.buffer.push("<h4 class=\"sidebar-table-header\">\n    Activity By Subject\n</h4>\n\n<div class=\"row control-panel\">\n    ");
  stack1 = helpers['if'].call(depth0, "single_subject", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <div class=\"col-xs-4\">\n        <button class=\"btn btn-sidebar\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "export_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n            Export\n        </button>\n    </div>\n</div>\n\n");
  stack1 = helpers['if'].call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(6, program6, data),fn:self.program(3, program3, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["subset-popover-content"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("<div class=\"container\">\n  <div class=\"builder builder-wrapper\">\n	");
  data.buffer.push(escapeExpression((helper = helpers.render || (depth0 && depth0.render),options={hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","STRING"],data:data},helper ? helper.call(depth0, "define-subset", "builder", options) : helperMissing.call(depth0, "render", "define-subset", "builder", options))));
  data.buffer.push("\n  </div>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["timechart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<div class=\"chart-wrapper col-sm-6\"\n        style=\"width:50%; background-color:rgb(240,240,240); \\\n        color:black; z-index:999;\">\n    <div class=\"chart-container\" style=\"overflow-y:auto;\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['time-series-chart'] || (depth0 && depth0['time-series-chart']),options={hash:{
    'lineData': ("view.data"),
    'selectedSeedColor': ("rgb(140, 202, 197)")
  },hashTypes:{'lineData': "ID",'selectedSeedColor': "STRING"},hashContexts:{'lineData': depth0,'selectedSeedColor': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "time-series-chart", options))));
  data.buffer.push("\n    </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["timeserieschart"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, helper, options, helperMissing=helpers.helperMissing, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<div class=\"chart-wrapper col-sm-6\"\n style=\"width:50%; background-color:rgb(240,240,240); \\\n        color:black; padding:10px; z-index:999;\">\n    <h2 style=\"padding-left:5%;\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.title", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </h2>\n    <div class=\"chart-container\" style=\"width:100%;\">\n        ");
  data.buffer.push(escapeExpression((helper = helpers['time-series-chart'] || (depth0 && depth0['time-series-chart']),options={hash:{
    'lineData': ("view.data"),
    'selectedSeedColor': ("rgb(140, 202, 197)")
  },hashTypes:{'lineData': "ID",'selectedSeedColor': "STRING"},hashContexts:{'lineData': depth0,'selectedSeedColor': depth0},contexts:[],types:[],data:data},helper ? helper.call(depth0, options) : helperMissing.call(depth0, "time-series-chart", options))));
  data.buffer.push("\n    </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["toggle-switch"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("<label for=\"");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.checkBoxId", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.label", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    <input id=\"");
  data.buffer.push(escapeExpression(helpers.unbound.call(depth0, "view.checkBoxId", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\" type=\"checkbox\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'checked': ("view.checked")
  },hashTypes:{'checked': "STRING"},hashContexts:{'checked': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n    <div class=\"switch\" style=\"width:60px;\"></div>\n</label>\n");
  return buffer;
  
});

Ember.TEMPLATES["transfers"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("        <h4 class=\"sidebar-table-header\"> Transfers </h4>\n        \n        <div class=\"col-xs-3\">\n            <label> Show Transfers on Map </label>\n            ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "App.ToggleSwitch", {hash:{
    'checkedBinding': ("visible")
  },hashTypes:{'checkedBinding': "STRING"},hashContexts:{'checkedBinding': depth0},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n        </div>\n        \n        ");
  stack1 = helpers._triageMustache.call(depth0, "table_data", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n\n");
  return buffer;
  
});

Ember.TEMPLATES["wrapper"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("<div class=\"container-fluid\">");
  stack1 = helpers._triageMustache.call(depth0, "outlet", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</div>");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/branch-table-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("\n<div class=\"ember-table-cell-container\">\n  <span class=\"ember-table-content\">\n    <span> ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_branch", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n    <br>\n    <span style=\"color:grey; font-size:.8em\"> ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_address", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(", ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_loc", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" </span>\n  </span>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/editable-table-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  var buffer = '';
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression(helpers.view.call(depth0, "view.innerTextField", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data})));
  data.buffer.push("\n  ");
  return buffer;
  }

function program3(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n    <span class='content'>");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("</span>\n  ");
  return buffer;
  }

  data.buffer.push("\n<span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":ember-table-content view.remoteEdit:blackcell view.localEdit:bluecell:greycell")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n  ");
  stack1 = helpers['if'].call(depth0, "view.isEditing", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <i class=\"fa fa-pencil pull-right\" style=\"padding-top:.6em; color: rgb(149, 149, 149);\"></i>\n</span>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/financial-table-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("<div class=\"ember-table-cell-container\">\n  <span class=\"ember-table-content\">\n    <span class='cell-content-rank'>\n        ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_rank", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </span>\n    ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(" (");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_pct", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push(")\n  </span>\n</div>\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/financial-table-header-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("\n<div class=\"ember-table-cell-container\">\n  <div class=\"ember-table-header-content-container\">\n    <span class=\"ember-table-content\">\n      ");
  stack1 = helpers._triageMustache.call(depth0, "view.content.headerCellName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </span>\n  </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/financial-table-header-tree-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression, self=this;

function program1(depth0,data) {
  
  
  data.buffer.push(" &#9654; ");
  }

function program3(depth0,data) {
  
  
  data.buffer.push(" &#9660; ");
  }

  data.buffer.push("\n<div class=\"ember-table-cell-container\">\n  <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":ember-table-toggle-span :ember-table-toggle isCollapsed:ember-table-expand:ember-table-collapse")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n      ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleTableCollapse", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["STRING"],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers['if'].call(depth0, "isCollapsed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n  <div class=\"ember-table-header-content-container\">\n    <span class=\"ember-table-content\">\n      ");
  stack1 = helpers._triageMustache.call(depth0, "view.column.headerCellName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </span>\n  </div>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/financial-table-spark-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '';


  return buffer;
  
});

Ember.TEMPLATES["table_cells/financial-table-tree-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n            ");
  stack1 = helpers['if'].call(depth0, "view.row.isCollapsed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push(" &#9654; ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("  &#9660; ");
  }

  data.buffer.push("\n<div class=\"ember-table-cell-container\" ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'style': ("view.paddingStyle")
  },hashTypes:{'style': "STRING"},hashContexts:{'style': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n  <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":ember-table-toggle-span view.row.isLeaf::ember-table-toggle view.row.isCollapsed:ember-table-expand:ember-table-collapse")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push("\n    ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "toggleCollapse", "view.row", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push("\n        style=\"text-align:center;\">\n        ");
  stack1 = helpers.unless.call(depth0, "view.row.isLeaf", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n  <span class=\"ember-table-content\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/ranked-table-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, escapeExpression=this.escapeExpression;


  data.buffer.push("\n<div class=\"ember-table-cell-container\">\n    <span ");
  data.buffer.push(escapeExpression(helpers['bind-attr'].call(depth0, {hash:{
    'class': (":ember-table-content view.highlighted:row-highlighted")
  },hashTypes:{'class': "STRING"},hashContexts:{'class': depth0},contexts:[],types:[],data:data})));
  data.buffer.push(">\n        <span class='cell-content-rank'>\n            ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent_rank", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n        </span>\n        ");
  stack1 = helpers._triageMustache.call(depth0, "view.cellContent", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    </span>\n</div>\n\n");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/server-header-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1, self=this, escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  var buffer = '', stack1;
  data.buffer.push("\n        ");
  stack1 = helpers['if'].call(depth0, "view.reversed", {hash:{},hashTypes:{},hashContexts:{},inverse:self.program(4, program4, data),fn:self.program(2, program2, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n    ");
  return buffer;
  }
function program2(depth0,data) {
  
  
  data.buffer.push("\n            <i class=\"fa fa-angle-up pull-right\" style=\"padding-top:.6em; padding-right:.6em; color: rgb(149, 149, 149);\"></i>\n        ");
  }

function program4(depth0,data) {
  
  
  data.buffer.push("\n            <i class=\"fa fa-angle-down pull-right\" style=\"padding-top:.6em; padding-right:.6em; color: rgb(149, 149, 149);\"></i>\n        ");
  }

  data.buffer.push("<div class=\"ember-table-content-container\" ");
  data.buffer.push(escapeExpression(helpers.action.call(depth0, "sortByColumn", "view.content", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0,depth0],types:["STRING","ID"],data:data})));
  data.buffer.push(">\n    ");
  stack1 = helpers['if'].call(depth0, "view.sortingOn", {hash:{},hashTypes:{},hashContexts:{},inverse:self.noop,fn:self.program(1, program1, data),contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  <span class=\"ember-table-content\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "view.content.headerCellName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n</div>");
  return buffer;
  
});

Ember.TEMPLATES["table_cells/time-series-header-cell"] = Ember.Handlebars.template(function anonymous(Handlebars,depth0,helpers,partials,data
/**/) {
this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Ember.Handlebars.helpers); data = data || {};
  var buffer = '', stack1;


  data.buffer.push("<div class=\"ember-table-content-container\" id=\"time-series-context\" data-toggle=\"context\" style=\"overflow:visible; cursor:context-menu;\">\n  <span class=\"ember-table-content\">\n    ");
  stack1 = helpers._triageMustache.call(depth0, "view.content.headerCellName", {hash:{},hashTypes:{},hashContexts:{},contexts:[depth0],types:["ID"],data:data});
  if(stack1 || stack1 === 0) { data.buffer.push(stack1); }
  data.buffer.push("\n  </span>\n</div>\n");
  return buffer;
  
});