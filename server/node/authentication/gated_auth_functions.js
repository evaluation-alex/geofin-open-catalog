/*

    Assuming that we're determining the user by parsing a plain-text user information string,
    you can modify the specifics by 
    
        a) changing the name of the field in $PROJECT_HOME/config/master_config.json
            (property config.AUTHENTICATION.GATED_OPTS.name)
        
        b) changing the parseUserInfo function in this file to grab the
            username + id from the new token format

*/

module.exports = function(passport, config, make_token) {
    
    var _         = require('underscore')._,
    LocalStrategy = require('passport-local');

    function parseUserInfo(token, location) {
        console.log(token);
        return {
            "username" : token.split('.')[0],
            "id"       : token.split('.')[0],
            "isAdmin"  : false
        }
    }

    function findUser(req, cb) {
        var opts = config['AUTHENTICATION']['GATED_OPTS'];
        
        if(req[opts.location][opts.name]) {
            cb(null, parseUserInfo(req[opts.location][opts.name], opts.location))
        } else {
            cb('No Information from Gate', null)
        }
    }

    return {
        set_strategy : function() {
            passport.use('gated-signin', new LocalStrategy({passReqToCallback : true},
                function(req, username, password, done) {
                    findUser(req, function(err, user) {
                        if(err) {
                            done(err, null);
                        } else {
                            done(null, user);
                        }
                    });
                }
            ));
        },
        authenticate : function(req, res, next) {
            // Apparently, passport.authenticate needs username and password
            req.body = {"username" : "---", "password" : "---"};
            
            passport.authenticate('gated-signin', function(err, user) {
                if (err) { console.log('err', err); return next(err); }
                if (user) {
                
                    res.send({
                        token : make_token({
                            "username" : user.username,
                            "user_id"  : user.id,
                            "ip"       : req.connection.remoteAddress,
                            "isAdmin"  : user.isAdmin
                        }),
                        isAdmin  : user.isAdmin,
                        username : user.username
                    });
                } else {
                    res.status(404).send('Incorrect username or password!');
                }
            })(req, res, next);
        }
    }

}
