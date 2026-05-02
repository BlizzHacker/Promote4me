<!DOCTYPE html>
<!--[if IE 8]> <html lang="en" class="ie8"> <![endif]-->
<!--[if !IE]><!-->
<html lang="en">
<!--<![endif]-->
<head>
	<meta charset="utf-8" />
	<title>Promote4Me Login</title>
	<meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" name="viewport" />
	<meta content="" name="description" />
	<meta content="" name="author" />
	
	<!-- ================== BEGIN BASE CSS STYLE ================== -->
	<link href="https://fonts.googleapis.com/css?family=Open+Sans:300,400,600,700" rel="stylesheet">
	<link href="assets/css/custom.css" rel="stylesheet" />
	<link href="assets/plugins/jquery-ui/themes/base/minified/jquery-ui.min.css" rel="stylesheet" />
	<link href="assets/plugins/bootstrap/css/bootstrap.min.css" rel="stylesheet" />
	<link href="assets/plugins/font-awesome/css/font-awesome.min.css" rel="stylesheet" />
	<link href="assets/css/animate.min.css" rel="stylesheet" />
	<link href="assets/css/style.min.css" rel="stylesheet" />
	<link href="assets/css/style-responsive.min.css" rel="stylesheet" />
	<link href="assets/css/theme/default.css" rel="stylesheet" id="theme" />
	<!-- ================== END BASE CSS STYLE ================== -->
</head>
<body>
	<!-- begin #page-loader -->
	<div id="page-loader" class="fade in"><span class="spinner"></span></div>
	<!-- end #page-loader -->
	
	<div class="login-cover">
	    <div class="login-cover-image"><img src="assets/img/login-bg.jpg" data-id="login-cover-image" alt="" /></div>
	    <div class="login-cover-bg"></div>
	</div>
	<!-- begin #page-container -->
	<div id="page-container" class="fade">
	    <!-- begin login -->
        <div class="login login-v2" data-pageload-addclass="animated flipInX">
            <!-- begin brand -->
            <div class="login-header">
                <div class="brand">
                    <img style="display: inline; width: 30px; height: 30px;" src="assets/img/p4logo-white.png" alt=""> Promote4Me
                    <small>The Street Team. Simplified.</small>
                </div>
            </div>
            <!-- end brand -->
            <div class="login-content">
				<div id="login_failure" class="alert alert-danger display-none">Uh oh, your email or password didn't match what's in our system. Please try again.</div>
				<?php if(isset($_GET["err"])): ?>
					<?php if($_GET["err"] == "permission"): ?>
						<div id="not_authorized" class="alert alert-danger">You do not have the correct permissions to access this site. Please contact your administrator.</div>
					<?php endif; ?>
					<?php if($_GET["err"] == "nologin"): ?>
						<div id="no_login" class="alert alert-danger">You must be logged in to view this site :)</div>
					<?php endif; ?>
					<?php if($_GET["err"] == "relogin"): ?>
						<div id="relogin" class="alert alert-danger">Something went wrong with your session. Please login again.</div>
					<?php endif; ?>
				<?php endif; ?>
				<form action="" id="login_form">
					<div class="form-group m-b-20">
						<input id="p4_login_email" type="text" class="form-control input-lg" placeholder="Email Address" />
					</div>
					<div class="form-group m-b-20">
						<input id="p4_login_password" type="text" class="form-control input-lg" placeholder="Password" />
					</div>
					<div class="login-buttons">
						<button id="p4_login_btn" class="btn btn-success btn-block btn-lg" type="submit">Login</button>
					</div>
				</form>
            </div>
        </div>
        <!-- end login -->
	</div>
	<!-- end page container -->
	
	<!-- ================== BEGIN BASE JS ================== -->
	<script src="assets/plugins/jquery/jquery-1.9.1.min.js"></script>
	<script src="assets/plugins/jquery/jquery-migrate-1.1.0.min.js"></script>
	<script src="assets/plugins/jquery-ui/ui/minified/jquery-ui.min.js"></script>
	<script src="assets/plugins/bootstrap/js/bootstrap.min.js"></script>
	<!--[if lt IE 9]>
		<script src="assets/crossbrowserjs/html5shiv.js"></script>
		<script src="assets/crossbrowserjs/respond.min.js"></script>
		<script src="assets/crossbrowserjs/excanvas.min.js"></script>
	<![endif]-->
	<script src="assets/plugins/slimscroll/jquery.slimscroll.min.js"></script>
	<script src="assets/plugins/jquery-cookie/jquery.cookie.js"></script>
	<!-- ================== END BASE JS ================== -->
	
	<!-- ================== BEGIN PAGE LEVEL JS ================== -->
	<script src="assets/js/apps.min.js"></script>
	<!-- ================== END PAGE LEVEL JS ================== --> 

	<script>
		$(document).ready(function() {
			App.init();
		});
	</script>
	<script src="assets/js/p4-app.js?v=<?php echo time() ?>"></script>
</body>
</html>
