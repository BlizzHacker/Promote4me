function d2dt(date) {
	var d = new Date(date);

	return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}

function makeDate(date) {
	var d = new Date(date);

	return ("0" + (d.getMonth() + 1)).slice(-2) + "/" + ("0" + d.getDate()).slice(-2) + "/" + d.getFullYear();
}


$(document).ready(function() {
	var curDate = new Date();
	var endDate = curDate.setMonth(curDate.getMonth() - 3);

	curDate = new Date();

	$('#start_date_range').val(makeDate(endDate));
	$('#end_date_range').val(makeDate(curDate));
	setTimeout(function(){
		$('.filter_analytics_data').trigger('click');
	},250);

	var sizeMap = function() {
        var windowHeight = $( window ).height();
        var windowWidth = $( window ).width();
        var headerHeight = $( '#header' ).height();

        $( '#analytics_map' ).css( 'height' , ( ( windowHeight - headerHeight ) / 2 ) + 'px' );
    };

    $( window ).resize( sizeMap );

    sizeMap();
	
	$('.date-picker').datepicker();

	fade_out_spinner();
	var analytics_map = null;
	var locations = null;
	var users = null;
	var center_lat = 40.7500;
	var center_lng = -111.8833;
	var timeline_graph = null;

	$.ajax({
		url: SUBSCRIBER_API + "/mapsettings?token=" + $.cookie('access_token'),
		method: "GET",
		success: function(data) {
			var geocoder = new google.maps.Geocoder();
			var address = data.subscriber_city + ", " + data.subscriber_state;

			geocoder.geocode({
				'address': address
			}, function(results, status) {
				if (status === google.maps.GeocoderStatus.OK) {
					center_lat = results[0].geometry.location.lat();
					center_lng = results[0].geometry.location.lng();

					analytics_map = new GMaps({
						div: '#analytics_map',
						lat: center_lat,
						lng: center_lng,
						zoom: 11
					});
				} else {
					alert('Geocode was not successful for the following reason: ' + status);
				}
			});
		}
	});



	$.ajax({
		method: "GET",
		url: SUBSCRIBER_API + "/locations?token=" + $.cookie('access_token'),
		success: function(data) {
			locations = data;
			$(locations).each(function() {
				var location_html = "";

				location_html += "<tr>";
				location_html += "<td style='width:20px;'>";
				location_html += "<input class='select_location' type='checkbox' value='" + this.location_id + "' />";
				location_html += "</td>";
				location_html += "<td>";
				location_html += this.location_name;
				location_html += "</td>";
				location_html += "<td>";
				location_html += this.location_address;
				location_html += "</td>";
				location_html += "</tr>";

				$('#locations_table > tbody').append(location_html);
			});
		}
	});

	$.ajax({
		method: "GET",
		url: SUBSCRIBER_API + "/users?token=" + $.cookie('access_token'),
		success: function(data) {
			users = data;
			$(users).each(function() {
				var user_html = "";

				user_html += "<tr>";
				user_html += "<td style='width:20px;'>";
				user_html += "<input class='select_user' type='checkbox' value='" + this.user_id + "' />";
				user_html += "</td>";
				user_html += "<td>";
				user_html += this.first_name + " " + this.last_name;
				user_html += "</td>";
				user_html += "</tr>";

				$('#users_table > tbody').append(user_html);
			}).promise().done(function() {
				$('#users').tab('show');
			});
		}
	});

	$('#show_timeline_graph_tab').on('shown.bs.tab', function() {
		if (timeline_graph != null) {
			timeline_graph.redraw();
			$('#analytics-line-chart > svg').css('width', "100%");
			$('#analytics-line-chart > svg').css('height', $('#analytics-line-chart').height());
		}
	});

	$('.filter_analytics_data').click(function() {
		var selected_users = $('.select_user:checked').map(function() {
			return $(this).val()
		}).get().join();
		var selected_locations = $('.select_location:checked').map(function() {
			return $(this).val()
		}).get().join();
		
		var start_date = $('#start_date_range').val();
		var end_date = $('#end_date_range').val();

		var query_string = "";

		if (start_date !== "") {
			query_string += "&sd=" + d2dt(start_date);
		}

		if (end_date !== "") {
			query_string += "&ed=" + d2dt(end_date);
		}

		if (selected_users !== "") {
			query_string += "&u=" + selected_users;
		}

		if (selected_locations !== "") {
			query_string += "&l=" + selected_locations;
		}

		$.ajax({
			method: "GET",
			url: SUBSCRIBER_API + "/analytics?token=" + $.cookie('access_token') + query_string,
			success: function(data) {

				var photo_day_groups = {};
				var photo_user_groups = {};
				var photo_location_groups = {};
				var green = '#0D888B';
				var greenLight = '#00ACAC';
				var blue = '#3273B1';
				var blueLight = '#348FE2';
				var blackTransparent = 'rgba(0,0,0,0.6)';
				var whiteTransparent = 'rgba(255,255,255,0.4)';

				analytics_map.removeMarkers();
				$(data).each(function() {
					var photo_date = new Date(this.insert_date);
					var photo_month = photo_date.getMonth() + 1;
					var photo_day = photo_date.getDate();
					var photo_year = photo_date.getFullYear();

					var formatted_date = photo_year + "-" + photo_month + "-" + ("0" + photo_day).slice(-2);

					if (!photo_day_groups.hasOwnProperty(formatted_date)) {
						photo_day_groups[formatted_date] = 0;
					}

					photo_day_groups[formatted_date] += 1;

					if (this.location_lat !== "" && this.location_long !== "") {
						analytics_map.addMarker({
							lat: this.lat,
							lng: this.lng
						});
					}
				}).promise().done(function() {
					var aggregated_dates = $.map(photo_day_groups, function(k, v) {
						return {
							"date": v,
							"count": k
						}
					});

					$('#analytics-line-chart').empty();

					timeline_graph = Morris.Line({
						element: 'analytics-line-chart',
						data: aggregated_dates,
						xkey: 'date',
						ykeys: ['count'],
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
						gridTextColor: blackTransparent,
						gridTextWeight: 'normal',
						gridTextSize: '11px',
						gridLineColor: 'rgba(0,0,0,0.5)',
						hideHover: 'auto'
					});
				});
			}
		});
	});
});