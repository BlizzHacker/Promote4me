<?php
    header("Access-Control-Allow-Origin: *");

    include( '../derp.php' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

    $getSchedules = derp_query( "SELECT * FROM schedules WHERE subscriber_id IN ( SELECT subscriber_id from auth WHERE token = '$token' )" );

    $schedules = $getSchedules[ 'result' ];

    if( $getSchedules["numrows"] == 1 ) {
    	$schedules = [ $schedules ];
    }

    if( $getSchedules["numrows"] == 0 ) {
    	$schedules = [ ];
    }

    echo json_encode( $schedules );
?>