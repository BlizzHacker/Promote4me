$(document).ready(function(){
	$.ajax({
		method : "GET",
		url : SUBSCRIBER_API + "/inventory",
		success : function(data)
		{
			$(data).each(function(){
				var inventory_append = '';
				inventory_append += '<div class="col-md-3 inventory_box" data-target="" inventory-id="' + this.inventory_id + '">';
				inventory_append += '<div class="inventory_image_container">';
				inventory_append += '<img src="' + this.inventory_photo_url + '" alt="">';
				inventory_append += '</div>';
				inventory_append += '<h5>' + this.inventory_name + '</h5>';
				inventory_append += '</div>';

				$('#inventory_container').append(inventory_append);
			});

			//center_inventory_images();
		}
	});

	$('#inventory_container').on('click','.inventory_box',function(){
		$('#update_inventory_modal').modal('show');
		$('#inventory_add_box').val("");
		$('#inventory_distribute_box').val("");
	});

	function center_inventory_images(){
		$('.inventory_image_container').each(function(){
			var container_width = $(this).outerWidth();
			var container_height = $(this).outerHeight();
			var image_width = $(this).children('img').outerWidth();
			var image_height = $(this).children('img').outerHeight();

			var horizontal_offset  = (container_width/2) - (image_width/2);
			var vertical_offset = (container_height/2) - (image_height/2);

			$(this).children('img').css({ "margin-top" : vertical_offset , "margin-left" : horizontal_offset });
		});
	}
});