<?php

/*

For now logins won't be enforced. This needs to change before launch but 

if(isset($_COOKIE["access_token"]))
{
	$token = $_COOKIE["access_token"];
	
	$curl = curl_init();
	
	$request_url = "http://api.p4.localhost/auth/validatetoken?token=$token";
	
	curl_setopt_array($curl,array(
		CURLOPT_RETURNTRANSFER => 1,
		CURLOPT_URL => $request_url
	));
	
	$result = json_decode();

	var_dump(curl_exec($curl));
	
	$isValid = $result->validation;
	$role = $result->role;
	
	if($isValid)
	{
		if($role != 2)
		{
			header("Location: login.php?err=permission");
		}
	}
	else
	{
		//header("Location: login.php?err=relogin");
	}
}
else
{
	header("Location: login.php?err=nologin");
}

*/

?>
<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en">
<!--<![endif]-->
<head>
	<meta charset="utf-8" />
	<title><?php echo isset($PAGE_TITLE) ? $PAGE_TITLE : "Promote4Me" ?></title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
	<meta content="" name="description" />
	<meta content="" name="author" />
	
	<!-- ================== BEGIN BASE CSS STYLE ================== -->
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet">
	<link href="assets/plugins/jquery-ui/themes/base/minified/jquery-ui.min.css" rel="stylesheet" />
	<link href="assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
	<link href="assets/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
	<link href="assets/css/animate.min.css" rel="stylesheet" />
	<link href="assets/css/style.min.css" rel="stylesheet" />
	<link href="assets/css/style-responsive.min.css" rel="stylesheet" />
	<link href="assets/css/theme/default.css" rel="stylesheet" id="theme" />
	<link href="assets/plugins/lightbox/css/lightbox.css" rel="stylesheet" />
	<!-- ================== END BASE CSS STYLE ================== -->
	
	<!-- ================== BEGIN PAGE LEVEL CSS STYLE ================== -->
	<link href="assets/plugins/bootstrap-calendar/css/bootstrap_calendar.css" rel="stylesheet" />
	<link href="assets/plugins/morris/morris.css" rel="stylesheet" />
	<link href="assets/plugins/DataTables/css/data-table.css" rel="stylesheet" />
	<link href="assets/plugins/ionicons/css/ionicons.min.css" rel="stylesheet" />
	<link rel="stylesheet/less" type="text/css" href="assets/css/custom.css" />
	<link href="assets/plugins/fullcalendar/fullcalendar/fullcalendar.css" rel="stylesheet" />
	<link href="assets/plugins/bootstrap-datepicker/css/datepicker3.css" rel="stylesheet" />
	<!-- ================== END PAGE LEVEL CSS STYLE ================== -->
	
	<!-- ================== BEGIN BASE JS ================== -->
	<script src="assets/plugins/pace/pace.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
	<!-- ================== END BASE JS ================== -->
</head>
<body>
	<!-- begin #page-loader -->
	<div id="page-loader" class="fade in"><span class="spinner"></span></div>
	<!-- end #page-loader -->
	
	<!-- begin #page-container -->
	<div id="page-container" class="fade page-sidebar-fixed page-header-fixed">
		<!-- begin #header -->
		<div id="header" class="header navbar navbar-default navbar-fixed-top">
			<!-- begin container-fluid -->
			<div class="container-fluid">
				<!-- begin mobile sidebar expand / collapse button -->
				<div class="navbar-header">
					<a href="/" class="navbar-brand"><img style="display: inline;" src="assets/img/p4logo.png" alt=""> Promote4Me</a>
					<button type="button" class="navbar-toggle" data-click="sidebar-toggled">
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
						<span class="icon-bar"></span>
					</button>
				</div>
				<!-- end mobile sidebar expand / collapse button -->
				
				<!-- begin header navigation right -->
				<ul class="nav navbar-nav navbar-right">
					<li class="dropdown navbar-user">
						<a href="javascript:;" class="dropdown-toggle" data-toggle="dropdown">
							<span class="hidden-xs">Hey, Admin</span> <b class="caret"></b>
						</a>
						<ul class="dropdown-menu animated fadeInLeft">
							<li class="arrow"></li>
							<li><a href="messages">Messages</a></li>
							<li><a href="schedules">Schedules</a></li>
							<li class="divider"></li>
							<li><a href="logout">Log Out</a></li>
						</ul>
					</li>
				</ul>
				<!-- end header navigation right -->
			</div>
			<!-- end container-fluid -->
		</div>
		<!-- end #header -->
		
		<?php require_once('_sidebar.php') ?>
		
		<!-- begin #content -->
		<div id="content" class="content">
			<div class="alert alert-success" id="trial_notification" style="display: none;">There are <span class="trial_days"></span> days remaining in your trial. <a href="/settings">Subscribe Now</a></div>