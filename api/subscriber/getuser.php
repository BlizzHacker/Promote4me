<?php
    header("Access-Control-Allow-Origin: *");
    header( 'CONTENT-TYPE: application/json' );

    include( '../derp.php' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;
    $user_id = isset( $_GET[ 'id' ] ) ? $_GET[ 'id' ] : NULL;

    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );

	$auth = $getAuth[ 'result' ];

	$subscriber_id = $auth[ 'subscriber_id' ];

    $getUser = derp_query( "SELECT * FROM users WHERE user_id = $user_id AND subscriber_id = $subscriber_id" );

    $user = $getUser[ 'result' ];

    echo json_encode($user);
?>