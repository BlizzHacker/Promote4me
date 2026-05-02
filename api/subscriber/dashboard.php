<?php
    header("Access-Control-Allow-Origin: *");
header( 'CONTENT-TYPE: application/json' );

include( '../derp.php' );

$return_value = array( 'status' => 'ok' );

$token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

$getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
$auth = $getAuth[ 'result' ];

$subscriber_id = $auth[ 'subscriber_id' ];

$query = "select"; 
$query .= "(select count(photo_id) from photos where MONTH(insert_date) = MONTH(CURRENT_TIMESTAMP) AND subscriber_id = $subscriber_id) as photos_month,";
$query .= "(select count(photo_id) from photos where DATE(insert_date) = DATE(CURRENT_TIMESTAMP) AND subscriber_id = $subscriber_id) as photos_day,";
$query .= "(select LENGTH(schedule_events) - LENGTH(REPLACE(schedule_events, '\n', '')) from schedules where DAY(schedule_date) = DAY(CURRENT_TIMESTAMP) AND subscriber_id = $subscriber_id LIMIT 1) as events_day,";
$query .= "(select schedule_events from schedules where DAY(schedule_date) = DAY(CURRENT_TIMESTAMP) AND subscriber_id = $subscriber_id LIMIT 1) as events";

$dashboard_counts = derp_query($query)["result"];

$query = "select count(*) as photo_count, DATE(insert_date) as photo_date from photos where insert_date > (CURRENT_TIMESTAMP - INTERVAL 30 DAY) AND subscriber_id = $subscriber_id GROUP BY DAY(insert_date)";

$photo_counts = derp_query($query)["result"];

$query = "select (select CONCAT(u.first_name,' ',u.last_name) from users u WHERE u.user_id = p.user_id) as user_name, count(*) as photo_count from photos p where insert_date > (CURRENT_TIMESTAMP - INTERVAL 30 DAY) AND subscriber_id = $subscriber_id GROUP BY user_id ORDER BY photo_count DESC LIMIT 4";

$user_photo_counts = derp_query($query)["result"];

echo json_encode(array("status"=>"ok","counts"=>$dashboard_counts,"photos"=>$photo_counts,"user_counts"=>$user_photo_counts));

?>