
// -----------------------------------------------------------------
// Loading
var cluster = require('cluster'),
    chalk   = require('chalk');

var config  = require('./config');

function geofin_server() {

    // Dependencies
    var config  = require('./config'),
            es  = require('elasticsearch'),
		 https  = require('https'),
            fs  = require('fs'),
        express = require('express'),
            app = express(),
    compression = require('compression'),
         helmet = require('helmet');

    app.use(helmet());
    app.use(compression());
    app.use(require('body-parser').json());
    
    // <headers>
    app.all('*', function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-Access-Token, Content-Type');
        res.header('Access-Control-Allow-Methods', 'POST, GET, DELETE');
        res.header('X-Content-Type-Options', 'nosniff');
        next();
    });
    
    // Error handling middleware (maybe)
    app.use(function(err, req, res, next){
        console.log('>>>>>>>>>> err stack', err.stack);
        res.status(500).send({"error" : err.stack, 'something' : 'test'});
    });
    // </headers>
    
    // <non-authenticated>
    app.use('/', express.static(config.FILEPATHS.CLIENT));       // Static content
	require('./map-server.js')(app, config.FILEPATHS.MAP_TILES); // Map tiles

    // Authentication
    app.set('jwtTokenSecret', config.AUTHENTICATION.TOKEN_SECRET);
    require('./authentication/auth.js')(app, config);

    // Load shapefiles
    var world_borders, state_borders, borders;
    if(config.SHAPEFILE_TYPE == 'json') {
        world_borders = require('../data/json/world_borders.json');
        state_borders = require('../data/json/us_borders.json');
        borders       = {"world" : world_borders.features, "state" : state_borders.features};
    } else if(config.SHAPEFILE_TYPE == 'topojson'){
        world_borders = require('../data/topojson/world_borders.topojson');
        state_borders = require('../data/topojson/us_borders.topojson');
        borders       = {"world" : world_borders, "state" : state_borders};
    }
    
    // Setup routes
    var client = new es.Client({hosts : [config.ELASTICSEARCH.IP], requestTimeout : 60000});

    require('./misc/validator')(config, app);
    require('./routes')(app, client, config, borders);
    
    // Logging
    if(config.LOGGING.ENABLED) {
        app.use(require('./logging/logging-worker.js')(app, config));
    }
    
    // Start server
    if(config.HTTPS.ENABLED) {
	    var privateKey  = fs.readFileSync(config.HTTPS.CERTIFICATES.PEM, 'utf8'),
	        certificate = fs.readFileSync(config.HTTPS.CERTIFICATES.CRT, 'utf8'),
	        credentials = {key: privateKey, cert: certificate};
        
	    https.createServer(credentials, app).listen(config.NODE_PORT);
    } else {
        app.listen(config.NODE_PORT, config.LISTEN_ADDRESS);
    }
    console.log(
        'Geofin | protocol = %s | port = %s',
        chalk.blue(config.HTTPS.ENABLED ? 'https' : 'http'),
        chalk.blue(config.NODE_PORT)
    );
}

function geofin_master() {
    function make_worker() {
        var worker = cluster.fork();
    }
    
    var cpuCount = Math.ceil(require('os').cpus().length * config.PCT_CORES) || 1;
    for (var i = 0; i < cpuCount; i += 1) { make_worker(); }
    
    cluster.on('exit', function (worker)  { make_worker(); });
}

cluster.isMaster ? geofin_master() : geofin_server();

