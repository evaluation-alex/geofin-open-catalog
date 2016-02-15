var LdapStrategy = require('passport-ldapauth');

module.exports = function(passport, config, make_token) {
    return {
        set_strategy : function() {
            passport.use(new LdapStrategy(config.AUTHENTICATION.LDAP_OPTS));
        },
        authenticate : function (req, res, next) {
            passport.authenticate('ldapauth', {session : false}, function(err, user) {
                if (err) { console.log('err', err); return next(err); }
                if (user) {
                    res.send({
                        token : make_token({
                            "username" : user.uid,
                            "user_id"  : user.uid,
                            "ip"       : req.connection.remoteAddress,
                            "isAdmin"  : false
                        }),
                        isAdmin  : false,
                        username : user.uid
                    });
                } else {
                    res.status(404).send('Incorrect username or password!');
                }
            })(req, res, next);
        }
    }
}