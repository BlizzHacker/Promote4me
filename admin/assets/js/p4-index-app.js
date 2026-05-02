var API_ADDRESS = 'http://localhost:8888/p4svc/basic/web';
var SITE_URL = 'http://localhost:8888/p4admin';
var SUBSCRIBER_API = API_ADDRESS + "/subscriber";
var MESSAGE_API = API_ADDRESS + "/message";
var MAPS_API_KEY = 'AIzaSyCOpu4ZWRb_FFud27J-LI3zrKNyNzYmau4';

$(document).ready(function(){
	$.ajax({
		method : "GET",
		url : API_ADDRESS + '/auth/validatetoken',
		success : function(data)
		{
			if(data.validation)
			{
				window.location.href = SITE_URL + "/dashboard";
			}
			else
			{
				window.location.href = SITE_URL + "/login";
			}
		}
	});
});