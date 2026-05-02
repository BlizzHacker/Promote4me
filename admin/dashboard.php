<?php
	$PAGE_TITLE = "Dashboard";
	require_once('_header.php');
?>

<!-- begin page-header -->
<h1 class="page-header">Dashboard</h1>
<!-- end page-header -->

<!-- begin row -->
<div class="row">
    <!-- begin col-3 -->
    <div class="col-md-4 col-sm-6">
        <div class="widget widget-stats bg-green">
            <div class="stats-icon stats-icon-lg"><i class="fa fa-camera fa-fw"></i></div>
            <div class="stats-title">PHOTOS THIS MONTH</div>
            <div class="stats-number photos_month"></div>
            <div class="stats-progress progress">
                <div class="progress-bar" style="width: 70.1%;"></div>
            </div>
            <div class="stats-link">
				<a href="photos">Go to Photos <i class="fa fa-arrow-circle-o-right"></i></a>
			</div>
        </div>
    </div>
    <!-- end col-3 -->
    <!-- begin col-3 -->
    <div class="col-md-4 col-sm-6">
        <div class="widget widget-stats bg-blue">
            <div class="stats-icon stats-icon-lg"><i class="fa fa-camera fa-fw"></i></div>
            <div class="stats-title">PHOTOS TODAY (as of <span class="current_time"></span> )</div>
            <div class="stats-number photos_day"></div>
            <div class="stats-progress progress">
                <div class="progress-bar" style="width: 70.1%;"></div>
            </div>
            <div class="stats-link">
				<a href="photos">Go to Photos <i class="fa fa-arrow-circle-o-right"></i></a>
			</div>
        </div>
    </div>
    <!-- begin col-3 -->
    <div class="col-md-4 col-sm-6">
        <div class="widget widget-stats bg-black">
            <div class="stats-icon stats-icon-lg"><i class="fa fa-calendar fa-fw"></i></div>
            <div class="stats-title">SCHEDULED EVENTS TODAY</div>
            <div class="stats-number events_day"></div>
            <div class="stats-progress progress">
                <div class="progress-bar" style="width: 0%;"></div>
            </div>
            <div class="stats-link">
				<a href="schedules">Go to Schedules <i class="fa fa-arrow-circle-o-right"></i></a>
			</div>
        </div>
    </div>
    <!-- end col-3 -->
</div>
<!-- end row -->
<div class="row">
	<div class="col-md-8">
	    <div class="widget-chart with-sidebar bg-black">
	        <div class="widget-chart-content">
	            <h4 class="chart-title">
	                PHOTOS THIS MONTH
	                <small>How your team is doing this month</small>
	            </h4>
	            <div id="visitors-line-chart" class="morris-inverse" style="height: 260px;"></div>
	        </div>
	        <div class="widget-chart-sidebar bg-black-darker">
	            <div class="chart-number">
	                <span class="photos_month"></span>
	                <small>Photos</small>
	                <div id="visitors-donut-chart" style="height: 160px"></div>
	            </div>
	        </div>
	    </div>
	</div>
	<!-- begin col-4 -->
    <div class="col-md-4">
        <!-- begin panel -->
        <div class="panel panel-inverse" data-sortable-id="index-3">
            <div class="panel-heading">
                <h4 class="panel-title">Today's Schedule</h4>
            </div>
            <div id="dashboard_events" class="list-group">
            </div>
        </div>
        <!-- end panel -->
    </div>
</div>

<?php require_once('_scripts.php') ?>

