
# Geofin (v2.2.2)
### Last Edited January 2016

# Quick Start

Configuration
    
    cd $PROJECT_ROOT/config

    # Edit as necessary.  Inline documentation is included in file.
    vi master_config.json

    # Required even if you didn't edit master_config.json
    node configure.js 

Start server
    
    cd $PROJECT_ROOT/server/node/
    node server.js
    
View App
    
    # Navigate to http://localhost:<config.NODE_PORT>

# Installation
## Dependencies
                        
     - Elasticsearch v1.6.0
       - Plugins:
            elasticsearch-lang-javascript 2.6.0 
            marvel 1.3.1

     - Nodejs 0.12.2
         Modules:
             (see $PROJECT_ROOT/server/node/package.json)            
                  
     - Python 2.7
        Libraries:
            elasticsearch==1.6.0
            funcy==1.5

## Configuring

#### Geofin

    cd $PROJECT_ROOT/config
        
    vi master_config.json
    # ^^ Edit as necessary.  Inline documentation is included in file.
    
    node configure.js 
    # ^^ Required even if you didn't edit master_config.json

#### Elasticsearch

Modify `elasticsearch.yml` as follows:

    script.disable_dynamic: false

## Including Data Files

    # Database of geonames
    mv $PROJECT_ROOT/geofin-extras/data/geonames.json \
       $PROJECT_ROOT/loading_scripts/data/
    
    # Map tiles
    mv $PROJECT_ROOT/geofin-extras/data/map-tiles \
       $PROJECT_ROOT/server/data/

## Inital Geocoding

    cd $PROJECT_ROOT/loading_scripts
    ./parse-geonames.sh 
    ./fast-geocode.sh

## Incremental Geocoding

After new records have been added to `config.ELASTICSEARCH.INDEX.DATA`:
     
    cd $PROJECT_ROOT/loading_scripts
    ./fast-geocode.sh


## Additional Notes

- A simple project map can be found in `$PROJECT_ROOT/project_map.txt`

 - If you're doing an offline install, you may be able to install R/Python/Node by going to 

         $PROJECT_ROOT/support/tools

and following `Step 2` of the `downloading_dependencies.sh` file.  This assumes you have `R/Python/Pip/Node/NPM` installed, but it mitigates the pain of manually tracking down packages.

 - Information about modifying cookie/header authentication is included in 
    
        $PROJECT_ROOT/server/node/authentication/gated_auth_functions.js

## Questions and Issues
Contact __Ben Johnson__ at __ben|at|gophronesis|dot|com__ with questions and issues.

Error messages for the browser can be seen by opening the __developer console__.
Error messages for the server can be seen by looking at the __Node.js console__.
