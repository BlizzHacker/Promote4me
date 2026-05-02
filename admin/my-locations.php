<?php 
    $PAGE_TITLE = "My Locations";
    require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Locations</h1>
<!-- end page-header -->

<div class="col-md-12" id="location_map_container"></div>
<div class="form-group">&nbsp;</div>
<div>
    <table id="data-table" class="table table-striped table-bordered display" cellspacing="0" width="100%">
        <thead>
            <tr>
                <th>Remove</th>
                <th>Name</th>
                <th>Address</th>
            </tr>
        </thead>
        <tbody>
        </tbody>
    </table>
</div>

<?php require_once('_scripts.php') ?>

<script src="assets/js/p4-my-locations-app.js"></script>

<?php require_once('_footer.php') ?>