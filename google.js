var config = require('./config.js').google;
module.exports = function(req, res) {
    var googlePlusClientId = config.clientId;
    var googlePlusClientSecret = config.clientSecret;
    var googlePlusValidateEndpoint = 'https://accounts.google.com/o/oauth2/token';
    var googlePlusUserEndpoint = 'https://www.googleapis.com/oauth2/v1/userinfo';
    var googlePlusRedirectUri = 'http://alpani.parseapp.com/';
    var getGooglePlusAccessToken = function(code) {
        var body = {
            "code": code,
            "client_id": googlePlusClientId,
            "client_secret": googlePlusClientSecret,
            "redirect_uri": googlePlusRedirectUri,
            "grant_type": 'authorization_code'
        };
        return Parse.Cloud.httpRequest({
            method: 'POST',
            url: googlePlusValidateEndpoint,
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Parse.com Cloud Code'
            },
            body: body,
            json: true
        });
    };
    var getGooglePlusUserDetails = function(accessToken) {
        return Parse.Cloud.httpRequest({
            method: 'GET',
            url: googlePlusUserEndpoint,
            params: {
                'access_token': accessToken,
                'alt': 'json'
            },
            json: true
        });
    };
    var data = req.body;
    var token;

    Parse.Cloud.useMasterKey();
    Parse.Promise.as().then(function() {
        return getGooglePlusAccessToken(data.code);
    }).then(function(access) {
        var googlePlusData = access.data;
        if (googlePlusData && googlePlusData.access_token) {
            token = googlePlusData.access_token;
            return getGooglePlusUserDetails(token);
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

                var userLogin = userData.email;
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
                        'token': value.getSessionToken(),
                    });
                };
            };

            checkAndRegUser(userData);

        } else {
            return Parse.Promise.error("Unable to parse GitHub data");
        }
    });
};
