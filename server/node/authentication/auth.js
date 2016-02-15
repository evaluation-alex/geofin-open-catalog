
module.exports = function(app, config) {
    // ***
    // Setup
    var passport       = require('passport'),
        morgan         = require('morgan'),
        cookieParser   = require('cookie-parser'),
        methodOverride = require('method-override'),
        session        = require('express-session'),
        jwt            = require('jwt-simple'),
        moment         = require('moment'),
        _              = require('underscore')._;

    app.use(cookieParser());
    app.use(methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
      console.log("serializing " + user.username);
      done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
      console.log("deserializing " + obj);
      done(null, obj);
    });
    
    // ***
    // Logging in
    function make_token(params) {
        var timeout_date = moment().add(config.TIMEOUT_AMOUNT, config.TIMEOUT_UNITS).valueOf();
        
        // <>
        // If using `gated` authentication, we set the timeout date to very far away
        if(config.AUTHENTICATION.STRATEGY === 'gated') {
            timeout_date = moment().add(999, 'days').valueOf();
        }
        // <>
        
        return jwt.encode({

            iss      : params.username,
            ip       : params.ip,
            user_id  : params.user_id,
            isAdmin  : params.isAdmin,
            
            exp      : timeout_date,

        }, app.get('jwtTokenSecret'));
    }
    // Set authentication strategy (either `ldap` or `local`)
    var auth_strategies = require('./auth_strategies')(passport, make_token, config);
    auth_strategies[config.AUTHENTICATION.STRATEGY].set_strategy();
    app.post('/login', function(req, res, next) {
        console.log('trying to login');
        auth_strategies[config.AUTHENTICATION.STRATEGY].authenticate(req, res, next);
    });

    // ***
    // Verifying that user is logged in
    function check_token(req, res, next) {
      req.user    = undefined;
      req.user_id = undefined;
      req.isAdmin = undefined;

      var token = (req.body && req.body.access_token) || (req.query && req.query.access_token) || req.headers['x-access-token'];

      if (token) {
      
        try {
          var decoded = jwt.decode(token, app.get('jwtTokenSecret'));

          if (decoded.exp <= Date.now()) {
            console.log(new Date(decoded.exp), '-- token expires')
            console.log('token has expired...')
            return next()
          } else if (decoded.ip != req.connection.remoteAddress) {
            console.log('ip address mismatch')
            return next()
          } else {

            req.user      = decoded.iss;
            req.user_id   = decoded.user_id;
            req.isAdmin   = decoded.isAdmin;

            if(Date.now() >= (decoded.exp - config.TIMEOUT_WARNING_WINDOW)) {
              console.log('>>> about to expire', (decoded.exp - Date.now()) / 1000, ' seconds');
              res.send({
                new_token : make_token({
                    "username" : req.user,
                    "ip"       : req.ip,
                    "user_id"  : req.user_id,
                    "isAdmin"  : req.isAdmin
                })
              });
            } else {
              return next()
            }
          }
        } catch (err) {
          console.log('errror decoding', err);
          return next()
        }
        
      } else {
        console.log('no token on header!')
        return next()
      }
    }

    function ensureAuthenticated(req, res, next) {
      if (req.isAuthenticated()) { return next(); }
      res.status(403).send('Not authenticated!');
    }

    function ensureAdmin(req, res, next) {
      if(req.isAdmin) { return next(); }
      res.status(401).send('Forbidden!');
    }
    
    app.delete('/login', function(req, res, next) {
      console.log('deleting --- this does not do anything');
      res.send({'acknowledged' : 'delete'});
    });

    app.get('/check_token', check_token, ensureAuthenticated, function(req, res, next) {
      res.send({'authenticated' : true});
    });
    
    app.get('/-check_gated', function(req, res) {
       res.writeHead(200, { 'Content-Type' : 'text/plain' });

       res.write('cookies :: ' + '\n' + JSON.stringify(req.cookies, true, 2));
       res.write('\n\n');
       res.write('headers :: ' + '\n' + JSON.stringify(req.headers, true, 2));
       
       res.send()
    });

    if(config.AUTHENTICATION.ENABLED) {
        app.get(/^\/[^-]/, check_token, ensureAuthenticated);
        app.post(/^\/[^-]/, check_token, ensureAuthenticated);

        var admin_required = ['/check_er', '/fetch_history', '/post_update'];
        _.map(admin_required, function(path) {
            app.post(path, ensureAdmin);
        });
    }
    
}

//    // Use the LocalStrategy within Passport to Register/"signup" users.
//    passport.use('local-signup', new LocalStrategy(
//      {passReqToCallback : true}, //allows us to pass back the request to the callback
//      function(req, username, password, done) {
//        funct.localReg(username, password)
//        .then(function (user) {
//          if (user) {
//            console.log("REGISTERED: " + user.username);
//            req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
//            done(null, user);
//          }
//          if (!user) {
//            console.log("COULD NOT REGISTER");
//            req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
//            done(null, user);
//          }
//        })
//        .fail(function (err){
//          console.log('failed with', err.body);
//        });
//      }
//    ));
