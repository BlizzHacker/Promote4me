<?php 
    $PAGE_TITLE = "Users";
    require_once('_header.php');
?>

<!-- begin page-header -->
<h1 class="page-header">Users</h1>
<!-- end page-header -->

<div class="panel-body">

    <div id="p4_user_table" class="table-responsive">
    	<button id="invite_user" class="btn btn-primary" style="float: left;" data-toggle="modal" data-target="#invite_user_modal"><i class="ion-person-add"></i>&nbsp;&nbsp;Invite User</button>
        <table id="data-table" class="table table-striped table-bordered display" cellspacing="0" width="100%">
            <thead>
                <tr>
                    <th>&nbsp;</th>
                    <th>First name</th>
                    <th>Last name</th>
                    <th>Phone Number</th>
                    <th>Email Address</th>
                </tr>
            </thead>
            <tbody>
            </tbody>
        </table>
    </div>
</div>

<?php require_once('_scripts.php') ?>

<div id="invite_user_modal" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
        <h4 class="modal-title">Invite someone to your team</h4>
      </div>
      <div class="modal-body">
      	<p>Fill out this form to invite someone to your team.<br />I'll send them an email with a link to the app so that they can complete the sign-up process.</p>
        <div class="form-group">
        	<label for="">Email Address *</label>
        	<input id="invite_email" data-parsely-required="true" type="text" class="form-control">
        </div>
      </div>
      <div class="modal-footer">
        <button id="send_invite" type="button" data-dismiss="modal" class="btn btn-success">Send Invite</button>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<div id="edit_user_modal" class="modal fade">
  <div class="modal-dialog">
    <div class="modal-content">
    <div class="modal-header clearfix">
        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
      </div>
      <div class="modal-body">
		<div id="save_success_alert" class="alert alert-success hidden">User Edited</div>
        <div class="form-group">
            <label>First Name</label>
            <input id="user_first_name" type="text" class="form-control" />
        </div>
        <div class="form-group">
            <label>Last Name</label>
            <input id="user_last_name" type="text" class="form-control" />
        </div>
        <div class="form-group">
            <label>Email Address</label>
            <input id="user_email_address" type="text" class="form-control" />
        </div>
        <div class="form-group">
            <label>Phone Number</label>
            <input id="user_phone_number" type="text" class="form-control" />
        </div>
        <div class="form-group">
            <label>User Type</label>
            <select id="user_type" class="form-control">
                <option value="1">Grunt</option>
                <option value="2">Admin</option>
            </select>
        </div>
        <div class="clearfix">
            <button id="save_user" class="btn btn-primary col-md-6">Save</button>
            <button id="delete_user" class="btn btn-danger col-md-6">Delete</button>
        </div>
      </div>
    </div><!-- /.modal-content -->
  </div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<script src="assets/js/p4-user-app.js?v=<?php echo time() ?>"></script>

<?php require_once('_footer.php') ?>