var app = angular.module('app', ['ngRoute']);

var API_ADDRESS = "https://api.promote4.me";
var APP_ADDRESS = "https://mobile.promote4.me";

function redirect(path)
{
	window.location.href = APP_ADDRESS + "/" + path;
}

function checkToken()
{
	if(localStorage.token == null || localStorage.token == undefined || localStorage.token == "null")
	{
		redirect('login.html');
	}
}

function show_loader()
{
	$('.loader').fadeIn();
}

function hide_loader()
{
	$('.loader').fadeOut();
}

app.config(function($routeProvider,$sceDelegateProvider,$locationProvider){
	$routeProvider
	.when('/', { templateUrl : 'views/home.html' , controller : 'homeController' })
	.when('/dashboard', { templateUrl : 'views/dashboard.html' , controller : 'dashboardController' })
	.when('/checkin', { templateUrl : 'views/checkin.html' , controller : 'checkinController' })
	.when('/locations', { templateUrl : 'views/locations.html' , controller : 'locationController' })
	.when('/messages', { templateUrl : 'views/messages.html' , controller : 'messagesController' })
	.when('/team', { templateUrl : 'views/team.html' , controller : 'teamController' })
	.when('/settings', { templateUrl : 'views/settings.html' , controller : 'settingsController' })
	.when('/logout', { templateUrl : 'views/logout.html' , controller : 'authController' })
	.when('/login', { templateUrl : 'views/login.html' , controller : 'authController' });

	$sceDelegateProvider.resourceUrlWhitelist([
	    'self',
	    /^https?:\/\/(cdn\.)?promote4.me/
	  ]);
	
	$locationProvider.html5Mode(true);
});

app.directive('fileOnChange', function() {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var onChangeHandler = scope.$eval(attrs.fileOnChange);
      element.bind('change', onChangeHandler);
    }
  };
});

app.controller('sidebarController',function($scope){
	$scope.showingSidebar = false;
	
	$scope.logout = function()
	{
		localStorage.token = null;
		redirect('login.html');
	};

	$scope.showSidebar = function()
	{
		if(!$scope.showingSidebar)
		{
			$('#sidebar').animate({ 'margin-left' : '0px' });
			$scope.showingSidebar = true;
		}
		else
		{
			$('#sidebar').animate({ 'margin-left' : '-90px' });
			$scope.showingSidebar = false;
		}
	}
});

app.controller('masterController',function($scope){

	angular.element(document).ready(function () {
		var window_width = $(window).outerWidth();
		var sidebar_margin = $('#sidebar').css('margin-left').replace('px','');
		var sidebar_width = $('#sidebar').outerWidth();
		var page_container_padding = $('#page').css('padding-left');

		page_container_padding = parseInt(page_container_padding);

		sidebar_margin = parseInt(sidebar_margin);

		$('#page').width(window_width + sidebar_margin + 10);
		$('#page_spillover').width(window_width + sidebar_width);
    });

    angular.element(window).resize(function () {
		var window_width = $(window).outerWidth();
		var sidebar_margin = $('#sidebar').css('margin-left').replace('px','');
		var sidebar_width = $('#sidebar').outerWidth();
		var page_container_padding = $('#page').css('padding-left');

		page_container_padding = parseInt(page_container_padding);

		sidebar_margin = parseInt(sidebar_margin);

		$('#page').width(window_width + sidebar_margin + 10);
		$('#page_spillover').width(window_width + sidebar_width);
    });
});

app.controller('homeController',function(){
	var token = localStorage.token;

	if(token == "null" || token == "undefined")
	{
		window.location.href = "login.php";
	}
	else
	{
		window.location.href = "/dashboard";
	}
});

app.controller('dashboardController',function($scope,$http){
	$scope.date = Date.now();
	show_loader();

	console.log(localStorage);

	var token = localStorage.token;

	console.log(token);

	if(token == null || token == undefined)
	{
		window.location.href = "login.php";
	}
	
	$http.get(API_ADDRESS + "/user/dashboard?token=" + localStorage.token)
	.success(function(data){
		hide_loader();
		if(data.status == "ok")
		{	
			$scope.schedule = data.schedule;
			$scope.photos_month = data.photos_month;
			$scope.photos_week = data.photos_week;
			$scope.photos_day = data.photos_today;
		}
	});
});

