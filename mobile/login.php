<html ng-app="app">
	<head>
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css" />
		<link href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css" rel="stylesheet" />
		<link href='https://fonts.googleapis.com/css?family=Open+Sans:400,300,600,700' rel='stylesheet' type='text/css'>
		<link href="css/app.css" rel="stylesheet" />
	</head>
	<body ng-controller="authController" style="background-color: #0054a6;">
		<div class="container-fluid">
			<div id="login_container">
				<center>
					<img src="p4mobilelogo.png" alt="" style="width: 100%;"/>
				</center>
				<form ng-submit="login(event)">
					<div id="login_error" class="alert alert-danger init-hidden" role="alert">Wrong username or password. Try again.</div>
					<div class="form-group">
						<input type="text" id="username" class="form-control" ng-model="auth.email_address" placeholder="bastoff@gmail.com"/>
					</div>
					<div class="form-group">
						<input type="password" id="password" class="form-control" ng-model="auth.password" placeholder="password"/>
					</div>
					<div class="form-group">
						<button type="submit" class="btn btn-primary btn-block">Login</button>
					</div>
				</form>
			</div>
		</div>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular.js"></script>
		<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.15/angular-route.js"></script>
		<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js"></script>
		<script src="js/p4-app.js?v=<?php echo time() ?>"></script>
		<script>
			$(document).ready(function(){
				//$('#login_container').css("margin-top","-" + ($('#login_container').height()/2));
				
				$(window).resize(function(){
					//$('#login_container').css("margin-top","-" + ($('#login_container').height()/2));
				});
			});
		</script>
	</body>
</html>