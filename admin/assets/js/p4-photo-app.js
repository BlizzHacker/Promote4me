$(document).ready(function(){
	$.ajax({
		method : "GET",
		url : SUBSCRIBER_API + "/photoyears?token=" + $.cookie('access_token'),
		success : function(data)
		{
			$(data).each(function(){
				$('#p4_year_selector').append("<option value='" + this + "'>" + this + "</option>");
			});

			load_photos();
		}
	});

	$('#p4_user_selector,#p4_year_selector,#p4_month_selector').change(function(){
		load_photos();
	});

	var current_date = new Date();
	var month = current_date.getMonth();
	var year = current_date.getFullYear();

	$('#p4_month_selector > option[value=' + month + ']').attr("selected","selected");
	$('#p4_year_selector > option[value=' + year + ']').attr("selected","selected");

	function load_photos()
	{
		$('#photo_collection').empty();

		var photo_url = SUBSCRIBER_API + "/photos?token=" + $.cookie('access_token');
		photo_url += '&m=' + $('#p4_month_selector').val();
		photo_url += '&y=' + $('#p4_year_selector').val();

		$.ajax({
			method : "GET",
			url : photo_url,
			success : function(data)
			{
				$(data).each(function(){
					var photo_html = "";

					photo_html += '<div class="photo_container">';
					photo_html += '<img src="' + API_ADDRESS + "/uploads/" + this.photo_url + '" />';
					photo_html += '</div>';

					$('#photo_collection').append(photo_html);
				});
			}
		});
	}
});