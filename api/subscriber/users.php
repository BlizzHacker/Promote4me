<?php
    header("Access-Control-Allow-Origin: *");

    include( '../derp.php' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

    $getUsers = derp_query( "SELECT * FROM users WHERE subscriber_id IN ( SELECT subscriber_id from auth WHERE token = '$token' )" );

    $users = $getUsers[ 'result' ];

    if( $getUsers["numrows"] == 1 ) {
    	$users = [ $users ];
    }

    echo json_encode( $users );
?>