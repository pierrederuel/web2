/**
 * angular-oauth2 - Angular OAuth2
 * @version v4.1.1
 * @link https://github.com/seegno/angular-oauth2
 * @license MIT
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "angular", "angular-cookies", "query-string" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("angular"), require("angular-cookies"), require("query-string"));
    } else {
        root.angularOAuth2 = factory(root.angular, "ngCookies", root.queryString);
    }
})(this, function(angular, ngCookies, queryString) {
    var ngModule = angular.module("angular-oauth2", [ ngCookies ]).config(oauthConfig).factory("oauthInterceptor", oauthInterceptor).provider("OAuth", OAuthProvider).provider("OAuthToken", OAuthTokenProvider);
    function oauthConfig($httpProvider) {
        $httpProvider.interceptors.push("oauthInterceptor");
    }
    oauthConfig.$inject = [ "$httpProvider" ];
    function oauthInterceptor($q, $rootScope, OAuthToken) {
        return {
            request: function request(config) {
                config.headers = config.headers || {};
                if (!config.headers.hasOwnProperty("Authorization") && OAuthToken.getAuthorizationHeader()) {
                    config.headers.Authorization = OAuthToken.getAuthorizationHeader();
                }
                return config;
            },
            responseError: function responseError(rejection) {
                if (!rejection) {
                    return $q.reject(rejection);
                }
                if (400 === rejection.status && rejection.data && ("invalid_request" === rejection.data.error || "invalid_grant" === rejection.data.error)) {
                    OAuthToken.removeToken();
                    $rootScope.$emit("oauth:error", rejection);
                }
                if (401 === rejection.status && rejection.data && "invalid_token" === rejection.data.error || rejection.headers && rejection.headers("www-authenticate") && 0 === rejection.headers("www-authenticate").indexOf("Bearer")) {
                    $rootScope.$emit("oauth:error", rejection);
                }
                return $q.reject(rejection);
            }
        };
    }
    oauthInterceptor.$inject = [ "$q", "$rootScope", "OAuthToken" ];
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    var defaults = {
        baseUrl: null,
        clientId: null,
        clientSecret: null,
        grantPath: "/oauth2/token",
        revokePath: "/oauth2/revoke"
    };
    var requiredKeys = [ "baseUrl", "clientId", "grantPath", "revokePath"];
    function OAuthProvider() {
        var _this = this;
        var sanitizeConfigParams = function sanitizeConfigParams(params) {
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            var config = angular.extend({}, defaults, params);
            angular.forEach(requiredKeys, function(key) {
                if (!config[key]) {
                    throw new Error("Missing parameter: " + key + ".");
                }
            });
            if ("/" === config.baseUrl.substr(-1)) {
                config.baseUrl = config.baseUrl.slice(0, -1);
            }
            if ("/" !== config.grantPath[0]) {
                config.grantPath = "/" + config.grantPath;
            }
            if ("/" !== config.revokePath[0]) {
                config.revokePath = "/" + config.revokePath;
            }
            return config;
        };
        var addCredentialsInHeader = function addCredentialsInHeader(config, options) {
            credentials = config.clientId + ":";
            if (null !== config.clientSecret) {
                credentials += config.clientSecret;
            }
            credentials = "Basic " + btoa(credentials);

            options = angular.extend({
                headers: {
                    Authorization: credentials,
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            }, options);

            return options;
        };
        var addCredentialsInBody = function addCredentialsInBody(config, data) {
            data = angular.extend({
                client_id: config.clientId
            }, data);
            if (null !== config.clientSecret) {
                data.client_secret = config.clientSecret;
            }

            return data;
        };
        this.configure = function(params) {
            _this.defaultConfig = sanitizeConfigParams(params);
        };
        this.$get = function($http, OAuthToken, $rootScope) {
            var OAuth = function() {
                function OAuth(config) {
                    _classCallCheck(this, OAuth);
                    this.config = config;
                }
                _createClass(OAuth, [ {
                    key: "configure",
                    value: function configure(params) {
                        this.config = sanitizeConfigParams(params);
                    }
                }, {
                    key: "isAuthenticated",
                    value: function isAuthenticated() {
                        return !!OAuthToken.getToken();
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken(data, options) {
                        if ("header" === this.config.clientCredentials) {
                            options = addCredentialsInHeader(this.config, options);
                        } else {
                            data = addCredentialsInBody(this.config, data);
                            options = angular.extend({
                                headers: {
                                    Authorization: undefined,
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                        }

                        data = angular.extend({
                            grant_type: "password"
                        }, data);
                        data = queryString.stringify(data);
                        return $http.post("" + this.config.baseUrl + this.config.grantPath, data, options).then(function(response) {
                            OAuthToken.setToken(response.data);
                            $rootScope.$emit("oauth:success");
                            return response;
                        });
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken(data, options) {
                        if ("header" === this.config.clientCredentials) {
                            options = addCredentialsInHeader(this.config, options);
                        } else {
                            data = addCredentialsInBody(this.config, data);
                            options = angular.extend({
                                headers: {
                                    Authorization: undefined,
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                        }

                        data = angular.extend({
                            grant_type: "refresh_token",
                            refresh_token: OAuthToken.getRefreshToken()
                        }, data);
                        data = queryString.stringify(data);
                        return $http.post("" + this.config.baseUrl + this.config.grantPath, data, options).then(function(response) {
                            OAuthToken.setToken(response.data);
                            return response;
                        });
                    }
                }, {
                    key: "revokeToken",
                    value: function revokeToken(data, options) {
                        if ("header" === this.config.clientCredentials) {
                            options = addCredentialsInHeader(this.config, options);
                        } else {
                            data = addCredentialsInBody(this.config, data);
                            options = angular.extend({
                                headers: {
                                    Authorization: undefined,
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                        }

                        var refreshToken = OAuthToken.getRefreshToken();
                        data = angular.extend({
                            token: refreshToken ? refreshToken : OAuthToken.getAccessToken(),
                            token_type_hint: refreshToken ? "refresh_token" : "access_token"
                        }, data);
                        data = queryString.stringify(data);
                        return $http.post("" + this.config.baseUrl + this.config.revokePath, data, options).then(function(response) {
                            OAuthToken.removeToken();
                            return response;
                        }).catch(console.error);
                    }
                } ]);
                return OAuth;
            }();
            return new OAuth(this.defaultConfig);
        };
        this.$get.$inject = [ "$http", "OAuthToken", "$rootScope" ];
    }
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    function OAuthTokenProvider() {
        var config = {
            name: "token",
            options: {
                secure: true
            }
        };
        this.configure = function(params) {
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            angular.extend(config, params);
            return config;
        };
        this.$get = function($cookies) {
            var OAuthToken = function() {
                function OAuthToken() {
                    _classCallCheck(this, OAuthToken);
                }
                _createClass(OAuthToken, [ {
                    key: "setToken",
                    value: function setToken(data) {
                        return $cookies.putObject(config.name, data, config.options);
                    }
                }, {
                    key: "getToken",
                    value: function getToken() {
                        return $cookies.getObject(config.name);
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken() {
                        var _ref = this.getToken() || {};
                        var access_token = _ref.access_token;
                        return access_token;
                    }
                }, {
                    key: "getAuthorizationHeader",
                    value: function getAuthorizationHeader() {
                        var tokenType = this.getTokenType();
                        var accessToken = this.getAccessToken();
                        if (!tokenType || !accessToken) {
                            return;
                        }
                        return tokenType.charAt(0).toUpperCase() + tokenType.substr(1) + " " + accessToken;
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken() {
                        var _ref2 = this.getToken() || {};
                        var refresh_token = _ref2.refresh_token;
                        return refresh_token;
                    }
                }, {
                    key: "getTokenType",
                    value: function getTokenType() {
                        var _ref3 = this.getToken() || {};
                        var token_type = _ref3.token_type;
                        return token_type;
                    }
                }, {
                    key: "removeToken",
                    value: function removeToken() {
                        return $cookies.remove(config.name, config.options);
                    }
                } ]);
                return OAuthToken;
            }();
            return new OAuthToken();
        };
        this.$get.$inject = [ "$cookies" ];
    }
    return ngModule;
});