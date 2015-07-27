angular.module('parseAngularSocial', ['satellizer', 'ngMaterial'])
    .constant('CONFIG', {
        linkedIn_clientId: '77v8g243i0dmsw',
        linkedIn_redirectUri: 'http://alpani.parseapp.com/',
        googlePlus_clietId: '119341817833-f8nbtep6r70dmb7sq3fpcs6r07ahclrp.apps.googleusercontent.com',
        googlePlus_redirectUri: 'http://alpani.parseapp.com/',
    })
    .config(['$authProvider', function($authProvider, CONFIG) {

        // LinkedIn 
        $authProvider.linkedin({
            clientId: CONFIG.linkedIn_clientId,
            url: '/auth/linkedin',
            authorizationEndpoint: 'https://www.linkedin.com/uas/oauth2/authorization',
            redirectUri: CONFIG.linkedIn_redirectUri,
            requiredUrlParams: ['state'],
            scope: [],
            scopeDelimiter: ' ',
            state: 'STATE',
            type: '2.0',
            popupOptions: {
                width: 527,
                height: 582
            }
        });

        // Google plus
        $authProvider.google({
            clientId: CONFIG.googlePlus_clietId,
            url: '/auth/google',
            authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
            redirectUri: CONFIG.googlePlus_redirectUri,
            scope: ['profile', 'email'],
            scopePrefix: 'openid',
            scopeDelimiter: ' ',
            requiredUrlParams: ['scope'],
            optionalUrlParams: ['display'],
            display: 'popup',
            type: '2.0',
            popupOptions: {
                width: 580,
                height: 400
            }
        });
    }])
    .run([function() {

        var
            PARSE_APPLICATION_ID = 'YOUR_PARSE_APPLICATION_ID',
            PARSE_JAVASCRIPT_KEY = 'PARSE_JAVASCRIPT_KEY',
            FACEBOOK_APP_ID = 'YOUR_FACEBOOK_APP_ID';

        Parse.initialize(PARSE_APPLICATION_ID, PARSE_JAVASCRIPT_KEY);

        window.fbAsyncInit = function() {
            Parse.FacebookUtils.init({
                appId: FACEBOOK_APP_ID,
                status: true,
                cookie: true,
                xfbml: true,
                version: 'v2.4'
            });
        };

        (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    }])
    .directive('facebookLogin', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<md-button class="md-primary md-raised md-button" ng-click="authenticate()">Facebook</md-button>',
            link: function($scope, element, attrs) {},
            controller: ['$scope', '$auth', function($scope, $auth) {
                $scope.authenticate = function() {
                    Parse.FacebookUtils.logIn(null, {
                        success: function(user) {
                            console.log(user);
                        },
                        error: function(user, error) {
                            console.log("User cancelled the Facebook login or did not fully authorize.");
                        }
                    });

                };
            }]
        }
    })
    .directive('googleLogin', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<md-button class="md-primary md-raised md-button" ng-click="authenticate()">Google +</md-button>',
            link: function($scope, element, attrs) {},
            controller: ['$scope', '$auth', function($scope, $auth) {
                $scope.authenticate = function() {
                    $auth.authenticate('google')
                        .then(function(result) {
                            Parse.User.become(result.data.token, {}).then(function(user) {
                                console.log(user);
                            }, function(err) {
                                console.log(err);
                            });
                        });

                };
            }]
        }
    })
    .directive('linkedinLogin', function() {
        return {
            restrict: 'E',
            transclude: true,
            template: '<md-button class="md-primary md-raised md-button" ng-click="authenticate()">LinkedIn</md-button>',
            link: function($scope, element, attrs) {},
            controller: ['$scope', '$auth', function($scope, $auth) {
                $scope.authenticate = function(provider) {
                    $auth.authenticate('linkedin')
                        .then(function(result) {
                            Parse.User.become(result.data.token, {}).then(function(user) {
                                console.log(user);
                            }, function(err) {
                                console.log(err);
                            });
                        });
                };
            }]
        }
    })
