var Request = function (args) {

	var payload = args ? args.payload : null;
		interface = args ? args.interface : null;
	
	this.status = '';
	this.requestIndex = 0;
	this.responseHandler = args ? args.responseHandler : null;
	this.xhr = null;

	this.submit = function () {

		var ajaxSuccess = true;
		var responseObject = {};

		this.status = 'onCourse';
		this.requestIndex = requestManager.addRequest(this);

		if (this.responseHandler === null || typeof(this.responseHandler) !== 'function' ) { 
			throw new Error("No Callback defined");
		}

		/*URL DE PRUEBA*/
		/*http://wattoapps1.local/pepsi_tiendaVirtual/php/interfaces/IArticles?user=1&article=1&fbUserId=616686169&accessToken=AAAEYxR8Wjz4BAJsYnUQCuCSuc9EIjsvHy3QwSmoddujCTh8aQg5yvbetPRRmK4DMcJKZCaPd6qCNiYTDUCiV5vcZC6cNy8ZAWPt77vIbAZDZD*/

		/*Snippet for recreate the invalid session message*/
		/*if (localStorage.getItem("accessToken") === null) {

			localStorage.setItem("accessToken", authResponse.accessToken);
			this.payload.accessToken = localStorage.getItem("accessToken");

		} else { 
			this.payload.accessToken = localStorage.getItem("accessToken");
		}*/
		
		payload.fbUserId = application.user.id;

		this.xhr = $.ajax({
			           	url: application.baseDataURL + interface +'.php',
			            data: payload,
			            dataType: 'jsonp',
			            success: $.proxy(function (response, textStatus, jqXHR) {
			            	if (response.error) { 
			            		printObject(response);
			            		//printObject(jqXHR);
			            		console.log("statusCode " + jqXHR.statusCode());
			            		console.log("statusText " + jqXHR.statusText);
			            		console.log("readyState " + jqXHR.readyState);
			            		requestManager.deleteRequest(this.requestIndex);
			            	}

							if (response.data) { 
								printObject(response);
								this.responseHandler(response, this.requestIndex);

							}

			            	console.log("textStatus " + textStatus);
			            }, this),
			            error: $.proxy(function (jqXHR, textStatus, errorThrown) {

			            	//printObject(jqXHR);
			            	console.log("URL " + application.baseDataURL + interface + '.php');
			            	console.log("textStatus " + textStatus);
			            	console.log("errorThrown " + errorThrown);
			            	console.log("status " + status);

			            	//this.responseHandler(responseObject, $.proxy(this.requestIndex, this));

			            },this)
			        });
		
		//this.xhr.abort();
	};

}

var requestManager = {
	requestArray: [],
	checkInterval: 10000,

	start: function () { 
		setTimeout($.proxy(this.checkRequests, this), this.checkInterval);
	},

	addRequest: function (request) {

		var requestIndex = this.requestArray.push(request);
		console.log("Request Added");
		console.log("Request Status " + request.status);
		console.log("requests length " + this.requestArray.length);
		return requestIndex - 1;

	},
	deleteRequest: function (index) { 
		console.log("Request Status " + this.requestArray[index].status );
		console.log("Request deleted");
		console.log("request Index " + index );
		this.requestArray.splice(index);

	},
	checkRequests: function () {

		var completedRequests = [],i;

		for (i = 0; i < this.requestArray.length; i++) {

			if (this.requestArray[i].status === 'Failed') {
				this.requestArray[i].submit();
			}

		}

	},
	cancelRequests: function () {
		var i;
		for (i = 0; i < this.requestArray.length; i++) {
			if (this.requestArray[i].xhr) {
				this.requestArray[i].xhr.abort();
				this.requestArray.status === 'Failed';
			}  
		}
	},
	flush: function () {
		this.requestArray.length = 0;
	}

}