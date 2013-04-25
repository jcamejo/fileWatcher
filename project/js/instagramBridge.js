/*
$Id: instagramBridge.js 59 2013-02-13 17:06:15Z jcamejo $
*/
'use strict';


var instagramBridge = {
    args: {},
    startDelegate: null,
    resultsNodeId: 'photoSlider',
    resultsNode: null,
    authURL: '',
    likesURL: 'https://api.instagram.com/v1/users/self/media/liked',
    userName: '',
    localStorageKey:'',
    accessToken: '',
    errorTimeout: 10000,
    myScrollPhoto: null,
    responseType: '',
    scope:'',
    media: [],
    oAuthSettings: {
        client_id: '',
        redirect_uri: '',
        response_type: '',
        scope:''
    },
        
    
    init: function (args) {
        this.args = args || this.args;
        this.userName = this.args.userName;
        /*if (!this.userName) {
            throw new Error('Invalid userName, cannot continue.');
        }
        this.clientId = this.args.clientId;
        if (!this.clientId) {
            throw new Error('Invalid clientId, cannot continue.');                    
        }
        this.resultsNodeId = this.args.resultsNodeId || this.resultsNodeId;
        this.resultsNode = document.getElementById(this.resultsNodeId);
        if (!this.resultsNode) {
            throw new Error('Unexistent results node Id "' + this.resultsNodeId + '", cannot continue.');                    
        }
        this.startDelegate = this.args.startDelegate;*/
        this.oAuthSettings.client_id =  this.args.client_id;
        if (!this.oAuthSettings.client_id) {
            throw new Error('Invalid clientId, cannot continue.');                    
        }
        this.oAuthSettings.redirect_uri = this.args.redirect_uri;
        if (!this.oAuthSettings.redirect_uri) {
            throw new Error('Invalid redirectUri, cannot continue.');                    
        }
        this.oAuthSettings.response_type = this.args.response_type;
        this.oAuthSettings.scope = this.args.scope;
        this.localStorageKey = 'instagramKey';
    },
    
    
    start: function () {
        var data = {
            userName: this.userName,
            clientId: this.clientId
        };
                
        this.authURL = application.baseDataURL + 'IInstagram.php';
        var timeoutId = setTimeout($.proxy(function () {
            this.ajaxErrorHandler({
                queryType: 'accessToken',
                reason: 'timeout'
            }, 'error');
        }, this), this.errorTimeout);
        $.ajax({
            url: this.authURL,
            data: data,
            dataType: 'jsonp',
            success: $.proxy(function (response, textStatus, jqXHR) {
                clearTimeout(timeoutId);
                this.authSuccessHandler(response, textStatus, jqXHR);
            }, this)
        });        
    },
    
    
    authSuccessHandler: function (response, textStatus, jqXHR) {
        this.accessToken = response.data.accessToken || '';
        if (this.accessToken && this.startDelegate) {
            this.startDelegate();
        }
    },
    
    
    fetchLikes: function () {
        var randomPhoto;

        if (!this.accessToken) {
            throw new Error('Empty access token, cannot continue');
        }
        var data = {
            access_token: this.accessToken
        };       
        var timeoutId = setTimeout($.proxy(function () {
            this.ajaxErrorHandler({
                queryType: 'likes',
                reason: 'timeout'
            }, 'error');
        }, this), this.errorTimeout);
        $.ajax({
            url: this.likesURL,
            data: data,
            dataType: 'jsonp',
            success: $.proxy(function (response, textStatus, jqXHR) {
                $('.loaderInstagram').removeClass('hidden');
                clearTimeout(timeoutId);
                var photoSlider = document.getElementById("photoSlider");
                 while (photoSlider.firstChild) {
                     photoSlider.removeChild(photoSlider.firstChild);
                 }
                 
                for (var i = 0; i < response.data.length; i += 1) {
                    this.processMedia(response.data[i]);
                }    
                 
                var mainPhotoContainer = document.getElementById("mainPhotoIns");

                if(mainPhotoContainer.getAttribute("src") ===""){ 
                    var firstPhoto = document.getElementById("photoSlider").firstElementChild;
                    application.changePhoto(firstPhoto);
                }
                $('#scrollerPhoto').css("width", application.photoWidth * response.data.length);

                if(this.myScrollPhoto === null){
                    this.myScrollPhoto = new iScroll('photoContainer', {
                        hScrollbar:false,
                        momentum:true,
                        bounce: true
                    });
                }else{
                    this.myScrollPhoto.refresh();
                }
                
                $('.loaderInstagram').addClass('hidden');
                $('#scrollerPhoto').css("width", application.photoWidth * response.data.length);
                var randomNumber = Math.floor(Math.random() * response.data.length);
                randomPhoto = response.data[randomNumber];

                $('.homeInstImage').attr("src", randomPhoto.images.standard_resolution.url);
                $('#labelText').text("@" + randomPhoto.user.username.toUpperCase());

            }, this)
        }).done(function() { 

            $('.photo').on('click',function(event){
              event.preventDefault();
              application.changePhoto($(this).get(0));
            });         
           
        }); 

        
           
    },
    
    
    processMedia: function (mediaObj) {
        var captionText = mediaObj.caption === null ? '': mediaObj.caption.text;
        var standardURL = mediaObj.images.standard_resolution.url === null ? '': mediaObj.images.standard_resolution.url;
        var username = mediaObj.user.username.toUpperCase();
        var mediaHTML = '<li class="photo"><div class="imageThumb"><img class="image" alt="' + captionText + '" src="' + standardURL + '"><div class="subtitleIns"><h6 class="littleUsernameInst">@ '+ username + '</h6><div class="photoSection"><img src="images/instagram_white.png" height="20" width="20"></div></div></div></li>';
        $(this.resultsNode).append(mediaHTML);
    },
    
    
    ajaxErrorHandler: function (jqXHR, textStatus, errorThrown) {
        alert('Ocurrió un error buscando las fotos, por favor espere unos minutos.');
    }
};
var igBridge = instagramBridge;
