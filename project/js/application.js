'use strict';

Array.prototype.clone = function () {}
    return this.slice(0);
};



Array.prototype.find = Array.prototype.find || function (needle, fromIndex, comparer) {
    var maxi = this.length;
    if (!maxi) {
        return -1;
    }
    
    var match = -1;
    if (typeof comparer === 'function') {
    
        var start = 0;    
        fromIndex = parseInt(fromIndex) || 0;
        if (fromIndex >= this.length) {
            return -1;
        }
        else if (fromIndex < 0) {
            start = Math.max(0, Math.min(this.length - 1, this.length - 1 + fromIndex));
        }
        
        for (var i = start; i < maxi; i += 1) {
            if (comparer(this[i], needle))  {
                match = i;
                break;
            }
        }
    }
    else {
        match = this.indexOf(needle, fromIndex);
    }
    
    return match;
};

Array.prototype.contains = Array.prototype.contains || function (needle, fromIndex, comparer) {
    return (this.find(needle, fromIndex, comparer) !== -1);
};

Array.prototype.get = Array.prototype.get || function (needle, fromIndex, comparer) {
    var match = this.find(needle, fromIndex, comparer);
    if (match === -1) {
        return;
    }
    return this[match];
};

var printObject = function (obj, level) {
    var space = space || '', i, key;
    var deepness = level || 0;
    for (i = 0; i < level; i += 1) {
        space += '-- ';
    }
    for (key in obj) {
        if (obj.hasOwnProperty(key)) {
            console.log(space + key + ' = ' + obj[key]);
            if (obj[key] !== null && obj[key] !== undefined) {
                if (obj[key].toString() === '[object Object]') {
                    printObject(obj[key], deepness + 1);
                }
            }
        }
    }
    return;
};

var fail = function (error) {
    var errorName = getErrorName(window.FileError, error.code);
    //console.log("error " + errorName);
}

var getErrorName = function (errorObj, code) {
    var key;
    for (key in errorObj) {
        if (errorObj.hasOwnProperty(key)) {
            if(errorObj[key] === code) {
                return key;
            } 
        }
    }

} 

