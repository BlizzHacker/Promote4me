<?php 
    $PAGE_TITLE = "Analytics";
    require_once('_header.php') 
?>

<!-- begin page-header -->
<h1 class="page-header">Analytics</h1>
<!-- end page-header -->

<ul class="nav nav-tabs" role="tablist">
  <li class="active"><a href="#map" data-toggle="tab">Map</a></li>
  <li><a id="show_timeline_graph_tab" href="#photo_graphs" data-toggle="tab">Timeline</a></li>
</ul>
<div id="analytics_tabs" class="tab-content">
  <div class="tab-pane fade in active" id="map">
    <div id="analytics_map" class="analytics_tab"></div>
  </div>
  <div class="tab-pane fade" id="photo_graphs" class="analytics_tab">
    <div id="analytics-line-chart" class="morris-inverse" style="height: 260px;"></div>
  </div>
</div>
<div class="row clearfix">
  <div class="col-md-3"><button class="btn btn-default filter_analytics_data">Filter</button></div>
  <div class="col-md-3 form-group pull-right">
    <div class="input-group">
      <input type="text" class="form-control date-picker" id="end_date_range" placeholder="End Date">
      <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
    </div>
  </div>
  <div class="col-md-3 form-group pull-right">
    <div class="input-group">
      <input type="text" class="form-control date-picker" id="start_date_range" placeholder="Start Date">
      <span class="input-group-addon"><i class="fa fa-calendar"></i></span>
    </div>
  </div>
</div>
<ul class="nav nav-tabs" role="tablist">
  <li class="active"><a href="#users" data-toggle="tab">Users</a></li>
  <li><a href="#locations" data-toggle="tab">Locations</a></li>
</ul>
<div id="filter_tabs" class="tab-content">
  <div class="tab-pane fade in active" id="users">
    <table id="users_table" class="table table-hover">
    	<thead>
        <tr>
        	<th style="width: 0px;"></th>
          <th>Name</th>
        </tr>
      </thead>
    	<tbody>
        
      </tbody>
    </table>
  </div>
  <div class="tab-pane fade" id="locations">
    <table id="locations_table" class="table table-hover">
    	<thead>
        <tr>
        	<th style="width: 0px;"></th>
          <th>Name</th>
          <th>Address</th>
        </tr>
      </thead>
    	<tbody>
        
      </tbody>
    </table>
  </div>
</div>
<div class="row">
  <div class="col-md-3"><button class="btn btn-default filter_analytics_data">Filter</button></div>
</div>
<?php require_once('_scripts.php') ?>

<script src="assets/js/p4-analytics-app.js?v=<?php echo time() ?>"></script>

<?php require_once('_footer.php') ?>