<?php 
    $PAGE_TITLE = "Locations";
    require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Locations</h1>
<!-- end page-header -->

<div class="col-md-12" id="location_map_container"></div>
<div class="form-group">&nbsp;</div>
<div>
    <div class="input-group">
        <input type="text" id="p4_location_search_bar" class="form-control input-sm input-white" placeholder="Search for Locations" />
        <span class="input-group-btn">
            <button class="btn btn-sm btn-inverse" type="button"><i class="fa fa-search"></i></button>
        </span>
    </div>
    <div class="form-group">&nbsp;</div>
    <button id="add_all_locations" class="btn btn-primary" style="float: left;"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add All</button>
    <table id="data-table" class="table table-striped table-bordered display" cellspacing="0" width="100%">
        <thead>
            <tr>
                <th>Add</th>
                <th>Name</th>
                <th>Address</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>

<?php require_once('_scripts.php') ?>

<script src="assets/js/p4-location-app.js?v=<?php echo time() ?>"></script>

<?php require_once('_footer.php') ?>