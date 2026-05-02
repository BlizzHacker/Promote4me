<?php 
    $PAGE_TITLE = "Settings";
    require_once('_header.php');
?>

<!-- begin page-header -->
<h1 class="page-header">Settings</h1>
<!-- end page-header -->
<div class="alert alert-success hidden"  id="password_change_success">Your password was changed successfully</div>
<div class="row" style="display: none;" id="subscription_form">
<div class="col-md-4">
	<h2>Subscription Information</h2>
	<p>You're in trial mode. You have <span class="trial_days"></span> days remaining. Please subscribe to continue using Promote4Me after your trial has ended :)</p>
<link rel="stylesheet" href="/assets/css/stripe.css?v=4" />
<script src="https://js.stripe.com/v3/"></script>

<form action="/charge" method="post" id="payment-form">
	<div class="row">
		<div class="col-sm-8 col-md-8">
			<div class="form-row">
			<label for="card-element">
				Credit or debit card
			</label>
			<div id="card-element">
				<!-- a Stripe Element will be inserted here. -->
			</div>

			<!-- Used to display form errors -->
			<div id="card-errors" role="alert"></div>
		</div>
		</div>
		<div class="col-sm-4 col-md-4">
			<button id="stripe_button">Subscribe</button>
		</div>
	</div>
</form>

<script src="/assets/js/subscription.js"></script>
</div>
</div>
<h2>User Settings</h2>
<p>Update your account info</p>
<div class="row clearfix">
	<div class="col-md-4">
		<div class="form-group">
			<label>First Name</label>
			<input type="text" class="form-control" id="user_first_name" />
		</div>
		<div class="form-group">
			<label>Last Name</label>
			<input type="text" class="form-control" id="user_last_name" />
		</div>
		<div class="form-group">
			<label>Email Address</label>
			<input type="text" class="form-control" id="user_email" />
		</div>
		<div class="form-group">
			<label>Phone Number</label>
			<input type="text" class="form-control" id="user_phone_number" />
		</div>
		<div class="form-group clearfix">
			<button id="update_admin_user" class="btn btn-default pull-right">Update</button>
			<button data-toggle="modal" data-target="#change_password_modal" class="btn btn-danger">Change your password</button>
		</div>
	</div>
</div>
<h2>Map Settings</h2>
<p>Set the default center of your map</p>
<div class="row clearfix">
	<div class="col-md-4">
		<div class="form-group">
			<label>City</label>
			<input type="text" class="form-control" id="subscriber_city" />
		</div>
		<div class="form-group">
			<label>State</label>
			<select id="subscriber_state" class="form-control">
				<option value="Alabama">Alabama</option>
				<option value="Alaska">Alaska</option>
				<option value="Arizona">Arizona</option>
				<option value="Arkansas">Arkansas</option>
				<option value="California">California</option>
				<option value="Colorado">Colorado</option>
				<option value="Connecticut">Connecticut</option>
				<option value="Delaware">Delaware</option>
				<option value="District Of Columbia">District Of Columbia</option>
				<option value="Florida">Florida</option>
				<option value="Georgia">Georgia</option>
				<option value="Hawaii">Hawaii</option>
				<option value="Idaho">Idaho</option>
				<option value="Illinois">Illinois</option>
				<option value="Indiana">Indiana</option>
				<option value="Iowa">Iowa</option>
				<option value="Kansas">Kansas</option>
				<option value="Kentucky">Kentucky</option>
				<option value="Louisiana">Louisiana</option>
				<option value="Maine">Maine</option>
				<option value="Maryland">Maryland</option>
				<option value="Massachusetts">Massachusetts</option>
				<option value="Michigan">Michigan</option>
				<option value="Minnesota">Minnesota</option>
				<option value="Mississippi">Mississippi</option>
				<option value="Missouri">Missouri</option>
				<option value="Montana">Montana</option>
				<option value="Nebraska">Nebraska</option>
				<option value="Nevada">Nevada</option>
				<option value="New Hampshire">New Hampshire</option>
				<option value="New Jersey">New Jersey</option>
				<option value="New Mexico">New Mexico</option>
				<option value="New York">New York</option>
				<option value="North Carolina">North Carolina</option>
				<option value="North Dakota">North Dakota</option>
				<option value="Ohio">Ohio</option>
				<option value="Oklahoma">Oklahoma</option>
				<option value="Oregon">Oregon</option>
				<option value="Pennsylvania">Pennsylvania</option>
				<option value="Rhode Island">Rhode Island</option>
				<option value="South Carolina">South Carolina</option>
				<option value="South Dakota">South Dakota</option>
				<option value="Tennessee">Tennessee</option>
				<option value="Texas">Texas</option>
				<option value="Utah">Utah</option>
				<option value="Vermont">Vermont</option>
				<option value="Virginia">Virginia</option>
				<option value="Washington">Washington</option>
				<option value="West Virginia">West Virginia</option>
				<option value="Wisconsin">Wisconsin</option>
				<option value="Wyoming">Wyoming</option>
			</select>
		</div>
		<div class="form-group clearfix">
			<button id="update_map_center" class="btn btn-default pull-right">Update</button>
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
<?php require_once('_scripts.php') ?>
<script src="assets/js/p4-settings-app.js"></script>
<?php require_once('_footer.php') ?>