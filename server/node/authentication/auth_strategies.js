module.exports = function(passport, make_token, config) {
    return {
        local  : require('./local_auth_functions')(passport, config, make_token),
        ldap   : require('./ldap_auth_functions')(passport, config, make_token),
        gated  : require('./gated_auth_functions')(passport, config, make_token),
    }
}