var application = function () {
    var accessToken;

    var self = {

        args: {},
        challengesScroll: null,
        articlesScroll: null,
        activityScroll:null,
        activeTab: null,
        contentId: '',
        content: null,
        activeNav: null,
        clientBrowser: null,
        twitterOauth: null,
        authResponse: {},
        instagramOauth: null,
        rowCount: 0,
        currentChallenge: null,
        devicePlatform: '',
        renderedChallenges: [],
        renderedArticles: [], 
        user:{
        },
        profilePath: null,
        articlePath: null,
        navStack:[],
        baseDataURL:'http://10.0.0.251/pepsi_tiendaVirtual/php/interfaces/',
        overlayOpts: { 
            mask: { 
                color: '#ebecff',
                loadSpeed: 200,
                opacity: 1
            },
            left: '5%',
            top: '5%',
            load:true,
            oneInstance: false,
            closeOnClick: false,
            onBeforeLoad: function () {
                
            },
            onClose: function () {
                //application.cleanOverlay();
            }
        },
        overlayDialogOpts: { 
            mask: { 
                color: '#01274A',
                loadSpeed: 0,
                opacity: 1
            },
            load:true,
            left: '10%',
            top: '30%',
            closeOnClick: false,
            oneInstance: false,
            onClose: function () {
            }
        },
        confirmDialogOpts: { 
            load: true,
            left: '10%',
            top: '30%',
            closeOnClick: false,
            oneInstance: false,
            onClose: function () {
                var challengeStatus = document.getElementById("challengeStatus");
                challengeStatus.textContent = "";
            }
        },
        userKey: 'currentUser',
        articlesData: {
            lastRefresh:'',
            articles: [{ 
                id:'1',
                name:'Bate',
                description:'Es un bate',
                value:100,
                imageURI:'http://dibuteca.estaticos.net/dibujos/pintados/201048/8f76afdf74f2ac741c209ed5cd8d4223.png'
            },
            { 
                id:'2',
                name:'guante',
                description:'Es un guante',
                value:100,
                imageURI: 'http://bimg2.mlstatic.com/guante-beisbol-wilson-profesional-cuero-100-a2000-115-pulg_MLV-F-3422969139_112012.jpg'
            },
            { 
                id:'3',
                name:'Pelota',
                description:'Es una pelota',
                value:100,
                imageURI: 'http://img2.mlstatic.com/pelota-futbol-nike-original-modelo-mercurial-fade-numero-5_MLA-O-3396447429_112012.jpg'
            }, 
            { 
                id:'4',
                name:'camisa',
                description:'Es una camisa',
                value:100,
                imageURI: 'http://papayamarket.com/image/cache/data/pepsi_botella-500x500.jpg'
            }]
        },
        challengesData: {
            lastRefresh: '',
            challenges: [{
                    id:'1',
                    platform: 'facebook',
                    action: 'share',
                    value: 100,
                    overlay: false,
                    description:'Publica lo siguiente a FB',
                    params: { 
                        method : 'feed',
                        name : 'Pepsi tienda virtual',
                        link : 'http://www.facebook.com',
                        picture : 'http://www.facebookmobileweb.com/hackbook/img/facebook_icon_large.png',
                        caption :'Pepsi Tienda Virtual',
                        description : 'Esta es una prueba para pepsi tienda virtual'
                    }
                },{
                    id:'2',
                    platform: 'facebook',
                    action: 'friendRequest',
                    description:'Compartes a los amigos',
                    value: 110,
                    overlay: false,
                    params: { 
                        method: 'apprequests',
                        message: 'Learn how to make your mobile web app social'
                    }
                },{
                    id:'3',
                    platform: 'web',
                    action:'video',
                    description:'Ve el siguiente video',
                    value: 120,
                    overlay: false,
                    params: { 
                        videoUrl: 'http://www.youtube.com/watch?v=PbzJUL3A07k'
                    }
                },{
                    id:'4',
                    platform: 'twitter',
                    action:'tweet',
                    description:'Realiza un tweet',
                    value: 1030,
                    overlay: true,
                    params: { 
                        text:'Esto es un tweet predeterminado'
                    }
                }]
        },
        counter: 5,
        challengesTypes:[],
        appUserFields:{
        },
        checkImageUrl: 'images/check.png',
        errorImageUrl: 'images/error_shadow.png',

        start: function (args) {

            this.clientBrowser = window.plugins.childBrowser;
            this.contentId = this.args.contentId || 'content';
            this.content = document.getElementById(this.contentId);
            
            if (!this.content) {
                throw new Error('Unexistent content Id "' + this.contentId + '", cannot continue.');
            }

            if(devicePlatform !== 'Web') { 
                this.checkConnection();
                fbBridge.load($.proxy(this.loginCallback, this), $.proxy(this.failInitCb, this));
            }

            if (localStorage.getItem(twitterBridge.localStorageKey) !== null) { 
                twitterBridge.login();
            }

            $('.loader').removeClass('hidden');
            setTimeout($.proxy(this.loadChallenges, this),1000);

            $('.loader').removeClass('hidden');
            setTimeout($.proxy(this.loadArticles, this), 1000);

            switch (devicePlatform) {
                case 'Android':
                    this.doAndroidWorkarounds();
                    break;
                case 'iOS':
                case 'iPhone':
                case 'iPad':
                    this.doIOSWorkarounds();
                    break;
            }
            this.switchTab('articles', 'mainNav');

        },
        failInitCb: function () { 
            var user;
            $('#loginScreen').removeClass('hidden');
            setTimeout(navigator.splashscreen.hide,300);
            user = localStorage.getItem("user");
            if (user) {
                user = JSON.parse(user); 
                this.user = user;
                this.writeUserInformation(user);
            }
        },
        
        switchTab: function (tabId, navId) {

            if (tabId === this.activeTab) { 
                return;
            }

            this.activeTab = tabId;
            this.clearContent();

            if (tabId === '') {
                return;
            }

            if (navId) {
                var navButtons = navId ? document.getElementById(navId).children: null;
                this.activeNav = navId;
                
                //Unselect
                $('.selected', navButtons).removeClass('selected');
                //Select
                $('#' + tabId + "Tab" , navButtons).addClass('selected');
        
            }
            
            var newContent = document.getElementById(tabId);

            if (newContent === null) {
                throw new Error('Unexistent tab: ' + tabId);
            }

            $(newContent).removeClass('hidden');
            $(newContent).addClass('shown');
            this.content.appendChild(newContent);
            
        },

        clearContent: function (subContainer) {

            var oldContent = subContainer ? subContainer.children : this.content.children, i;

            for (i = 0; i < oldContent.length; i +=1) {
                $(oldContent[i]).removeClass('shown');
                $(oldContent[i]).addClass('hidden');

                if (!subContainer) {
                    this.content.parentNode.insertBefore(oldContent[i], this.content);
                } else {
                    subContainer.parentNode.insertBefore(oldContent[i], subContainer);
                }
            }

        },
        showLogin: function () {

            $('#loginScreen').removeClass("hidden");

        },
        /*
            Problemas al recibir respuesta de un callback al llamar al UI
            https://github.com/davejohnson/phonegap-plugin-facebook-connect/issues/118
            
            Posibles soluciones.
            Android:
            https://github.com/davejohnson/phonegap-plugin-facebook-connect/pull/155

            iOS:
            https://github.com/davejohnson/phonegap-plugin-facebook-connect/pull/156
        */
        loadChallenges: function (option) { 
            /*
                Loaded all challenges
            */
            var el = document.getElementById('challengeList'), i, challengeNodes = '';
            var challengeId, challengeCommand, challengesCache, that = this;
            var challengesResponse, ajaxSuccess = true, challenges;

            challengesResponse = this.challengesData.challenges.clone();

            if (ajaxSuccess) { 

                this.loadChallengesWorker(challengesResponse);
                this.challengesData.lastRefresh = new Date ();
                localStorage.setItem("challengesData", JSON.stringify(this.challengesData));

            } else {

                challengesCache = JSON.parse(localStorage.getItem("challengesData") || 'null');

                if (challengesCache) { 

                    this.loadChallengesWorker(challengesCache);

                    if (challengesCache.lastRefresh !== '') {    
                        var challengeList = document.getElementById("challengeList");
                        var refreshDate = document.createElement("p");
                        refreshDate.textContent = "Last refresh " + challengesCache.lastRefresh;
                        
                        if(challengeList.firstChild) {
                            challengeList.insertBefore(refreshDate, challengeList.firstChild);
                        } else {
                            challengeList.appendChild(refreshDate);
                        }                    
                    }

                }
            }

            $('.challengeOk').unbind();
            $('.challengeOk').on('touchstart', function (event) {

                challengeId = $(this).get(0).getAttribute("data-challengeid");

                var theChallenge = that.challengesData.challenges.get(challengeId,0, function(obj, id){ 
                    return(obj.id === id);
                });

                if (theChallenge === -1) { 
                    throw new Error ("Challenge Not Found");
                } else {

                    challengeCommand = challengeFactory[theChallenge.platform];
                    challengeCommand.init(theChallenge);
                    challengeCommand.execute();
                
                }
            });

            /*Preparing "pull down to refresh" Object"*/

            var args = {}, pullDownOpts;

            args.pullDownElementId = 'pullDown';
            args.action = this.pullChallenges;
            pullDownOpts = new PullDownOpts(args);

            if (!this.challengesScroll) { 
                this.challengesScroll = new iScroll('challengeContainer', pullDownOpts);

            } else { 
                this.challengesScroll.refresh();
            }
        }, 
        loadChallengesWorker: function (response) {
            

            var el = document.getElementById('challengeList'), i, challengeNodes = '';
            var that = this;
            var challengesResponse;

            challengesResponse = response;
            for (i = 0; i < challengesResponse.length; i++) {

                if (this.renderedChallenges.indexOf(challengesResponse[i]) === -1) {
                    
                    challengeNodes +=   '<div>' +
                                            '<h2>Reto ' + i + '</h2>' +
                                            '<p class="challengeDescription">' + challengesResponse[i].description + '</p>' +
                                            '<a href="#" data-challengeid="' + challengesResponse[i].id + '" class="challengeOk">Realizar Reto</a>' +
                                        '</div> ';
                    
                    this.renderedChallenges[this.renderedChallenges.length] = challengesResponse[i];
                }

            }

            $(challengeNodes).insertBefore(el.childNodes[0]);
             $('.loader').addClass('hidden');


        },
        /*
            Javascript performance tips and tricks
            http://moduscreate.com/javascript-performance-tips-tricks/
        */

        loadArticles: function () {
            /*
                Loaded all prizes (AjaxCall)
            */ 

            var el = document.getElementById('prizeList'), i, articlesCache, articleNodes = '', ajaxSuccess = true, imageFilename, imageURI, articlesArray;
            var articlesResponse = this.articlesData.articles.clone(), articleNodes ='';
            localStorage.setItem("articles", JSON.stringify(articlesResponse));

            $('.loaderHome').removeClass('hidden')

            if (ajaxSuccess) {

                this.loadArticlesWorker(articlesResponse);
                this.articlesData.lastRefresh = new Date ();
                localStorage.setItem("articlesData", JSON.stringify(this.articlesData));

                for (i=0; i< articlesResponse.length; i++) { 
                    this.loadArticleImage(articlesResponse[i].imageURI, 'article-' + articlesResponse[i].id);
                }
                
            } else { 

                articlesCache = JSON.parse(localStorage.getItem("articlesData"));
                articlesArray = articlesCache.articles;
                articleNodes = '';
                
                if (articlesCache) {

                    this.loadArticlesWorker(articlesCache);
                    if (articlesCache.lastRefresh !== '') {
                        var prizeList = document.getElementById("prizeList");
                        var refreshDate = document.createElement("p");
                        refreshDate.textContent = "Last refresh " + articlesCache.lastRefresh;
                        console.log("refreshDate " + refreshDate.textContent );

                        if(prizeList.firstChild) {
                            prizeList.insertBefore(refreshDate, prizeList.firstChild);
                        } else {
                            prizeList.appendChild(refreshDate);
                        }
                    }
                    
                    for (i=0; i< articlesResponse.length; i++) { 
                        this.loadArticleImage(articlesResponse[i].imageURI, 'article-' + articlesResponse[i].id);
                    }

                }

            }

            if (!this.articlesScroll) { 
                this.articlesScroll = new iScroll('prizesContainer', {
                    vScrollbar:false
                });

            } else { 
                this.articlesScroll.refresh();
            }

            $('.productLink').unbind();
            $('.productLink').on('touchstart', function (event) {
                application.viewArticleDetails($(this).get(0).getAttribute("data-articleid"));
            });

        },

        loadArticlesWorker: function (response) {

            var el = document.getElementById('prizeList'), i, articlesCache, articleNodes = '', ajaxSuccess = true, imageFilename, imageURI, articlesArray;
            var articlesResponse = response, articleNodes ='';
            localStorage.setItem("articles", JSON.stringify(articlesResponse));

            for (i = 0; i < articlesResponse.length; i++) {
                    if (this.renderedArticles.indexOf(articlesResponse[i]) === -1) {

                        /*http://jsperf.com/concat123*/
                        articleNodes += '<div>' +
                                            '<h2>Premio ' + articlesResponse[i].name + '</h2>' +
                                            '<img src="" alt="' + articlesResponse[i].name  + '" id="article-' + articlesResponse[i].id + '" height="200" width="200">' +
                                            '<a class="productLink" href="#" data-articleid="' + articlesResponse[i].id + '"  rel="#showProduct">Ver Producto</a>' +
                                        '</div>';

                        this.renderedArticles[this.renderedArticles.length] = articlesResponse[i];


                        imageURI = articlesResponse[i].imageURI;
                        imageFilename = imageURI.substring(imageURI.lastIndexOf('/')+1);

                        if (this.checkConnection()) { 
                            this.articlePath.getFile(imageFilename, {create: true, exclusive: true}, $.proxy(this.downloadImage, this), fail);
                        }
                    }
                }

                $(articleNodes).insertBefore(el.childNodes[0]);
                $('.loaderHome').addClass('hidden')

        },

        loadProfile: function () { 

            this.loadRecentActivities();
        },
        loadRecentActivities: function () {
            /*
                Ajax Call
            */
            var ajaxSuccess = true, i , totalActivities = 10, activity;
            var activityList = document.getElementById("activityList");

            if (ajaxSuccess) {

                for (i = 0; i < totalActivities; i++ ) { 
                    activity = '<li> actividad ' + i + '</li>';
                    $(activity).insertBefore(activityList.childNodes[0]);
                }

            } else {
                activity = '<li> NO activities </li>';
                $(activity).insertBefore(activityList.childNodes[0]);
            }

            if (!this.activityScroll) { 

                this.activityScroll = new iScroll('activityContainer', {});
                this.activityScroll.refresh();

            } else { 
                this.activityScroll.refresh();
            }
        },

        buyArticle: function (id) {
            
            var userCoins = parseInt(this.user.coins, 10), newOverlayOpts, success = true, buyInfo = {}, args = {};
            var product = this.articlesData.articles.get(id,0,function (obj,id) {
                return (obj.id === id); 
            });
            /*
            $('#confirmDialog').overlay().close();

            if (!product) { 

                document.getElementById("booleanImage").src = this.errorImageUrl;
                document.getElementById("dialogMessage").textContent = "No se consiguió el producto";
                $('#messageDialog').overlay(application.confirmDialogOpts).load();
                this.navStack.push('#messageDialog');
                return;

            } 

            var productValue = product.value;
            var subResult = userCoins - productValue;

            if (subResult < 0) { 
                document.getElementById("booleanImage").src = this.errorImageUrl;
                document.getElementById("dialogMessage").textContent = "Fondos Insuficientes";
                
                newOverlayOpts = $.extend(true, {}, application.confirmDialogOpts, {
                    onClose: function () { 
                        $("#showProduct").overlay().close();
                    }
                });

                $('#messageDialog').overlay(newOverlayOpts).load();
                this.navStack.push('#messageDialog');
            } else { */
                
                /* writeToLog*/

            /*    this.user.coins = subResult;
                document.getElementById("booleanImage").src = this.checkImageUrl;
                document.getElementById("dialogMessage").textContent = "Compra Exitosa";
               
                document.getElementById("coins").textContent = subResult;

                var prizeList = document.getElementById("prizeList");
                $('[data-articleid='+id+']', prizeList).parent().remove();

                newOverlayOpts = $.extend(true, {}, application.confirmDialogOpts, {
                    onClose: function () { 
                        $("#showProduct").overlay().close();
                    }
                });
                $('#messageDialog').overlay(newOverlayOpts).load();
                this.navStack.push('#messageDialog');
            }*/

            /* Buying Operation  (Ajax Call)*/
                buyInfo.userId = $.proxy(this.user.id, this);
                buyInfo.user = 1;
                buyInfo.article = id;
                buyInfo.accessToken = accessToken;
                args.payload = buyInfo;
                args.interface = 'iArticles';
                args.responseHandler = $.proxy(this.buyingCallback, this);

                var request = new Request(args);
                request.submit();

            /**/
        },

        viewArticleDetails: function (id) {

            var i=0;
            var overlayOpts = this.overlayOpts;

            var product = this.articlesData.articles.get(id, 0, function (obj,id) {
                return (obj.id === id); 
            });

            if (product) {

                document.getElementById("productName").textContent = product.name;
                document.getElementById("productValue").textContent = product.value;
                document.getElementById("productDescription").textContent = product.description;
                document.getElementById("articleId").setAttribute("data-articleid", id);
                this.loadArticleImage(product.imageURI, 'productImage');

            } else { 
                document.getElementById("productName").textContent = "no se consiguió";
            }

            $('#showProduct').overlay(overlayOpts).load();
            this.navStack[this.navStack.length] = '#showProduct';

        },
        /*
            File Transfer Download
            http://simonmacdonald.blogspot.com/2012/04/sorry-for-being-gone-so-long-vacation.html
        */

        checkUser: function (response) {
            /*Ajax Call (if user exists in DB)*/
            var userDBinfo = response, ajaxSuccess = true, localPath;
            /**/
            var userExists = true;

            if (ajaxSuccess) { 

                if (!userExists) { 
                    this.regUser(response);
                } else { 
                    this.user = userDBinfo;
                    this.writeUserInformation(this.user);
                }

            } 

        },
        writeUserInformation: function (user) { 

            this.user.coins = 0;
            document.getElementById("username").textContent = this.user.name;
            document.getElementById("coins").textContent = this.user.coins;
        
        },
        regUser: function(user) { 
            /*Ajax Call to write in DB*/
        },
        addChallengeCoins: function (value, challengeId) { 
            
            var val = parseInt(value, 10);

            if (this.user.coins !== undefined && val) {
                val = parseInt(value, 10);
                this.user.coins += val;

                var challengeStatus = document.getElementById("challengeStatus");
                challengeStatus.textContent = "El reto se ha completado satisfactoriamente";

                this.recordChallenge(challengeId);

                document.getElementById("challengeStatusImage").src = this.checkImageUrl;
                document.getElementById("coins").textContent = this.user.coins;
                $('#showDialog').overlay(this.overlayDialogOpts).load();
                this.navStack[this.navStack.length] = '#showDialog';
                
            } else { 
                console.log("this.user.coins" + this.user.coins);
            }

        },
        loginCallback:function (response) {

            if (response.authResponse) {
                $('#loginScreen').addClass("hidden");
                
                /*console.log("authResponse");
                printObject(response.authResponse);*/

                /*AJAX CALL for regUser*/
                fbBridge.getUserInformation('friends?fields=installed', $.proxy(this.getAppFriends, this));
                fbBridge.getUserInformation('picture?type=large',$.proxy(this.downloadProfileImage,this));

                //regUser
            } else { 
                console.log('User cancelled login or did not fully authorize.');
            }

        },

        login: function () {

            fbBridge.login(null,$.proxy(this.loginCallback, this));

        },

        logout: function () {
        },
        
        instagramLogin: function () { 
            
            var storedAccessData;
            var userUrl = 'https://api.instagram.com/v1/users/self/?';
            var authorize_url = "https://instagram.com/oauth/authorize?";
             authorize_url += "client_id=" + instagramBridge.oAuthSettings.client_id;
             authorize_url += "&redirect_uri=" + instagramBridge.oAuthSettings.redirect_uri;
             authorize_url += "&response_type=token";
             authorize_url += "&scope=likes+comments";

            this.clientBrowser.onLocationChange = $.proxy(function(loc){
                this.checkInstUrl(loc);
            },this);
            
            if (localStorage.getItem(instagramBridge.localStorageKey) !== null) { 

                storedAccessData = JSON.parse(localStorage.getItem(instagramBridge.localStorageKey) || 'null');
                $.ajax({
                    url: userUrl,
                    data: {
                        access_token: storedAccessData.accessToken
                    },
                    type: 'GET',
                    success: $.proxy(function(response, status){
                        console.log("ya existe accessToken instagram");
                    },this),
                    error: $.proxy(function(jqXHR, textStatus, errorThrown) {
                        localStorage.removeItem(instagramBridge.localStorageKey);
                        console.log("textStatus " + textStatus);
                        console.log("errorThrown " + errorThrown);
                    },this)
                });

            } else { 
                if (this.clientBrowser !== null) {
                    this.clientBrowser.showWebPage(authorize_url);
                }
            }

        },

        checkInstUrl: function (loc) {

            if (loc.indexOf(instagramBridge.oAuthSettings.redirect_uri) >= 0 || loc.indexOf(instagramBridge.oAuthSettings.redirect_uri) > -1) {
                var accessToken = loc.match(/access_token=(.*)$/)[1];

                var accessData = {};
                accessData.accessToken = accessToken;
                var accessTokenurl = 'https://api.instagram.com/v1/users/self/?';
                $.ajax({
                    url: accessTokenurl,
                    data: {
                        access_token: accessToken
                    },
                    type: 'GET',
                    success: $.proxy(function(response, status){
                        accessData.userData = response.data;
                        localStorage.setItem(instagramBridge.localStorageKey, JSON.stringify(accessData));
                        this.clientBrowser.close();
                    },this),
                    error: $.proxy(function(jqXHR, textStatus, errorThrown) {
                        console.log("textStatus " + textStatus);
                        console.log("errorThrown " + errorThrown);
                        this.clientBrowser.close();
                    },this)
                });
            }

        },
        pullChallenges: function () {
            /*
                Ajax Call 
            */
            var challengesResponse = this.challengesData.challenges.clone();
            var counter = this.counter++;
            var newChallenge = { 
                                id:counter,
                                name:'Bate',
                                description:'Es un bate',
                                value:100,
                                image:'http://www.leanoticias.com/wp-content/uploads/2011/09/image102-150x150.png'
                            };
            challengesResponse[challengesResponse.length] = newChallenge;
            
            setTimeout($.proxy(function () {
                var el, div, i;
                el = document.getElementById('challengeList');
                if (challengesResponse.length !== this.challengesData.challenges.length) {
                    
                    for (i=0; i<challengesResponse.length; i++) {
                        
                        if (!this.challengesData.challenges.contains(challengesResponse[i],0)) {

                            div = document.createElement('div');
                            var challenge = '<div>' +
                                                '<h2>Reto '+ (++this.rowCount) + '</h2>' +
                                                '<p class="challengeDescription">Descripción</p>' +
                                                '<a href="#" data-challengeid="'+challengesResponse[i].id +'" class="challengeOk">Realizar Reto</a>' +
                                            '</div> ';
                            $(challenge).insertBefore(el.childNodes[0]);
                            this.challengesData.challenges[this.challengesData.challenges.length] = challengesResponse[i];
                        
                        }
                    }

                }
                
                this.challengesScroll.refresh();// Remember to refresh when contents are loaded (ie: on ajax completion)
            },this), 1000);// <-- Simulate network congestion, remove setTimeout from production!

        },
        cleanOverlay: function () { 

            document.getElementById('productName').textContent = '';
            document.getElementById('productValue').textContent = '';
            document.getElementById('productImage').src = '';
            document.getElementById('productDescription').textContent ='';

        },
        recordChallenge: function (challengeId) {
            /*Ajax Call*/
            var userId = this.user.id;

        },
        doGeneralWorkarounds: function () {
           
        },
        doAndroidWorkarounds: function () {

            if(devicePlatform === 'Android') {

                switch (deviceVersion) { 

                    case '4.0.1':
                    case '4.0.2':
                    case '4.0.3':
                    case '4.0.4':
                        $('*').css('-webkit-backface-visibility','');
                        break;
                    default:
                        break;
                } 

            }
        },
        doIOSWorkarounds: function () {

        },
        checkConnection: function () { 
            
            var networkState = navigator.connection !== undefined ? navigator.connection.type: 'Web';
            var challenges, articles, user;

            switch (networkState) { 
                case 'Web':
                    return false;
                    break;
                case Connection.UNKNOWN:
                case Connection.NONE:

                    challenges = JSON.parse(localStorage.getItem("challengesData") || 'null');
                    articles = JSON.parse(localStorage.getItem("articlesData") || 'null');

                    if (challenges) { 
                        this.challengesData = challenges;
                    }

                    if (articles) { 
                        this.articlesData = articles;
                    }
                   
                    return false;
                    break;
                case Connection.Ethernet:
                case Connection.WIFI:
                case Connection.CELL_2G:
                case Connection.CELL_3G:
                case Connection.CELL_4G:
                    return true;
                    break;
                
                default:
                    break;
            }

            var states = {};
            states[Connection.UNKNOWN] = 'Unknown connection';
            states[Connection.ETHERNET] = 'Ethernet connection';
            states[Connection.WIFI] = 'WiFi connection';
            states[Connection.CELL_2G] = 'Cell 2G connection';
            states[Connection.CELL_3G] = 'Cell 3G connection';
            states[Connection.CELL_4G] = 'Cell 4G connection';
            states[Connection.NONE] = 'No network connection';

        },

        loadArticleImage: function (imageURI, elementId) { 
            
            var networkState = navigator.connection !== undefined ? navigator.connection.type: 'Web';
            var challenges, articles, user, prices;
            var filename = imageURI.substring(imageURI.lastIndexOf('/')+1);
            var node = document.getElementById(elementId),reader;
            var that = this;

            if (!node) {
                throw new Error('Node not found');
            }
            
            switch (networkState) {
                case 'Web':
 
                        node.setAttribute('src', 'images/pepsiholder.jpg');
                    break; 
                case Connection.UNKNOWN:
                case Connection.NONE:

                    this.articlePath.getFile(filename, {create: true, exclusive: false}, 
                        function(fileEntry) {
                            fileEntry.file(that.onFileSuccess(elementId), that.onFileFailure(node,'images/pepsiholder.jpg'));
                        }, 
                        fail);

                    break;
                case Connection.Ethernet:
                case Connection.WIFI:
                case Connection.CELL_2G:
                case Connection.CELL_3G:
                case Connection.CELL_4G:

                    this.articlePath.getFile(filename, {create: true, exclusive: false}, 
                        function(fileEntry) {
                            fileEntry.file(that.onFileSuccess(elementId), that.onFileFailure(node,imageURI));
                        }, 
                        fail);

                    break;
                default:
                    break;
            }

        },
        onDownloadSuccess: function () {

        },
        buyingCallback: function (response, requestIndex) {
            var responseStatus = 'undefined';
            var userCoins = this.user.coins;
            userCoins = parseInt(userCoins, 10);

            switch(responseStatus) {
                case 'Success':

                    this.user.coins = subResult; //user Coins
                    document.getElementById("booleanImage").src = this.checkImageUrl;
                    document.getElementById("dialogMessage").textContent = "Compra Exitosa";
                    document.getElementById("coins").textContent = subResult;

                    var prizeList = document.getElementById("prizeList");
                    $('[data-articleid=' + id + ']', prizeList).parent().remove();

                    newOverlayOpts = $.extend(true, {}, application.confirmDialogOpts, {
                        onClose: function () { 
                            $("#showProduct").overlay().close();
                        }
                    });
                    $('#messageDialog').overlay(newOverlayOpts).load();
                    this.navStack[this.navStack.length] = '#messageDialog';

                    requestManager.deleteRequest(requestIndex);
                    break;

                case 'Failed':

                    document.getElementById("booleanImage").src = this.errorImageUrl;
                    document.getElementById("dialogMessage").textContent = "Error en la BD";
                    
                    newOverlayOpts = $.extend(true, {}, application.confirmDialogOpts, {
                        onClose: function () { 
                            $("#showProduct").overlay().close();
                        }
                    });

                    $('#messageDialog').overlay(newOverlayOpts).load();
                    this.navStack[this.navStack.length] = '#messageDialog';

                    requestManager.requestArray[requestIndex].status = 'Failed';
                    break;

                case 'noMoney':

                    document.getElementById("booleanImage").src = this.errorImageUrl;
                    document.getElementById("dialogMessage").textContent = "Fondos Insuficientes";
                    
                    newOverlayOpts = $.extend(true, {}, application.confirmDialogOpts, {
                        onClose: function () { 
                            $("#showProduct").overlay().close();
                        }
                    });

                    $('#messageDialog').overlay(newOverlayOpts).load();
                    this.navStack[this.navStack.length] = '#messageDialog';

                    requestManager.requestArray[requestIndex].status = 'Failed';
                    break;

                default:

                    console.log("buyingCallback");
                    break;

            }


        },
        onFileSuccess: function (elementId) {
            
            return function (file) {
                var reader = new FileReader();
                var node = document.getElementById(elementId);

                if (node) {
                    reader.onload = function() {
                        node.setAttribute('src', reader.result);
                        node.setAttribute('alt', file.name);
                    };
                    reader.readAsDataURL(file);
                } else {
                   console.log("Node not found");
                }
            }
        },

        onFileFailure: function (node, url) {
            return function () {
                node.setAttribute('src', url);
            }
        },

        getAppFriends: function (response) { 
            var i, friendsData;

            if (response.data) {

                friendsData = response.data; 
                for (i = 0; i < friendsData.length; i++) { 
                    if (friendsData[i].hasOwnProperty('installed') && friendsData[i].installed === true ) { 
                        if (!this.user.appFriends) {
                            this.user.appFriends = [];
                        }
                        this.user.appFriends[this.user.appFriends.length] = friendsData[i]; 
                    } else {
                        if (!this.user.nonAppFriends) {
                            this.user.nonAppFriends = [];
                        }
                        this.user.nonAppFriends[this.user.nonAppFriends.length] = friendsData[i]; 
                    }
                } 
            }
        },

        downloadProfileImage: function (response) { 
            
            if (response.data) { 
                this.user.picture = response.data;
                
                document.getElementById("userImage").src = this.user.picture.url;
                localStorage.setItem("user", JSON.stringify(this.user));
                
                var fileTransfer = new FileTransfer();
                var fileUri = this.user.picture.url;

                console.log("profilePath " + this.profilePath );
                this.profilePath.getFile("profile.png", {create: true, exclusive: false}, 
                    function(fileEntry) {
                        var localPath = fileEntry.fullPath;
                        if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
                            localPath = localPath.substring(7);
                        }
                        var ft = new FileTransfer();
                        ft.download(fileUri,
                            localPath, 
                            function(entry) {
                                 console.log("download complete: " + entry.fullPath);
                            }, 
                            fail);
                }, fail);
            }

        }, 
        setAccessToken: function (token) {
            accessToken = token;
        },

        downloadImage: function (fileEntry) { 

            var localPath = fileEntry.fullPath;
            if (device.platform === "Android" && localPath.indexOf("file://") === 0) {
                localPath = localPath.substring(7);
            }
            var ft = new FileTransfer();
            ft.download(imageURI, localPath, $.proxy(this.downloadSuccess, this), fail);

        },
        downloadSuccess: function  (entry) {
            console.log("download complete: " + entry.fullPath);
        },

        loadChallengesHandler: function () {

            switch (response.status) {

                case 'success':
                    break;
                case 'fail':
                    break;
                default:
                    break;
            }

        },
        loadArticlesHandler: function (response, index) {

            var articlesResponse = response, imageURI, imageFilename, articlesCache, articlesArray, articleNodes;
            switch (response.status) {

                case 'success':

                    for (i = 0; i < articlesResponse.length; i++) {
                        if (this.renderedArticles.indexOf(articlesResponse[i]) === -1) {

                            articleNodes += '<div>' +
                                                '<h2>Premio '+ articlesResponse[i].name + '</h2>' +
                                                '<img src="" alt="' + articlesResponse[i].name + '" id="article-' + articlesResponse[i].id + '" height="200" width="200">' +
                                                '<a class="productLink" href="#" data-articleid="'+ articlesResponse[i].id+'"  rel="#showProduct">Ver Producto</a>  ' +
                                            '</div> ';

                            this.renderedArticles[this.renderedArticles.length] = articlesResponse[i];

                            imageURI = articlesResponse[i].imageURI;
                            imageFilename = imageURI.substring(imageURI.lastIndexOf('/')+1);

                            if (this.checkConnection()) { 
                                this.articlePath.getFile(imageFilename, {create: true, exclusive: true}, $.proxy(this.downloadImage, this), fail);
                            }
                        }
                    }

                    this.articlesData.lastRefresh = new Date ();
                    localStorage.setItem("articlesData", JSON.stringify(this.articlesData));
                    $(articleNodes).insertBefore(el.childNodes[0]);

                    for (i=0; i< articlesResponse.length; i++) { 
                        this.loadArticleImage(articlesResponse[i].imageURI, 'article-' + articlesResponse[i].id);
                    }

                    break;
                case 'fail':

                    articlesCache = JSON.parse(localStorage.getItem("articlesData"));
                    articlesArray = articlesCache.articles;

                    if (articlesCache) { 
                        for (i = 0; i < articlesArray.length; i++) {
                            if (this.renderedArticles.indexOf(articlesArray[i]) === -1) {

                                articleNodes += '<div>' +
                                            '<h2>Premio '+ articlesArray[i].name+ '</h2>' +
                                            '<img src="" alt="' + articlesArray[i].name + '" id="article-' + articlesArray[i].id + '" height="200" width="200">' +
                                            '<a class="productLink" href="#" data-articleid="'+ articlesArray[i].id+'"  rel="#showProduct">Ver Producto</a>  ' +
                                        '</div> ';

                                this.renderedArticles[this.renderedArticles.length] = articlesArray[i];
                            }
                        }
                        
                        $(articleNodes).insertBefore(el.childNodes[0]);

                        if (articlesCache.lastRefresh !== '') {
                            var prizeList = document.getElementById("prizeList");
                            var refreshDate = document.createElement("p");
                            refreshDate.textContent = "Last refresh " + articlesCache.lastRefresh;
                            console.log("refreshDate " + refreshDate.textContent );

                            if(prizeList.firstChild) {
                                prizeList.insertBefore(refreshDate, prizeList.firstChild);
                            } else {
                                prizeList.appendChild(refreshDate);
                            }
                        }
                        
                        for (i=0; i< articlesResponse.length; i++) { 
                            this.loadArticleImage(articlesResponse[i].imageURI, 'article-' + articlesResponse[i].id);
                        }
                    }
                    break;
                default:
                    break;
            }

        },

        loadarticles: function () {
            
            var args = {
                interface: 'iArticles',
                payload: {},
                responseHandler: $.proxy(this.loadArticlesHandler,this)
            };

            var request = new Request(args);
            request.submit();

        },

        loadchallenges: function () {
            
            var args = {
                interface: 'iChallenges',
                payload: {},
                responseHandler: $.proxy(this.loadChallengesCb,this)
            }

            var request = new Request(args);
            request.submit();

        }

    }

    return self; 
}();