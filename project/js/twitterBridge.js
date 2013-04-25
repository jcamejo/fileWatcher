/*
$Id: twitterBridge.js 263 2013-04-18 22:21:03Z jcamejo $
*/
'use strict';

Date.prototype.toYMDString = Date.prototype.toYMDString || function () {
   var yyyy = this.getFullYear().toString(), mm = (this.getMonth() + 1).toString(), dd = this.getDate().toString();
   return yyyy + '-' + (mm[1] ? mm : '0' + mm[0]) + '-' + (dd[1] ? dd : '0' + dd[0]);
};

String.prototype.linkURLs = String.prototype.linkURLs || function () {
    return this.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&;\?\/.=]+/g, function (url) {
        return url.link(url);
    });
};


/*
    Docs portal: https://dev.twitter.com/docs
    Embedded timelines: https://dev.twitter.com/docs/embedded-timelines
    Embedded tweets: https://dev.twitter.com/docs/embedded-tweets
    REST API v1.1: https://dev.twitter.com/docs/api/1.1
    REST API v1 (deprecated): https://dev.twitter.com/docs/api/1
    oAUTH JavaScript libraries: https://github.com/bytespider/jsOAuth & https://github.com/spazproject/spazcore
    Twitter API, OAuth Authentication, and Zend_Oauth Tutorial: http://www.joeyrivera.com/2010/twitter-api-oauth-authentication-and-zend_oauth-tutorial/
*/
var twitterBridge = {
    args: {},
    loginURL: '//api.twitter.com/oauth/authorize?',
    searchURL: '//search.twitter.com/search.json',
    favouritesURL: '//api.twitter.com/1/favorites.json',
    verifyCredentialsURL:'',
    count: 15,
    geocode: '',
    lang: '',
    resultsNodeId: 'twitter-results',
    resultsNode: null,
    protocol: '',
    errorTimeout: 10000,
    tweets: [],
    totalColors: 0,
    colorIndex: 0,
    colorsArray: ['#e26e20', '#e147bc','#3ea6db', '#5b339f', '#22c33c'],
    settings:{
        consumerKey: '',
        consumerSecret: '',
        callbackUrl:''
    },
    OAuth: null,
    localStorageKey:'',

    init: function (args) {
        if (typeof args !== 'undefined') {
            this.args = args;
        }
        
        this.count = parseInt(this.args.resultsPerPage) || this.count;
        this.geocode = this.args.geocode || this.geocode;
        this.lang = this.args.lang || this.lang;
        this.resultsNodeId = this.args.resultsNodeId || this.resultsNodeId;
       /* this.resultsNode = document.getElementById(this.resultsNodeId);
        if (!this.resultsNode) {
            throw new Error('Unexistent results node Id "' + this.resultsNodeId + '", cannot continue.');
        }*/
        this.protocol = (window.top.location.protocol === 'https:') ? window.top.location.protocol : 'http:';
        this.settings.consumerSecret = this.args.consumerSecret || '';
        this.settings.consumerKey = this.args.consumerKey || '';
        this.settings.callbackUrl = this.args.callbackUrl || '';
        this.localStorageKey = 'twitterKey';

    },
    
    
    clearResults: function () {
        this.tweets.length = 0; 
    },
    
    /*
    Authentication (OAuth):
        https://dev.twitter.com/docs/auth/using-oauth
        https://dev.twitter.com/docs/auth/authorizing-request
    */
    tweet: function (successCb, errorCb) {
        var theTweet = $("#tweet").val(); // Change this out for what ever you want!
        this.OAuth.post('https://api.twitter.com/1/statuses/update.json',
            { 'status' : theTweet,
              'trim_user' : 'true' },
            successCb,
            errorCb
        );
    },
    login: function (cb) {
        
        var storedAccessData, rawData = localStorage.getItem(this.localStorageKey), requestParams;
        var that = this;

        if (localStorage.getItem(this.localStorageKey) !== null) {
            
            storedAccessData = JSON.parse(rawData || 'null'); 
            this.settings.accessTokenKey = storedAccessData.accessTokenKey; 
            this.settings.accessTokenSecret = storedAccessData.accessTokenSecret; 

            this.OAuth = OAuth(this.settings);

            this.OAuth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                function(data) {
                    var entry = JSON.parse(data.text || 'null');

                    if(entry !== null) { 
                        document.getElementById("twitterUser").textContent = entry.screen_name;
                        $("#tweetArea").removeClass("hidden");
                    } else { 
                        console.log("Sin Conexion twitter");
                    }
                },
                function(data) { 
                    console.log("failure");
                }
            );
        } else {
            this.OAuth = OAuth(this.settings);
            
            this.OAuth.get('https://api.twitter.com/oauth/request_token',
                $.proxy( function(data) {
                    requestParams = data.text;
                    console.log("data.text " + data.text);
                    application.clientBrowser.showWebPage('https://api.twitter.com/oauth/authenticate?'+ requestParams);
                    application.clientBrowser.onLocationChange = function(loc) { that.checkTwitterUrl(loc, cb, requestParams); }
                },this),
                function(data) { 
                    $("#tweetArea").addClass("hidden");
                }
            );
        }

    },

    checkTwitterUrl: function (loc, cb, requestParams) {
        console.log("checkTwitterUrl");
        if (loc.indexOf(this.settings.callbackUrl) >= 0) {

            // Parse the returned URL
            var index, verifier = '';
            var params = loc.substr(loc.indexOf('?') + 1);
            
            params = params.split('&');
            for (var i = 0; i < params.length; i++) {
                var y = params[i].split('=');
                if(y[0] === 'oauth_verifier') {
                    verifier = y[1];
                }
            }
            // Exchange request token for access token

            /*
            Once a user has given us permissions we need to exchange that request token for an access token
            we will populate our localStorage here.
            */
            this.OAuth.get('https://api.twitter.com/oauth/access_token?oauth_verifier='+verifier+'&'+requestParams,
                $.proxy(function(data) {
                    var accessParams = {};
                    var qvars_tmp = data.text.split('&');
                    for (var i = 0; i < qvars_tmp.length; i++) {
                        var y = qvars_tmp[i].split('=');
                        accessParams[y[0]] = decodeURIComponent(y[1]);
                    }
                    this.OAuth.setAccessToken([accessParams.oauth_token, accessParams.oauth_token_secret]);
                    
                    // Save access token/key in localStorage
                    var accessData = {};
                    accessData.accessTokenKey = accessParams.oauth_token;
                    accessData.accessTokenSecret = accessParams.oauth_token_secret;
                    
                    // SETTING OUR LOCAL STORAGE
                    console.log("TWITTER: Storing token key/secret in localStorage");
                    localStorage.setItem(this.localStorageKey, JSON.stringify(accessData));
                    
                    this.OAuth.get('https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true',
                        function(data) {
                            var entry = JSON.parse(data.text || 'null');
                            document.getElementById("twitterUser").textContent = entry.screen_name;
                            if (cb && typeof cb === 'function' ) { 
                                cb();
                            }
                        },
                        function (data) {
                            console.log("ERROR: " + data);
                            $("#tweetArea").addClass("hidden"); 
                        }
                    );

                    application.clientBrowser.close();
                    },this),
                    function (data) { 
                        console.log(data);
                    }
                );
        }

    },

    /*
    Docs:
        https://dev.twitter.com/docs/using-search
        https://dev.twitter.com/docs/api/1.1/get/search/tweets
    */
    search: function (searchToken, theResultType, includeEntities, theUntilDate, theSinceDate) {
        if (!searchToken) {
            throw new Error('Missing required "searchToken" parameter');
        }
        var encodedSearchToken = encodeURIComponent(searchToken), resultType = theResultType || 'mixed', iE = (typeof includeEntities === 'undefined') ? true : includeEntities;
        
        var data = {
            q: encodedSearchToken,
            rpp: this.count,
            result_type: resultType,
            include_entities: iE.toString()
        };
        if (this.geocode !== '') {
            data.geocode = this.geocode;
        }
        if (this.lang !== '') {
            data.lang = this.lang;
        }
        if (theUntilDate) {
            data.until = theUntilDate;
        }
        if (theSinceDate) {
            data.since = theSinceDate.toString();
        }
        
        var timeoutId = setTimeout($.proxy(function () {
            this.ajaxErrorHandler({
                queryType: 'search',
                reason: 'timeout'
            }, 'error');
        }, this), this.errorTimeout);
        $.ajax({
            url: this.protocol + this.searchURL,
            method: 'get',
            data: data,
            dataType: 'jsonp',
            success: $.proxy(function (data, textStatus, jqXHR) {
                clearTimeout(timeoutId);
                for (var i = 0; i < data.results.length; i += 1) {
                    this.processTweet(data.results[i]);
                }
            }, this)
        });
    },
    
    /*
    Docs:
        API v1 (deprecated) https://dev.twitter.com/docs/api/1/get/favorites
        API v1.1 https://dev.twitter.com/docs/api/1.1/get/favorites/list
    */
    fetchFavourites: function (screenName, includeEntities, sinceId, maxId) {
        var randomTweet;

        if (!screenName) {
            throw new Error('Missing required "screenName" parameter');
        }
        var encodedScreenName = encodeURIComponent(screenName), iE = (typeof includeEntities === 'undefined') ? true : includeEntities;
        
        var data = {
            screen_name: encodedScreenName,
            count: this.count,
            include_entities: iE.toString()
        };
        if (sinceId) {
            data.since_id = sinceId;
        }
        if (maxId) {
            data.max_id = maxId;
        }
        
        var timeoutId = setTimeout($.proxy(function () {
            this.ajaxErrorHandler({
                queryType: 'favourites',
                reason: 'timeout'
            }, 'error');
        }, this), this.errorTimeout);
        $.ajax({
           
            url: this.protocol + this.favouritesURL,
            method: 'get',
            data: data,
            dataType: 'jsonp',
            success: $.proxy(function (data, textStatus, jqXHR) {
                 $('.loaderTwitter').removeClass('hidden');
                 
                 var twitterResults = document.getElementById("twitter-results");
                 while (twitterResults.firstChild) {
                     twitterResults.removeChild(twitterResults.firstChild);
                 }
                clearTimeout(timeoutId);
                for (var i = 0; i < data.length; i += 1) {
                    this.processTweet(data[i]);
                }
                
                var randomNumber = Math.floor(Math.random() * data.length);
                var randomTweet = data[randomNumber];

				$('.twitText').text(randomTweet.text);
				$('.twitOwnerHome').text("@" + randomTweet.user.screen_name.toUpperCase());
				$('.loaderTwitter').addClass('hidden');
	
				$('.tweet-reply').on('click', function(event){
					var replyUrl = $(this).attr("data-href");
					window.plugins.childBrowser.showWebPage(encodeURI(replyUrl), { showLocationBar: true });
				});
	            $('.tweet-rt').on('click', function(event){
	          	    var retweetUrl = $(this).attr("data-href");
	                window.plugins.childBrowser.showWebPage(encodeURI(retweetUrl), { showLocationBar: true });
	            });
                
            }, this)
        });       
    },


    processTweet: function (tweet) {

    },
    
    
    linkUsers: function (text) {
        return text.replace(/@[A-Za-z0-9-_]+/g, function (user) {
            return user.link('http://twitter.com/' + user.replace('@', ''));
        });            
    },
    
    
    linkHashtags: function (text) {
        return text.replace(/#[^ ,.]+/g, function (hashtag) {
            return hashtag.link('http://twitter.com/search/realtime?q=' + hashtag.replace('#', encodeURIComponent('#')));
        });
    },
    
    
    ajaxErrorHandler: function (jqXHR, textStatus, errorThrown) {
        /*
        alert('Ocurrió un error buscando los Tweets, por favor espere unos minutos.');
        */
    }
};
