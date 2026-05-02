<?php
    header("Access-Control-Allow-Origin: *");
	header( 'CONTENT-TYPE: application/json' );

    include( '../derp.php' );

    $return_value = array( 'status' => 'ok' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

	$getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
    $auth = $getAuth[ 'result' ];

    $subscriber_id = $auth[ 'subscriber_id' ];

	$startDate = !empty($_GET["sd"]) ? $_GET["sd"] : null;
	$endDate = !empty($_GET["ed"]) ? $_GET["ed"] : null;
	$users = !empty($_GET["u"]) ? $_GET["u"] : null;
	$locations = !empty($_GET["l"]) ? $_GET["l"] : null;
	
	$query = "select photos.photo_id, photos.user_id, photos.subscriber_id, photos.insert_date, photos.lat, photos.lng, photos.location_id, photos.photo_url, users.first_name, users.last_name from photos INNER JOIN users ON photos.user_id = users.user_id WHERE photos.subscriber_id = $subscriber_id";
	
	if($startDate != null)
	{
		$query .= " AND CAST(photos.insert_date AS DATE) >= CAST('$startDate' AS DATE)";
	}
	
	if($endDate != null)
	{
		$query .= " AND CAST(photos.insert_date AS DATE) <= CAST('$endDate' AS DATE)";
	}
	
	if($users != null)
	{
		$query .= " AND photos.user_id IN ($users)";
	}
	
	if($locations != null)
	{
		$query .= " AND photos.location_id IN ($locations)";
	}
	
	$getAnalytics = derp_query($query);

	echo json_encode($getAnalytics["result"]);
?>