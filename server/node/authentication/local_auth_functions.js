module.exports = function(passport, config, make_token) {
//    var bcrypt  = require('bcryptjs');
             var Q = require('q'),
                 _ = require('underscore')._,
                es = require('elasticsearch'),
            crypto = require('crypto'),
     LocalStrategy = require('passport-local');

    var client = new es.Client({hosts : [config.ELASTICSEARCH.IP]});

    function findUser(username, client, callback) {
        if(config.DEMO_FLAG) {
            var db = [
              {"username" : "dev", "password" : "password", "id" : "001", "isAdmin" : true},
              {"username" : "ben", "password" : "password", "id" : "002", "isAdmin" : false}
            ]
            var user = _.findWhere(db, {"username" : username});
            callback(user, null);
        } else {
            client.search({
                index : config.ELASTICSEARCH.INDEX.AUTH,
                body  : {"query" : {"match" : {"username" : username}}}
            }).then(function(response) {
                var user =  _.chain(response.hits.hits)
                             .pluck('_source')
                             .findWhere({"username" : username})
                             .value();
                    
                if(user && !user.isAdmin) { user.isAdmin = false; } // Temporary hack -- should really check this against the admin group

                callback(user, null);
            }, function(error) {
                callback(null, error);
            });
        }
    }

    function validate_credentials(username, password) {
        var ITER_INDEX = 0;
        var SALT_INDEX = 1;
        var HASH_INDEX = 2;
        var SPLIT_CHAR = ':';
        var ENCODING   = 'hex';
        
        var deferred = Q.defer();

        findUser(username, client, function(user, err) {
            if(err) { deferred.reject(err) }
            if(user != undefined) {
                if(config.DEMO_FLAG){
                    if(user.password == password) {
                        deferred.resolve(user);
                    } else {
                        deferred.resolve(undefined);
                    }
                } else {
                    var p = user.hashedpassword.split(SPLIT_CHAR);
                    var b = new Buffer(p[SALT_INDEX], ENCODING)
                    crypto.pbkdf2(password, b, parseInt(p[ITER_INDEX], 10), b.length, function(err, derived_key) {
                        if(p[HASH_INDEX] == derived_key.toString(ENCODING)) {
                            deferred.resolve(user);
                        } else {
                            deferred.resolve(false);
                        }
                    });
                }
            } else {
                deferred.resolve(false);
            };
        });
        
        return deferred.promise;
    }


    return {
        set_strategy : function() {
            passport.use('local-signin', new LocalStrategy({passReqToCallback : true},
                function(req, username, password, done) {
                    validate_credentials(username, password)
                                 .then(function (user) { done(null, user); })
                                 .fail(function (err)  { console.log(err); done(err, null);});
                }
            ));
        },
        authenticate : function(req, res, next) {
            passport.authenticate('local-signin', function(err, user) {
                if (err) { return next(err); }
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

////used in local-signup strategy
//exports.localReg = function (username, password) {
//	var deferred = Q.defer();
//	var hash = bcrypt.hashSync(password, 8);
//	var user = {
//		"username" : username,
//		"password" : hash
//	}
//	var match = _.findWhere(db, {"username" : username});
//	if(match != undefined) {
//		deferred.resolve(false);
//	} else {
//		db.push(user)
//		deferred.resolve(user);
//	};
//
//	return deferred.promise;
//};
