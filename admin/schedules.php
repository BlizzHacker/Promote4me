<?php 
	$PAGE_TITLE = "Schedules";
	require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Schedules</h1>
<!-- end page-header -->
<div class="row">
	<div class="col-md-12">
		<div id="calendar" class="calendar"></div>
	</div>
</div>
<div id="add_schedule_modal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Add to Schedule</h4>
			</div>
			<div class="modal-body">
				<label id="add_schedule_label">Add Schedule</label>
				<textarea id="add_schedule_events" class="form-control" cols="30" rows="10"></textarea>
			</div>
			<div class="modal-footer">
				<button id="add_schedule_button" type="button" class="btn btn-success">Add Events</button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->
<div id="edit_schedule_modal" class="modal fade">
	<div class="modal-dialog">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title">Edit Schedule</h4>
			</div>
			<div class="modal-body">
				<label id="add_schedule_label">Edit Schedule</label>
				<textarea id="edit_schedule_events" class="form-control" cols="30" rows="10"></textarea>
			</div>
			<div class="modal-footer">
				<button id="edit_schedule_button" type="button" class="btn btn-success">Edit</button>
				<button id="delete_schedule_button" type="button" class="btn btn-danger">Delete</button>
			</div>
		</div><!-- /.modal-content -->
	</div><!-- /.modal-dialog -->
</div><!-- /.modal -->

<?php require_once('_scripts.php') ?>

<script src="assets/js/p4-schedule-app.js?v=<?php echo time() ?>"></script>

<?php require_once('_footer.php') ?>