<?php
    header("Access-Control-Allow-Origin: *");
    include( '../derp.php' );

    $return_value = array( 'status' => 'ok' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;
    $schedule_id = isset( $_GET[ 'schedule_id' ] ) ? $_GET}[ 'schedule_id' ] : NULL;

    /*
    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
    $auth = $getAuth[ 'result' ];

    $subscriber_id = $auth[ 'subscriber_id' ];
    */

    $addSchedule = derp_query( "DELETE FROM schedules WHERE schedule_id = $schedule_id" );
    
    echo json_encode( $return_value );
?>