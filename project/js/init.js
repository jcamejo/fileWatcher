var clickEventType = 'touchstart';

var initializeEvents = function () {
    var articles = document.getElementById('articlesTab');
    var bindingsArticles = [{
        event: clickEventType,
        listeners:[
        function () {
            application.switchTab('articles', 'mainNav');
            /*if (!this.articlesScroll) { 
                this.articlesScroll = new iScroll('prizesContainer', {
                    vScrollbar:false
                });

            } else { 
                this.articlesScroll.refresh();
            }*/

        }
      ]
    }];
    bindEvents(articles, bindingsArticles);

    var challenges = document.getElementById('challengesTab');
    var bindingsChallenges = [{
        event: clickEventType,
        listeners:[
            function () {

                application.switchTab('challenges', 'mainNav');
                
            }
        ]
    }];
    bindEvents(challenges, bindingsChallenges);

    var profile = document.getElementById('profileTab');
    var bindingsProfile = [{
        event: clickEventType,
        listeners:[
            function () {
                application.switchTab('profile','mainNav');
                application.loadProfile();
            }
        ]
    }];
    bindEvents(profile, bindingsProfile);

    var loginButton = document.getElementById('loginButton');
    var bindingsLoginButton = [{
        event: clickEventType,
        listeners:[
            function () { 
                application.login();
            }
        ]
    }];
    bindEvents(loginButton, bindingsLoginButton);

    var twitterLoginButton = document.getElementById('twitterLogin');
    var bindingsTwitterLogin = [{
        event: clickEventType,
        listeners:[
            function () {
                twitterBridge.login();
            }
        ]
    }];
    bindEvents(twitterLoginButton, bindingsTwitterLogin);

    var postTweetButton = document.getElementById('postTweet');
    var bindingsPostTweet = [{
        event: clickEventType,
        listeners:[
            function () {
                challengeFactory['twitter'].tweet();
            }
        ]
    }];
    bindEvents(postTweetButton, bindingsPostTweet);

    var instLoginButton = document.getElementById('instLogin');
    var bindingsInstLogin = [{
        event: clickEventType,
        listeners:[
            function () {
                application.instagramLogin();
            }
        ]
    }];
    bindEvents(instLoginButton, bindingsInstLogin);

    var buyButton = document.getElementById('buyButton');
    var bindingsBuyButton = [{
        event: clickEventType,
        listeners:[
            function () {
                $('#confirmDialog').overlay(application.confirmDialogOpts).load();
                application.navStack.push('#confirmDialog');
            }
        ]
    }];
    bindEvents(buyButton, bindingsBuyButton);

    var confirmPrize = document.getElementById('confirmPrize');
    var bindingsconfirmPrize = [{
        event: clickEventType,
        listeners:[
            function () {
                var articleId = document.getElementById('articleId').getAttribute("data-articleid");
                application.buyArticle(articleId);
            }
        ]
    }];
    bindEvents(confirmPrize, bindingsconfirmPrize);

    var tweetLogout = document.getElementById('tweetLogout');
    var bindingsTweetLogout = [{
        event: clickEventType,
        listeners:[
            function () {
                if (localStorage.getItem(twitterBridge.localStorageKey)) { 
                    localStorage.removeItem(twitterBridge.localStorageKey);
                    alert("tweet Logout");
                }
            }
        ]
    }];
    bindEvents(tweetLogout, bindingsTweetLogout);

    var fbLogout = document.getElementById('fblogout');
    var bindingsfbLogout = [{
        event: clickEventType,
        listeners:[
            function () {
                FB.logout(function(response) {
                    printObject(response);
                });
            }
        ]
    }];
    bindEvents(fbLogout, bindingsfbLogout);
}


var bindEvents = function (node, bindings) {
    for (var i=0; i<bindings.length; i++) { 
        for ( var j=0; j<bindings[i].listeners.length; j++ ) {
            node.addEventListener(bindings[i].event, bindings[i].listeners[j], false);
        }
    }
}


