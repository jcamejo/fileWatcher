
var challengeFactory = {

    sendRequest: function (response, challenge) { 
        var request, args = {};
        var response = response || {};

        response.userId = application.user.id;
        response.action = challenge.action;
        response.platform = challenge.platform;

        args.payload = response;
        args.interface = 'challenge';
        args.responseHandler = this.challengeCallback;

        request = new Request(args);
        request.submit();

    },
    challengeCallback: function (response, requestIndex) { //addChallengesCoins
        var status = "Undefined";

        switch (status) { 

            case 'Success':

                var challengeStatus = document.getElementById("challengeStatus");
                challengeStatus.textContent = "El reto se ha completado satisfactoriamente";

                document.getElementById("challengeStatusImage").src = application.checkImageUrl;
                document.getElementById("coins").textContent = application.user.coins;
                $('#showDialog').overlay(application.overlayDialogOpts).load();
                application.navStack[application.navStack.length] = '#showDialog';
                requestManager.deleteRequest(requestIndex);
                break;

            case 'Failed':
                
                var challengeStatus = document.getElementById("challengeStatus");
                challengeStatus.textContent = "No se ha podido registrar el reto";

                document.getElementById("challengeStatusImage").src = application.errorImageUrl;
                $('#showDialog').overlay(application.overlayDialogOpts).load();
                application.navStack[application.navStack.length] = '#showDialog';
                requestManager.requestArray[requestIndex].status = 'Failed';
                break;

            default:
                console.log("challenge callback");
                break;
        
        }
    }
};


challengeFactory.facebook = {
    challenge: null,

    init: function (theChallenge) {
        console.log('initing facebook');
        this.challenge = theChallenge;
    },
    
    
    execute: function () {
        console.log('executing action ' + this.challenge.action + ' for platform ' + this.challenge.platform);
        
        if (this.challenge.action && this.challenge.action !== '') { 
            this[this.challenge.action]();
        } else { 
            throw new error ("Challenge action not found")
        }
    },
    
    
    /* Ejemplo de completion handler */
    onFinish: function (response) {
        switch (this.challenge.action) {
        case 'share':

            var value = this.challenge.value, challengeId = this.challenge.id;
            var challengeStatus = document.getElementById("challengeStatus"), request;

            if (response.post_id) { 
                application.addChallengeCoins(value, challengeId);
                challengeFactory.sendRequest(response, this.challenge);
            } else { 
                challengeStatus.textContent = "El reto no ha sido realizado";
                document.getElementById("challengeStatusImage").src = application.errorImageUrl;
                $('#showDialog').overlay(application.overlayDialogOpts).load();
                application.navStack[application.navStack.length] = '#showDialog';
            }

            break;
        case 'friendRequest':
            var challengeStatus = document.getElementById("challengeStatus");
            var value = this.challenge.value;
            var challengeId = this.challenge.id;

            if(response.request) { 
                application.addChallengeCoins(value,challengeId);
                challengeFactory.sendRequest(response,this.challenge);

                var challengeList = document.getElementById("challengeList");
                $('[data-challengeid='+this.challenge.id+']', challengeList).parent().remove();
            } else { 
                challengeStatus.textContent ="El reto no ha sido realizado";
                document.getElementById("challengeStatusImage").src = application.errorImageUrl;
                $('#showDialog').overlay(application.overlayDialogOpts).load();
                application.navStack[application.navStack.length] = '#showDialog';
            }
            break;
        }
    },
    
    
    share: function () {
        console.log('facebook, sharing:');

        var fbFeedParams = this.challenge.params || null;
        if(!fbFeedParams) { 
            throw new Error("No facebook Feed params");
        }
        var shareDialog = new FbDialog(fbFeedParams);
        fbBridge.invokeDialog(shareDialog, $.proxy(this.onFinish,this));
    },
    
    
    friendRequest: function () {
        var fbFriendParams = this.challenge.params || null;

        if (!fbFriendParams) { 
            throw new error ("Not enough Params for Friend Request");
        }
        var requestDialog = new FbDialog(fbFriendParams);
        fbBridge.invokeDialog(requestDialog, $.proxy(this.onFinish,this));
    }
};