app.controller('checkinController',function($scope,$http){
	$scope.openFileWindow = function()
	{
		$('#photo_upload').click();
	}

	$scope.uploadPhoto = function(event)
	{
		var position = { "lat" : 0 , "lng" : 0 }

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(function(position){
				var files = event.target.files;
				var data = new FormData();

				if(files.length > 0)
				{
					data.append("p4_image_upload",files[0]);
					data.append("lat",position.coords.lat);
					data.append("lng",position.coords.lng);
				}

				$.ajax({
			        url: API_ADDRESS + '/upload/image?token=' + localStorage.token,
			        type: 'POST',
			        data: data,
			        cache: false,
			        dataType: 'json',
			        processData: false, // Don't process the files
			        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
			        success: function( data , textStatus , jqXHR )
			        {
			        },
			        error: function(jqXHR, textStatus, errorThrown)
			        {
			            // Handle errors here
			            console.log('ERRORS: ' + textStatus);
			            // STOP LOADING SPINNER
			        }
			    });
			});
		} else {
			alert("Geolocation is not supported by this browser.");
		}
	}
});

app.controller('locationController',function($scope,$http){
	$scope.locations = [];
	show_loader();

	navigator.geolocation.getCurrentPosition(function(position){
		var lat = position.coords.latitude;
		var lng = position.coords.longitude;

		$http.get(API_ADDRESS + '/geo/nearby?lat=' + lat +'&lng=' + lng + '&token=' + localStorage.token)
		.success(function(data){
			hide_loader();
			
			if(data.locations.length > 0)
			{
				$scope.locations = data.locations;
			}
		});
	});

	$scope.nearLocations = function()
	{
		show_loader();

		$('#nearby_locations').removeClass('btn-default').addClass('btn-primary');
		$('#all_locations').addClass('btn-default').removeClass('btn-primary');

		navigator.geolocation.getCurrentPosition( function( position ) {

			var lat = position.coords.latitude;
			var lng = position.coords.longitude;

			$http.get( API_ADDRESS + '/geo/nearby?lat=' + lat +'&lng=' + lng + '&token=' + localStorage.token )
			.success( function( data ) {
				$scope.locations = data.locations;
				hide_loader();
			});
			
		});
	}

	$scope.allLocations = function() {

		show_loader();
		$('#nearby_locations').addClass('btn-default').removeClass('btn-primary');
		$('#all_locations').removeClass('btn-default').addClass('btn-primary');
		
		$http.get( API_ADDRESS + '/subscriber/locations?token=' + localStorage.token )
		.success( function( data ){

			$scope.locations = data;
			hide_loader();

		});

	}
});

app.controller( 'messagesController' , function( $scope , $http ) {
	$scope.composeMessage = { "to" : null , "body" : null };

	$http.get( API_ADDRESS + '/message/inbox?token=' + localStorage.token )
	.success( function( data ) {
		$scope.messages = data;
	});

	$http.get( API_ADDRESS + '/user/teammembers?token=' + localStorage.token )
	.success( function( data ) {
		$scope.users = data;
	});

	$scope.deleteMessage = function( message , $event ) {
		$http.get( API_ADDRESS + '/message/' + message.message_id + '/delete?token=' + localStorage.token )
		.success(function(data){

			if (data.status == "ok") {

				$( $event.currentTarget ).closest( '.message' ).fadeOut().promise().done( function() {

					$( this ).remove();

				});

			}

		});
	};

	$scope.messageReply = function( message ) {
		$( '#to_user' ).children( 'option' ).removeAttr( 'selected' );
		$( '#to_user' ).find( 'option[value=' + message.from_user_id + ']' ).attr( 'selected' , 'selected' );
		$( '#message_modal' ).modal( 'show' );
	}

	$scope.sendMessage = function( composeMessage ) {
		var message_object = { "msg" : { "to" : composeMessage.to , "body" :composeMessage.body } };

		$http.post( API_ADDRESS + '/message/send?token=' + localStorage.token, message_object )
		.success( function( data ) {

			if( data.status == "ok" ) {

				$( '#message_sent' ).fadeIn();
				$( '#message_modal' ).modal( 'hide' );
				
				setTimeout( function() { $('#message_sent').fadeOut(); } , 3000 );

			}

		})
	};

	$scope.expandMessage = function( $event ) {
		var message_element = $( $event.currentTarget );
		var toElement = $( $event.toElement );

		if ( !toElement.is('i') ) {

			if ( $( message_element).is( '.message_options_shown' ) ) {

				$( message_element).removeClass( 'message_options_shown' ).find( '.message_options' ).slideUp();

			} else {

				$( '.message_options_shown' ).removeClass( 'message_options_shown' ).find( '.message_options' ).slideUp();
				$( message_element ).find( '.message_options').slideDown();
				$( message_element ).addClass( 'message_options_shown' );

			}

		}
	};
});