<script type="text/javascript">
	$(document).ready(function(){

	$.get(SUBSCRIBER_API + "/dashboard?token=" + $.cookie('access_token'), function(data){
		if(data.status == "ok")
		{
			photosLineChart(data.photos);
			userDonutChart(data.user_counts);

			console.log(data);
			
			var event_count = data.counts.events_day != null ? data.counts.events_day : 0;

			$('.photos_day').text(data.counts.photos_day);
			$('.photos_month').text(data.counts.photos_month);
			$('.events_day').text(event_count);

			var dashboard_events = [];
			
			if(data.counts.events != null)
			{
				dashboard_events = data.counts.events.split("\n");
			}
			

			if(dashboard_events.length == 1 && dashboard_events[0] == "")
			{
				$('#dashboard_events').append('<a href="javascript:;" class="list-group-item text-ellipsis">None today <i class="fa fa-smile-o"></i></a>');
			}
			else
			{
				$(dashboard_events).each(function(){
					if(this != "")
					{
						$('#dashboard_events').append('<a href="javascript:;" class="list-group-item text-ellipsis">' + this + '</a>');
					}
				});
			}

			

			var d = new Date();
			var hr = d.getHours();
			var min = d.getMinutes();
			if (min < 10) {
			    min = "0" + min;
			}
			var ampm = hr < 12 ? "AM" : "PM";

			var hr = hr > 13 ? hr - 12 : hr;

			$('.current_time').text(hr + ":" + min + " " + ampm);
		}
		
		if(data.error != null || data.error != undefined)
		{
			console.log(data);
			//$.cookie("access_token", null, { path: '/' });
			//window.location.href = "login.php";
		}
		
		fade_out_spinner();
	});

	var getMonthName = function(number) {
	    var month = [];
	    month[0] = "January";
	    month[1] = "February";
	    month[2] = "March";
	    month[3] = "April";
	    month[4] = "May";
	    month[5] = "Jun";
	    month[6] = "July";
	    month[7] = "August";
	    month[8] = "September";
	    month[9] = "October";
	    month[10] = "November";
	    month[11] = "December";
	    
	    return month[number];
	};

	var getDate = function(date) {
	    var currentDate = new Date(date);
	    var dd = currentDate.getDate();
	    var mm = currentDate.getMonth() + 1;
	    var yyyy = currentDate.getFullYear();
	    
	    if (dd < 10) {
	        dd = '0' + dd;
	    }
	    if (mm < 10) {
	        mm = '0' + mm;
	    }
	    currentDate = yyyy+'-'+mm+'-'+dd;
	    
	    return currentDate;
	};

	function photosLineChart(photo_data) {
	    var green = '#0D888B';
	    var greenLight = '#00ACAC';
	    var blue = '#3273B1';
	    var blueLight = '#348FE2';
	    var blackTransparent = 'rgba(0,0,0,0.6)';
	    var whiteTransparent = 'rgba(255,255,255,0.4)';
	    
	    Morris.Line({
	        element: 'visitors-line-chart',
	        data: photo_data,
	        xkey: 'photo_date',
	        ykeys: ['photo_count'],
	        xLabelFormat: function(x) {
	            return (x.getMonth() + 1) + '-' + x.getDate()
	        },
	        labels: ['Photos'],
	        smooth: true,
	        lineColors: [green],
	        pointFillColors: [greenLight],
	        lineWidth: '2px',
	        pointStrokeColors: [blackTransparent],
	        resize: true,
	        gridTextFamily: 'Open Sans',
	        gridTextColor: whiteTransparent,
	        gridTextWeight: 'normal',
	        gridTextSize: '11px',
	        gridLineColor: 'rgba(0,0,0,0.5)',
	        hideHover: 'auto'
	    });
	}

	function userDonutChart(user_data) {
	    var green = '#00acac';
	    var blue = '#348fe2';
	    var purple = '#727cb6';
	    var red = '#ff5b57';

	    u_data = new Array();

	    $(user_data).each(function(){
	    	u_data.push({ "label" : this.user_name , "value" : this.photo_count });
	    });

	    Morris.Donut({
	        element: 'visitors-donut-chart',
	        data: u_data,
	        colors: [green, blue, purple, red],
	        labelFamily: 'Open Sans',
	        labelColor: 'rgba(255,255,255,0.4)',
	        labelTextSize: '12px',
	        backgroundColor: '#242a30'
	    });
	}

	var handleScheduleCalendar = function() {
	    var monthNames = ["January", "February", "March", "April", "May", "June",  "July", "August", "September", "October", "November", "December"];
	    var dayNames = ["S", "M", "T", "W", "T", "F", "S"];

	    var now = new Date(),
	        month = now.getMonth() + 1,
	        year = now.getFullYear();

	    var events = [
	        [
	            '29/' + month + '/' + year,
	            'Popover Title',
	            '#',
	            '#2d353c',
	            'Some contents here'
	        ],
	        [
	            '30/' + month + '/' + year,
	            'Tooltip with link',
	            'http://www.seantheme.com/color-admin-v1.3',
	            '#2d353c'
	        ],
	        [
	            '27/' + month + '/' + year,
	            'Popover with HTML Content',
	            '#',
	            '#00acac',
	            'Some contents here <div class="text-right"><a href="http://www.google.com">view more >>></a></div>'
	        ]
	    ];
	    var calendarTarget = $('#schedule-calendar');
	    $(calendarTarget).calendar({
	        months: monthNames,
	        days: dayNames,
	        events: events,
	        popover_options:{
	            placement: 'top',
	            html: true
	        }
	    });
	    $(calendarTarget).find('td.event').each(function() {
	        var backgroundColor = $(this).css('background-color');
	        $(this).removeAttr('style');
	        $(this).find('a').css('background-color', backgroundColor);
	    });
	    $(calendarTarget).find('.icon-arrow-left, .icon-arrow-right').parent().on('click', function() {
	        $(calendarTarget).find('td.event').each(function() {
	            var backgroundColor = $(this).css('background-color');
	            $(this).removeAttr('style');
	            $(this).find('a').css('background-color', backgroundColor);
	        });
	    });
	};
	handleScheduleCalendar();
	});
</script>

<?php require_once('_footer.php') ?>