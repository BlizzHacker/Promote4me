$(document).ready(function(){

	var buttonSetting = {left: 'today prev,next ', center: 'title', right: 'month,agendaWeek,agendaDay'};
	var date = new Date();
	var m = date.getMonth();
	var y = date.getFullYear();
	var months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
	var event_date_object = null;
	var mysql_date = null;
	var event_element = null;

	var calendar = $('#calendar').fullCalendar({
		header: buttonSetting,
		selectable: true,
		selectHelper: true,
		droppable: false,
		draggable: false,
		select: function(start, end, allDay) {
			event_date_object = start;
			var event_date = new Date(start);
			var event_year = event_date.getFullYear();
			var event_day = event_date.getDate();
			var event_month = event_date.getMonth() + 1;

			if(event_day < 10)
			{
				event_day = "0" + event_day;
			}

			if(event_month < 10)
			{
				event_month = "0" + event_month;
			}

			mysql_date = event_year + "-" + event_month + "-" + event_day;

			$('#add_schedule_label').text("Add the events for " + event_month + "/" + event_day + "/" + event_year);
			$('#add_schedule_events').val("");
			$('#add_schedule_modal').modal('show');

			calendar.fullCalendar('unselect');
		},
		eventRender: function(event, element, calEvent) {
            $(element).find(".fc-event-title").attr('data-schedule-id',event.schedule_id);
        },
        eventClick : function(event,element,calEvent)
        {
        	event_element = $(element.currentTarget).find('.fc-event-title');

        	$('#edit_schedule_modal').attr('data-schedule-id',event.schedule_id);
        	$('#edit_schedule_events').text(event.title);
        	$('#edit_schedule_modal').modal('show');
        },
        eventStartEditable: false,
		editable: false,
		events: [
		]
	});

	$.ajax({
		url : SUBSCRIBER_API + "/schedules?token=" + $.cookie('access_token'),
		method : "GET",
		success : function(data)
		{
			$(data).each(function(){
				calendar.fullCalendar(
					'renderEvent',
					{
						title: this.schedule_events,
						start: this.schedule_date,
						schedule_id : this.schedule_id,
						allDay: true
					},
					true // make the event "stick"
				);
			});
		}
	});

	$('#edit_schedule_button').click(function(){

		var schedule_id = $('#edit_schedule_modal').attr('data-schedule-id');
		var schedule_events = $('#edit_schedule_events').val();

		var schedule_object = { "schedule_id" : schedule_id , "events" : schedule_events };

		$.ajax({
			dataType : 'json',
			url : SUBSCRIBER_API + "/editschedule?token=" + $.cookie("access_token"),
			method : "POST",
			data : schedule_object,
			success : function(data)
			{
				$('#edit_schedule_modal').modal('hide');
				$(event_element).text(schedule_events);
			}
		});
	});

	$('#delete_schedule_button').click(function(){
		var schedule_id = $('#edit_schedule_modal').attr('data-schedule-id');

		$.ajax({
			dataType : 'json',
			url : SUBSCRIBER_API + "/deleteSchedule?token=" + $.cookie("access_token") + "&schedule_id=" + schedule_id,
			method : "GET",
			success : function(data)
			{
				$('#edit_schedule_modal').modal('hide');
				$(event_element).closest('.fc-event').remove();
			}
		});
	});

	$('#add_schedule_button').click(function(){
		var events = $('#add_schedule_events').val();

		$.ajax({
			dataType : 'json',
			url : SUBSCRIBER_API + "/addschedule?token=" + $.cookie("access_token"),
			method : "POST",
			data : { "date" : mysql_date , "events" : events },
			success : function(data)
			{
				if(data.status == "ok")
				{
					calendar.fullCalendar(
						'renderEvent',
						{
							title: events,
							start: event_date_object,
							allDay: true
						},
						true // make the event "stick"
					);

					$('#add_schedule_modal').modal('hide');
				}
			}
		});
	});
});