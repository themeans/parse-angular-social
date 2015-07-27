var config = require('./config.js').linkedin;
module.exports = function(req, res) {
    var linkedinClientId = config.clientId;
    var linkedinClientSecret = config.clientSecret;
    var linkedinValidateEndpoint = 'https://www.linkedin.com/uas/oauth2/accessToken';
    var linkedinUserEndpoint = 'https://api.linkedin.com/v1/people/~:(id,first-name,last-name,email-address,picture-url)';
    var lindedinRedirectUri = 'http://alpani.parseapp.com/';

    var getLinkedinAccessToken = function(code) {
        var body = {
            'code': code,
            'client_id': linkedinClientId,
            'client_secret': linkedinClientSecret,
            'redirect_uri': lindedinRedirectUri,
            'grant_type': 'authorization_code'
        };
        return Parse.Cloud.httpRequest({
            method: 'POST',
            url: linkedinValidateEndpoint,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Parse.com Cloud Code'
            },
            body: body,
            json: true
        });
    };

    var getLinkedinUserDetails = function(accessToken) {
        return Parse.Cloud.httpRequest({
            method: 'GET',
            url: linkedinUserEndpoint,
            params: {
                oauth2_access_token: accessToken,
                format: 'json'
            },
            json: true
        });
    };
    var data = req.body;
    var token;

    Parse.Cloud.useMasterKey();
    Parse.Promise.as().then(function() {
        return getLinkedinAccessToken(data.code);
    }).then(function(access) {
        var linkedinData = access.data;
        if (linkedinData && linkedinData.access_token) {
            token = linkedinData.access_token;
            return getLinkedinUserDetails(token);
        } else {
            return Parse.Promise.error("Invalid access request.");
        }
    }).then(function(userDataResponse) {
        /**
         * Process the users GitHub details, return either the upsertGitHubUser
         *   promise, or reject the promise.
         */
        var userData = userDataResponse.data;
        if (data && userData.id) {

            function checkAndRegUser(userData) {
                var userLogin = userData.emailAddress;
                var userPassword = require("cloud/md5.js").md5(userData.id + 'secretKey');

                var query = new Parse.Query(Parse.User);
                query.equalTo("username", userLogin);
                query.find({
                    success: function(result) {
                        if (result.length) {
                            var user = result[0];
                            updateUser(user);
                        } else {
                            signUp();
                        }
                    }
                });

                function updateUser(user) {

                    user.set("password", userPassword);

                    user.save(null, {
                        success: function(user) {
                            Parse.User.logIn(user.get('username'), userPassword, {
                                success: function(user) {
                                    onSuccessLogin(user)
                                },
                                error: function(user, error) {
                                    res.error("Unable to log in: " + error.code + " " + error.message);
                                }
                            });

                        },
                        error: function(user, error) {
                            res.error("Error save: " + error.code + " " + error.message);
                        }
                    });
                };

                function signUp() {
                    var user = new Parse.User();
                    user.set("username", userLogin);
                    user.set("password", userPassword);

                    user.signUp(null, {
                        success: function(user) {
                            onSuccessLogin(user);
                        },
                        error: function(user, error) {
                            res.error("Error sign up: " + error.code + " " + error.message);
                        }
                    });
                };

                function onSuccessLogin(value) {

                    res.send({
                        'username': userLogin,
                        'password': userPassword,
                        'token': value.getSessionToken()
                    });
                };
            };

            checkAndRegUser(userData);

        } else {
            return Parse.Promise.error("Unable to parse GitHub data");
        }
    });
};