/*
    Definición de cada challenge command: 2 Twitter.
    
    Cada challenge command se adhiere a un API "público" por medio del cual se inicializa, dispara su ejecución, y realiza cualquier otra actividad que sea
    común a todos los commands (e.g. completion handler). A través de API's "privados", cada comando discierne la acción que tiene que ejecutar (challenge.action)
    y cómo ejecutarla (challenge.params).
*/
challengeFactory.twitter = {
    challenge: null,
    overlay: true,

    init: function (theChallenge) {
        console.log('initing twitter');
        this.challenge = theChallenge;
    },
    
    
    execute: function () {
        console.log('executing action ' + this.challenge.action + ' for platform ' + this.challenge.platform);

        document.getElementById('tweet').value = this.challenge.params.text || '';
        if (localStorage.getItem(twitterBridge.localStorageKey)) {
            if (!twitterBridge.OAuth) {
                console.log("twitterLogin");
                twitterBridge.login(); 
            }
            
            var newOverlayOpts = $.extend(true, {}, application.overlayOpts, {
                    onBeforeLoad: null,
                    load:true,
                    mask: null
            });
            $('#showChallenge').overlay(newOverlayOpts).load();
            application.navStack[application.navStack.length] = '#showChallenge';
        } else { 
//          application.twitterLogin($.proxy(this.showOverlay,this));
            twitterBridge.login($.proxy(this.showOverlay,this));

        }
    },

    onError: function(data) { 
        $('#showChallenge').overlay().close();

        var challengeStatus = document.getElementById("challengeStatus");
        challengeStatus.textContent = "Error en el tweet";
        document.getElementById("challengeStatusImage").src = application.errorImageUrl;
        setTimeout($('#showDialog').overlay(application.overlayDialogOpts).load,1000);
        application.navStack[application.navStack.length] = '#showDialog';

    },
    onSuccess: function (data) {
        var value = this.challenge.value;
        var challengeId = this.challenge.id;
        var entry = JSON.parse(data.text || 'null');

        $('#showChallenge').overlay().close();
        challengeFactory.sendRequest(entry, this.challenge);
        setTimeout($.proxy(application.addChallengeCoins,application),1000,[value, challengeId]);
    },

    showOverlay: function () { 
        var newOverlayOpts = $.extend(true, {}, application.overlayOpts, {
            onBeforeLoad: null,
            load:true
        });
        $('#showChallenge').overlay(newOverlayOpts).load();
        application.navStack[application.navStack.length] = '#showDialog';
        $("#tweetArea").removeClass("hidden");
    },

    onFinish: function () {
        
    },

    tweet: function () {
        twitterBridge.tweet($.proxy(this.onSuccess,this), $.proxy(this.onError,this));
    },
};

challengeFactory.web = {
    challenge: null,
    overlay: true,

    init: function (theChallenge) {
        console.log('initing facebook');
        this.challenge = theChallenge;
    },
    
    
    execute: function () {
        console.log('executing action ' + this.challenge.action + ' for platform ' + this.challenge.platform);
        this[this.challenge.action]();
    },

    video: function () {
        console.log('Showing video');
        var value = this.challenge.value, response;
        var videoUrl = this.challenge.params.videoUrl;
        var challengeId = this.challenge.id;

        if (!videoUrl) { 
            throw new Error("No videoUrl given");
        }

        application.clientBrowser.openExternal(videoUrl);
        setTimeout($.proxy(application.addChallengeCoins,application),10000,[value, challengeId]);
        challengeFactory.sendRequest(response,$.proxy(this.challenge, this));
    },

};


/*
    Extracción de un objeto challenge del arreglo de respuesta en base de un id recibido, e.g. del dataset de algún nodo HTML sobre el cual el usuario hizo tap.
    La extracción tiene que ser, por supuesto, con un uso adecuado del método de extensión get, pasando un comparador apropiado.
    
    Posterior a la extracción del challenge, se obtiene un objeto comando de la factoría en base a la abstracción de la propiedad 'platform' que tienen todos los
    objetos challenge. Al extraer tal comando, se inicializa este mismo con el challenge extraído y, finalmente, se ejecuta el comando que ahora ya está completamente
    inicializado, tanto para la plataforma del challenge como para la action a ejecutar.
*/
/*var theChallenge = response.data.challenges.get(id);
var challengeCommand = challengeFactory[theChallenge.platform];
challengeCommand.init(theChallenge);
challengeCommand.execute();*/
