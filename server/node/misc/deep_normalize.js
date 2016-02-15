var _ = require('underscore')._;

const BLACKLIST = ['loc'];

function is_object(x) { return _.isObject(x) & !_.isArray(x); }

function deepnrm_arr(a, b, deepkey) {
    if(is_object(a[0]) & is_object(b[0])) {
        var matched = _.map(a, function(a_obj) {
            var srch      = {};
            srch[deepkey] = a_obj[deepkey];
            var b_obj     = _.findWhere(b, srch);
            if(b_obj) {
                return deepnrm(a_obj, b_obj, deepkey);
            } else {
                return [{}, {}];
            }
        });
        return [_.pluck(matched, 0), _.pluck(matched, 1)];
    } else {
        console.log('unhandled :: a', a);
        console.log('unhandled :: b', b);
        return [a, b];
    }
}

// This can be slow on deeply nested objects
function deepnrm(a, b, deepkey) {
    if(is_object(a) & is_object(b)) {
		// get array of all shared keys
        shared_top = _.intersection(_.keys(a), _.keys(b));
		// get copy of object with only the values of shared_top
        a          = _.pick(a, shared_top);
        b          = _.pick(b, shared_top);
        /* go through each key in shared_top
			and recursively get deep nested objects */
        _.map(shared_top, function(k) {
            var tmp = deepnrm(a[k], b[k], deepkey);
            if(k != deepkey && !_.contains(BLACKLIST, k)) {
                a[k] = tmp[0];
                b[k] = tmp[1];
            }
        });
        
        return [a, b];
    } else if (_.isArray(a) & _.isArray(b)) {
		// if our objects are arrays
        return deepnrm_arr(a, b, deepkey);
    } else {
        if(_.isNumber(a) & _.isNumber(b)) {
			// if they are numbers and not objects
            if(b !== 0) {
                return [a / b, b];
            } else {
                return [0, b];
            }
        } else {
            return [a, b];
        }
    }
}

module.exports = function(a, b, callback) {
    callback(deepnrm(a, b, 'key')[0]);
};
