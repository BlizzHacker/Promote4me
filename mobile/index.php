<html ng-app="app">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css" />
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet" />
		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700' rel='stylesheet' type='text/css'>
		<link href="css/app.css" rel="stylesheet" />
		<base href="/">
		<script>
			if(localStorage.token == "null")
			{
				window.location.href = "login.html";
			}
		</script>
	</head>
	<body ng-controller="masterController">
		<div id="page_container">
			<div id="page_spillover">
				<div id="sidebar" ng-controller="sidebarController">
					<ul>
						<li id="show_sidebar">Hi!<i class="fa fa-bars pull-right fa-lg" ng-click="showSidebar()"></i></li>
						<li class="sidebar_spacer">&nbsp;</li>
						<li><a href="/dashboard">Dashboard <i class="fa fa-dashboard fa-lg pull-right"></i></a></li>
						<li><a href="/checkin">Check-In <i class="fa fa-camera fa-lg pull-right"></i></a></li>
						<li><a href="/locations">Locations <i class="fa fa-street-view fa-lg pull-right"></i></a></li>
						<!--<li><a href="/messages">Messages <i class="fa fa-envelope fa-lg pull-right"></i></a></li>-->
						<li><a href="/team">The Team <i class="fa fa-users fa-lg pull-right"></i></a></li>
						<li><a href="/settings">Settings <i class="fa fa-gears fa-lg pull-right"></i></a></li>
						<li><a href="javascript:;" ng-click="logout()">Logout <i class="fa fa-sign-out fa-lg pull-right"></i></a></li>
					</ul>
				</div>
				<div id="page">
					<div id="page_view" ng-view>
						
					</div>
				</div>
			</div>
		</div>
		<div class="modal fade" id="change_password_modal">
			<div class="modal-dialog">
				<div class="modal-content">
					<div class="modal-header">
						<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
						<h4 class="modal-title">Change your password</h4>
					</div>
					<div class="modal-body">
						<div class="alert alert-danger hidden" id="bad_password">That's not your password. Try again.</div>
						<div class="form-group">
							<label>Current Password</label>
							<input type="password" class="form-control" id="cp" />
						</div>
						<div class="alert alert-danger hidden" id="password_mismatch">Your new passwords don't match. Try again.</div>
						<div class="form-group">
							<label>New Password</label>
							<input type="password" class="form-control" id="np" />
						</div>
						<div class="form-group">
							<label>Confirm New Password</label>
							<input type="password" class="form-control" id="cnp" />
						</div>
						<div class="form-group clearfix">
							<button class="btn btn-primary pull-right" id="change_password">Change Password</button>
						</div>
					</div>
				</div><!-- /.modal-content -->
			</div><!-- /.modal-dialog -->
		</div><!-- /.modal -->
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-route.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
		<script src="js/p4-app.js?v=<?php echo time(); ?>"></script>
	</body>
</html>