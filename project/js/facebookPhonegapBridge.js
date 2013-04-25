var FbDialog = function (params) {
    this.method = params.method || '';
    this.name = params.name || '';
    this.link = params.link || '';
    this.picture = params.picture || '';
    this.caption = params.caption || '';
    this.description = params.description || '';
    this.message = params.message || ''
}

var fbBridge = function () {

    var authResponse;

    var getAccessToken = function () { 
        if (authResponse) {
            return authResponse.accessToken;
        } else {
            return -1;
        }
    }

    var self = { 

        sdkURL: 'js/facebook_js_sdk.js',
        sdkNodeId: 'fb-root',
        appConf: {
            appId: '',
            //channelUrl: '/lib/php/facebook/sdk_channel.php',
            nativeInterface: ''
        },
        appURL: '',
        requests: [],
        requestedPerms: [],
        grantedPerms: {},
        userInfo: null,
        connected: false,
        pageId: -1,
        pageLiked: 0,
        connectedCallback: null,
        authorizeCallback: null,
        version: {
            major: 0,
            minor: 5,
            patch: 2
        },


        init: function (params) {
            this.appConf.appId = params.appId;
            this.appConf.nativeInterface = params.nativeInterface;
        },
        
        load: function (loginCb, failInitCb) {

            var loginCb = loginCb || null;
            var failCb = failInitCb || null;
            
            if (failCb) { 
                FB.init(this.appConf, failCb);
            }
            
            if (loginCb) { 
                this.login(null, loginCb);
            }

            FB.Event.subscribe('auth.statusChange', $.proxy(this.updateLoginStatus, this));
        },

        updateLoginStatus: function (response) {

            var userStatus = document.getElementById("userLoginStatus");
            switch (response.status) {
                case 'connected':
                    userStatus.textContent = "Conectado";
                    authResponse = FB.getAuthResponse();
                    application.setAccessToken(authResponse.accessToken);
                    this.getUserInformation('',$.proxy(application.checkUser,application));
                    
                    break;
                case 'not_authorized':
                    userStatus.textContent = "no Autorizado";
                    break;
                case 'unknown':
                    userStatus.textContent = "Desconocido";
                    $('#loginScreen').removeClass('hidden');
                    break;
                default:
                    userStatus.textContent = "Default";
                    break;
            }

        },

        checkPermissions: function (response) {
            var permsObj = response.data[0];
            for (var key in this.requestedPerms) {
                if (permsObj[this.requestedPerms[key]] === 1) {
                    this.grantedPerms[this.requestedPerms[key]] = true;
                }
            }
        },


        deleteRequests: function () {
            var temp = this.requests.slice(0);
            for (var i = 0; i < temp.length; i += 1) {
                ($.proxy(function (j) {
                    if (temp[j] !== '') {
                        var fullRequestId = temp[j] + '_' + this.userInfo.id;
                        FB.api(fullRequestId, 'delete', $.proxy(function (response) {
                            if (typeof response !== 'undefined' && !response.error) {
                                this.requests.splice(this.requests.indexOf(temp[j]), 1);
                            }
                        }, this));
                    }
                }, this)(i));
            }
        },


        login: function (opts, handler) {
            var theCallback = this.findCallback(handler);
            opts = opts || {
                scope: this.requestedPerms.join(',')
            };        
            FB.login(theCallback, opts);
        },


        postToWall: function (dialog, callback) {
            /*if (this.grantedPerms.publish_stream) {
                this.postToGraph(wallId, 'feed', post, theCallback);
                return true;
            }
            return false;*/
        },

        getUserInformation: function (attr,theCallback) { 
            var attr = attr || '';
            FB.api('/me/'+ attr,'get', theCallback);
        },

        postToGraph: function (objectID, stream, post, theCallback) {
            if (arguments.length < 3) {
                throw new Error('Not enough arguments to post to Facebook Graph');
            }
            var postObj = (typeof post === 'string') ? JSON.parse(post) : post, callback = this.findCallback(theCallback);
            FB.api('/' + objectID + '/' + stream, 'post', postObj, callback);
        },


        invokeDialog: function (dialog, theCallback) {
            if (arguments.length < 1) {
                throw new Error('Not enough arguments to invoke Facebook dialog');
            }
            var dialogObj = (typeof dialog === 'string') ? JSON.parse(dialog) : dialog, callback = this.findCallback(theCallback);
            FB.ui(dialogObj, callback);
        },


        addToPage: function () {
            FB.ui({
                method: 'pagetab'
            },
            function (response) {
                if (response != null && response.tabs_added != null) {
                    $.each(response.tabs_added, function (pageid) {
                        console.log(pageid);
                    });
                }
            });
        },


        // Sería bueno pasar estos callbacks por el API this.findCallback(), el cual tendría que extender para lidiar no sólo con callbacks undefined pero también null,
        // ya que aquí se pueden dar los dos casos.
        monitorLikeActivty: function (theUrl, likeCallback, unlikeCallback) {
            if (typeof likeCallback === 'undefined') {
                throw new Error('Invalid like event callback parameter');
            }
            if (typeof unlikeCallback === 'undefined') {
                throw new Error('Invalid unlike event callback parameter');
            }

            if (likeCallback !== null) {
                FB.Event.subscribe('edge.create', function (response) {
                    console.dir(arguments);

                    if (theUrl === response) {
                        likeCallback();
                    }
                    else if (theUrl === '') {
                        likeCallback();
                    }
                });
            }
            if (unlikeCallback !== null) {
                FB.Event.subscribe('edge.remove', function (response) {
                    console.dir(arguments);

                    if (theUrl === response) {
                        unlikeCallback();
                    }
                    else if (theUrl === '') {
                        unlikeCallback();
                    }
                });
            }
        },


        /*
        findObjectLikeStatus: function (pageId, result) {
        //https://developers.facebook.com/docs/reference/api/user/ likes -> belongs
        // ejemplo 1: https://developers.facebook.com/tools/explorer/?method=GET&path=me/likes/19292868552
        // ejemplo 2: https://developers.facebook.com/tools/explorer/?method=GET&path=me%2Flikes%2F367116489976035
        // ejemplo 3: https://developers.facebook.com/tools/explorer/?method=GET&path=me/likes
            if (!this.grantedPerms.user_likes) {
                result = -1;
                return;
            }
            FB.api('/me/likes/' + pageId + '?access_token=' + this.authResponse.accessToken, $.proxy(function (response) {
                console.log('API call done, result:');
                console.dir(response);
                result = response.data[0] ? 1 : 0;
            }, this));
        },

        // Una forma de usar este método sería la siguiente (pero no esta del todo funcional, hay que investigar.):
        var likeStatus1 = {
            completed: false,
            result: -1
        };
        fbBridge.findObjectLikeStatus('133363876762739', likeStatus1);
        var interval1 = setInterval(function () {
            if (!likeStatus1.completed) {
                console.log('api call not ready, waiting...');
                return;
            }
            console.log('likeStatus1' + likeStatus1.result);
            clearInterval(interval1);
        }, 500);
        */


        findCallback: function (theCallback) {
            var callback;
            switch (typeof theCallback) {
            case 'string':
                var parts = theCallback.split('.');
                callback = window;
                for (var i = 0; i < parts.length; i += 1) {
                    callback = callback[parts[i]];
                }
                break;
            case 'function':
                callback = theCallback;
                break;
            case 'undefined':
                callback = null;
                break;
            }
            return callback;
        },

        getVersion: function () {
            return this.version.major + '.' + this.version.minor + '.' + this.version.patch;
        }
    }

    return self;
}();
