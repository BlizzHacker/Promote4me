<?php
    header("Access-Control-Allow-Origin: *");
    header( 'CONTENT-TYPE: application/json' );

    include( '../derp.php' );

    $return_value = array( 'status' => 'ok' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;
    $schedule_id = isset( $_POST[ 'schedule_id' ] ) ? $_POST[ 'schedule_id' ] : NULL;
    $events  = isset( $_POST[ 'events' ] ) ? $_POST[ 'events' ] : NULL;

    /*
    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
    $auth = $getAuth[ 'result' ];

    $subscriber_id = $auth[ 'subscriber_id' ];
    */

    $addSchedule = derp_query( "UPDATE schedules SET events = '$events' WHERE schedule_id = $schedule_id" );
    
    echo json_encode( $return_value );
?>