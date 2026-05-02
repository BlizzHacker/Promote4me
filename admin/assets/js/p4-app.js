var API_ADDRESS = 'https://api.promote4.me';
var SITE_URL = 'https://admin.promote4.me';
var SUBSCRIBER_API = API_ADDRESS + "/subscriber";
var MESSAGE_API = API_ADDRESS + "/message";
var MAPS_API_KEY = 'AIzaSyCMslYApKwAXRRq64msnh3Uo4B8CfaPdWA';
var ALL_USERS = [];

$(document).ready(function(){
	$.ajaxSetup({
		dataType : 'json'
	});

	$.ajax({
		url : SUBSCRIBER_API + '/users?token=' + $.cookie('access_token'),
		success : function(data)
		{
			$(data).each(function(){
				$('#p4_user_selector,#team_user_selector').append("<option value='" + this.user_id + "'>" + this.first_name +  " " + this.last_name + "</option>");
			});
		}
	});
	
	$('#create_team').popover({
		container: "body",
		title : "Create Team",
    	html: true, 
		content: function() {
			return '<div class="row"><div class="col-md-8"><input class="form-control" type="text" placeholder="My Team" id="team_name" /></div><div class="col-md-4"><button class="btn btn-primary btn-block" id="add_team">Add</button></div></div>';
		}
	});
	
	$('#add_to_team').click(function(){
		var team_id = $('#team_modal').data("team-id");
		var user_id = $('#team_user_selector').val();
		
		$.ajax({
			url : SUBSCRIBER_API + '/team/' + team_id + '/addUser?token=' + $.cookie('access_token'),
			type : 'post',
			data : { "user_id" : user_id },
			success : function(data){
				hide_modal_loader();
				
				if(data.status == "ok")
				{
					var user_name = $('#team_user_selector').find('option[value=' + user_id + ']').text();
					var split_name = user_name.split(' ');
					var first_name = split_name[0];
					var last_name = user_name.replace(first_name,'').trim();
					$('#team_member_table').find('tbody').append('<tr data-user-id="' + user_id + '"><td>' + first_name + '</td><td>' + last_name + '</td><td><button class="btn btn-danger remove_from_team">REMOVE</button></td></tr>');
				}
			}
		});
	});
	
	$('body').on('click','.remove_from_team',function(){
		var team_id = $('#team_modal').data("team-id");
		var user_id = $(this).closest('tr').data("user-id");
		
		var this_element = this;
		
		$.ajax({
			url : SUBSCRIBER_API + '/team/' + team_id + '/removeUser?token=' + $.cookie('access_token'),
			type : 'post',
			data : { "user_id" : user_id },
			success : function(data){
				hide_modal_loader();
				
				if(data.status == "ok")
				{
					$(this_element).closest('tr').remove();
				}
			}
		});
	});
	
	$('body').on('click','.p4_team_selector',function(){
		show_modal_loader();
		
		var team_id = $(this).data('team-id');
		
		$.ajax({
			url : SUBSCRIBER_API + '/team/' + team_id + '/?token=' + $.cookie('access_token'),
			type : 'get',
			success : function(data){
				hide_modal_loader();
				$('#current_team_name').text(data.name);
				$('#team_member_table').find('tbody').empty();
				
				$(data.members).each(function(){
					var first_name = this.first_name;
					var last_name = this.last_name;
					var user_id = this.user_id;
					
					$('#team_member_table').find('tbody').append('<tr data-user-id="' + user_id + '"><td>' + first_name + '</td><td>' + last_name + '</td><td><button class="btn btn-danger remove_from_team">REMOVE</button></td></tr>');
				});
			}
		})
		
		$('#team_modal').attr("data-team-id",team_id);
		$('#team_modal').modal('show');
	});
	
	$('body').on('click',"#add_team",function(e){
		$('body').find('#team_name').addClass('disabled');
		$('body').find('#add_team').addClass('disabled');
		
		$.ajax({
			url : SUBSCRIBER_API + "/addteam?token=" + $.cookie('access_token'),
			type : 'POST',
			data : {
				"name" : $('body').find('#team_name').val()
			},
			success: function(data)
			{
				if(data.status == "ok")
				{
					$('#team_menu').append('<li><a href="javascript:;">' + $('body').find('#team_name').val() + '</a></li>');
					$('body').find('#team_name').val('').removeClass('disabled');
					$('body').find('#add_team').removeClass('disabled');
					$('#create_team').popover('hide');
				}
			}
		});
	});
	
	$('body').on('keydown','#team_name',function(e){
		if(e.which == 13) {
    	$('body').find('#add_team').click();
    }
	});

	$('#login_form').submit(function(e){
		e.preventDefault();
		
		$('#p4_login_btn').addClass('disabled').text("Logging you in...");
		
		var email_address = $('#p4_login_email').val();
		var password = $('#p4_login_password').val();

		var to_send = { "email_address" : email_address , "password" : password };

		$.ajax({
		  type: "POST",
		  url: API_ADDRESS + "/auth/authenticate",
		  data: to_send,
		  success: function(ret)
		  {
		  	if(ret.status == "ok")
		  	{
		  		$.cookie("access_token",ret.token, { expires : 7 , path : "/", domain : "promote4.me" });
					$.cookie("access_token",ret.token, { expires : 7 , path : "/", domain : "admin.promote4.me" });
					
					setTimeout(function(){
						window.location.href = SITE_URL + '/dashboard';
					}, 500);
		  	}
				else
				{
					$('#login_failure').fadeIn();
					$('#p4_login_btn').removeClass('disabled').text("Login");
				}
		  }
		});
	});
	
	$('.modal-content').prepend("<img class='content-loader-img' src='assets/img/content-loader.gif' style='display: none;position: absolute;top: 50%;left: 50%; margin-left: -32px;margin-top: -32px;' />");
	
	show_spinner();
});

function datetime_to_date(date)
{
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var day = date.getDate();
	var month = date.getMonth();
	var ordinal = "th";
	
  switch (day % 10) {
		case 1:  ordinal = "st";
		break;
		case 2:  ordinal = "nd";
		break;
		case 3:  ordinal = "rd";
		break;
	}
	
	return months[month] + " " + day + ordinal;
}

function datetime_to_time(date)
{
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var ampm = "AM";
	
	if(hours > 12)
	{
		ampm = "PM";
		hours -= 12;
	}
	
	return hours + ":" + minutes + " " + ampm;
}

function show_modal_loader()
{
	$('.modal-body').css("opacity",".2");
	$('.content-loader-img').show();
}

function hide_modal_loader()
{
	$('.modal-body').fadeTo(400,1);
	$('.content-loader-img').fadeOut();
}

function fade_in_spinner()
{
	$('#loader').fadeIn();
}

function fade_out_spinner()
{
	$('#loader').fadeOut();
}

function show_spinner()
{
	$('#loader').show();
}

function hide_spinner()
{
	$('#loader').hide();
}
