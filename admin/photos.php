<?php 
	$PAGE_TITLE = "Photos";
	require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Photos <small>What your team has been up to</small></h1>
<!-- end page-header -->
<div class="row">
	<div class="col-md-12">Filter by:</div>
</div>
<div class="row row_margin">
	<div class="col-md-2">
		<select class="form-control" id="p4_month_selector">
			<option value="1">January</option>
			<option value="2">February</option>
			<option value="3">March</option>
			<option value="4">April</option>
			<option value="5">May</option>
			<option value="6">June</option>
			<option value="7">July</option>
			<option value="8">August</option>
			<option value="9">September</option>
			<option value="10">October</option>
			<option value="11">November</option>
			<option value="12">December</option>
		</select>
	</div>
	<div class="col-md-2">
		<select class="form-control" id="p4_year_selector">
		</select>
	</div>
	<div class="col-md-2">
		<select class="form-control" id="p4_user_selector">
			<option disabled selected>User</option>
		</select>
	</div>
</div>
<div id="photo_collection" class="gallery">
	
</div>

<?php require_once('_scripts.php') ?>

<script src="assets/js/p4-photo-app.js?v=<?php echo time() ?>"></script>

<?php require_once('_footer.php') ?>