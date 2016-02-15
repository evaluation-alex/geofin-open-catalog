// Configuration file for strategic_map application
// TODO -- Make sure asyncrony isn't going to mess anything up here

// -----------------------------------
// Helper program for making sure that the configuration across 
// all of the files is the same


var fs = require('fs');

try {
        var jsmin = require('jsmin');
        var _     = require('underscore');
} catch(e) {
        var jsmin = require('../server/node/node_modules/jsmin');
        var _     = require('../server/node/node_modules/underscore');
}


function do_parse(x) {
    return JSON.parse(jsmin.jsmin(x))
}

function combine(x, g) {
	for(k in g)
		x[k] = g[k]	
	return x
}

function make_server_config(master, developer, cb) {
    console.log('making server config');
    
    master = JSON.parse(JSON.stringify(master));
    
    if(master.DEMO_FLAG) {
        _.map(developer['DEMO_SETTINGS'], function(v, k) {
            developer[k] = v;
        })
    }

    var out = combine(master, developer);
    out["FILEPATHS"]["CLIENT"]    = __dirname + "/" + out["FILEPATHS"]["CLIENT"];
    out["FILEPATHS"]["MSH"]       = __dirname + "/" + out["FILEPATHS"]["MSH"];
    out["FILEPATHS"]["MAP_TILES"] = __dirname + "/" + out["FILEPATHS"]["MAP_TILES"];
    
    cb(out)
}

function make_client_config(master, developer, cb) {
    console.log('making client config');
    
    // Duplicate config object, then remove potential security problems
    master = JSON.parse(JSON.stringify(master));
    master.ELASTICSEARCH               = null;
    master.AUTHENTICATION.CERTIFICATES = null;
    master.AUTHENTICATION.LDAP_OPTS    = null;
    master.AUTHENTICATION.COOKIE_OPTS  = null;
    master.AUTHENTICATION.HEADER_OPTS  = null;
    master.FILEPATHS                   = null;
    
    if(master.DEMO_FLAG) {
        _.map(developer['DEMO_SETTINGS'], function(v, k) {
            developer[k] = v;
        })
    }

    // Hack to make online maps display correctly
    if(master.TILE_IP === "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png") {
        developer.LEAFLET_CONFIG.tms = false;
    }

    if(master.TILE_IP === "-tiles/{z}/{x}/{y}.png") {
        developer.LEAFLET_CONFIG.tms = false;
    }


    cb(combine(master, developer))
}

function make_loading_config(master, developer, cb) {
    console.log('making loading config');
    
    master = JSON.parse(JSON.stringify(master));

    master["hostname"] = master["ELASTICSEARCH"]["IP"].split(/:|\//)[3]
    master["hostport"] = master["ELASTICSEARCH"]["IP"].split(/:|\//)[4]
        
    cb(combine(master, developer));
}

// Point to various configuration files in the /config directory
var config_paths = {
    "master"  : "master_config.json", 
    "server"  : "server_developer_config.json",
    "client"  : "client_developer_config.json",
    "loading" : "loading_developer_config.json"
}

// ---
// Read master config
master = do_parse(fs.readFileSync(config_paths.master, "utf8"));

// ---
// Setup client config
developer_client = do_parse(fs.readFileSync(config_paths.client, "utf8"));
make_client_config(master, developer_client, function(config) {
    fs.writeFileSync(master.FILEPATHS.CLIENT + "config.js", "var config = " + JSON.stringify(config, null, ' '));    
});

// ---
// Setup server config
developer_server = do_parse(fs.readFileSync(config_paths.server, "utf8"));
make_server_config(master, developer_server, function(config) {
    fs.writeFileSync(master.FILEPATHS.NODE + "config.json", JSON.stringify(config, null, ' '));
});

// -- 
// Setup loading config
developer_loading = do_parse(fs.readFileSync(config_paths.loading, "utf8"));
make_loading_config(master, developer_loading, function(config) {
    fs.writeFileSync(master.FILEPATHS.LOADING + "config.json", JSON.stringify(config, null, ' '));    
});


