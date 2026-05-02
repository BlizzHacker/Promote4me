<?php

header('Content-Type: text');

include('derp.php');

$subscriber_id = 1;

$demoPhotos = 30;
$getUsers = derp_query("SELECT user_id FROM users WHERE `subscriber_id` = $subscriber_id");
$getLocations = derp_query("SELECT location_id,location_lat,location_lng FROM locations WHERE `subscriber_id` = $subscriber_id");
$locations = $getLocations["result"];
$numUsers = $getUsers["numrows"];

$daysBehind = ( 365 * 2 ) + 132;
$curDay = -1;

for( $i = 0; $i < $daysBehind; ++$i ) {

	$k = $i + 1;

	$getPhotos = derp_query( "SELECT photo_id FROM photos WHERE insert_date > DATE_SUB(NOW(), INTERVAL $i DAY) AND insert_date < DATE_SUB(NOW(), INTERVAL $k DAY)" );

	if( $getPhotos["numrows"] == 0 ) {

		for( $j = 1; $j < $numUsers; ++$j ) {
			//Sometimes users don't upload photos on some days due to their schedule. This simulates that.

			if( rand( 0 , 10 ) > 4 ) {

				$photosThatDay = rand( 1 , 5 );

				for( $m = 0; $m < $photosThatDay; ++$m ) {
					$location = $locations[ rand( 0 , count($locations) - 1 ) ];
					$location_id = $location["location_id"];
					$lat = $location["location_lat"];
					$lng = $location["location_lng"];

					$photo_url = "demo" . rand(0,30) . ".jpg";

					$query = "INSERT INTO photos (`user_id`,`subscriber_id`,`insert_date`,`lat`,`lng`,`location_id`,`photo_url`) VALUES ($j,$subscriber_id,DATE_SUB(NOW(), INTERVAL $i DAY),'$lat','$lng',$location_id,'$photo_url')";

					$addPhoto = derp_query( $query );
				}
			}
		}
	}
}

echo "DONE";

?>