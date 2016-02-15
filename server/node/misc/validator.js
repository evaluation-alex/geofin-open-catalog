var request = require('request'),
          _ = require('underscore')._;

const ES_REGEX = /[A-Za-z0-9_\\.]*:[^):]+( |\))/g;

var do_parse = function(body) {
    
    if(body.explanations) {
        body.fields = _.chain(body.explanations).map(function(exp) {
            return exp.explanation.match(ES_REGEX)
        }).flatten().uniq().groupBy(function(x) { return x.split(':')[0] }).map(function(val, key) {
            return {
                "field" : key,
                "val"   : _.map(val, function(x) {return x.split(':')[1].replace(/.$/g, '').replace(/\"/g, "'")}).join(' ')
            }
        }).value()

    } else {
        body.fields = [];
    }
    
    return body;
}

module.exports = function(config, app) {

    var validate = function(params, cb) {

        if(!params.body) {
            cb({
                "valid" : true,
                "empty" : true
            });
        }

        var endpoint = config['ELASTICSEARCH']['IP'] + '/' + config['ELASTICSEARCH']['INDEX']['DATA'] + '/_validate/query';
        endpoint     = params.explain ? endpoint += '?explain' : endpoint;

        request.post({
            "url"  : endpoint,
            "json" : params.body
        }, function(err, resp, body) {
            cb(do_parse(body));
        });
    }

    if(app) {
        app.post('/validate', function(req, res) {
            console.log('tryng to validate')
            validate({'body' : req.body, 'explain' : false}, function(body) {
                res.send({'valid' : body.valid});
            });
        });
    }
    
    return validate;
}