app.controller( 'teamController' , function( $scope , $http ) {
	$http.get( API_ADDRESS + "/user/teammembers?token=" + localStorage.token )
	.success( function( data ) {
		$scope.team = data;
	});
	
	$scope.message_member = function(member) {
		$( '#to_user' ).children( 'option' ).removeAttr( 'selected' );
		$( '#to_user' ).find( 'option[value=' + member.user_id + ']' ).attr( 'selected' , 'selected' );
		$( '#message_modal' ).modal( 'show' );
	};
});

app.controller( 'settingsController' , function( $scope , $http ) {
	show_loader();

	$http.get( API_ADDRESS + "/subscriber/currentuser?token=" + localStorage.token ).success( function( data ) {
		hide_loader();
		$scope.user = data;
	});
	
	$scope.updateUser = function( user ) {

		show_loader();

		var user_obj = { "first_name" : user.first_name, "last_name" : user.last_name, "email_address" : user.email_address , "phone_number" : user.phone_number };
		
		$http.post( API_ADDRESS + '/subscriber/user/' + user.user_id + '/edit?token=' + localStorage.token , user_obj )
		.success( function( data ){
			hide_loader();
		});

	}
	
	
	$( '#change_password' ).click( function() {

		var current = $( '#cp' ).val();
		var new_pass = $( '#np' ).val();
		var confirm = $( '#cnp' ).val();
		
		if ( new_pass === confirm ) {

			$( '#password_mismatch' ).addClass( 'hidden' );
			$( '#np,#cnp' ).parent().removeClass( 'has-error' );

			$.ajax({
				url : API_ADDRESS + "/auth/changepassword?token=" + localStorage.token,
				method : "POST",
				data : { "cp" : current , "np" : new_pass },
				success : function(data) {

					if ( data.status == "ok" ) {
						$( '#change_password_modal' ).modal( 'hide' );
						$( '#password_change_success' ).removeClass( 'hidden' );
					}

					if ( data.status == "bad_password" ) {
						$( '#bad_password' ).removeClass( 'hidden' );
					}

				}
			});
		} else {

			$( '#np,#cnp' ).parent().addClass( 'has-error' );
			$( '#np,#cnp' ).val( '' );
			$( '#password_mismatch' ).removeClass( 'hidden' );
			
		}
	});
});

app.controller('authController',function($scope,$http){
	
	var has_storage = typeof Storage !== "undefined";
	
	if ( !has_storage ) {
		alert( "Your browser does not support the features of Promote4Me. Please upgrade your browser or OS" );
	}

	$scope.login = function( $event ) {

		if ( has_storage ) {

			$.ajax({
				url : API_ADDRESS + "/auth/authenticate.php",
				method : "POST",
				data : { "email_address" : $scope.auth.email_address , "password" : $scope.auth.password },
				success : function( data ){

					if( data.status === "ok" ) {
						localStorage.token = data.token;
						redirect( '#/dashboard' );
					} else {
						$( '#login_error' ).fadeIn();
					}
				}
			});

		}

	}

});