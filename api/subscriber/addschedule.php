<?php
    header("Access-Control-Allow-Origin: *");
    header( 'CONTENT-TYPE: application/json' );

    include( '../derp.php' );

    $return_value = array( 'status' => 'ok' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;
    $date = isset( $_POST[ 'date' ] ) ? $_POST[ 'date' ] : NULL;
    $events  = isset( $_POST[ 'events' ] ) ? $_POST[ 'events' ] : NULL;

    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
    $auth = $getAuth[ 'result' ];

    $subscriber_id = $auth[ 'subscriber_id' ];

    $addSchedule = derp_query( "INSERT INTO schedules ( subscriber_id , schedule_date , schedule_events ) VALUES ( $subscriber_id , '$date' , '$events' )" );
    
    echo json_encode( $return_value );
?>