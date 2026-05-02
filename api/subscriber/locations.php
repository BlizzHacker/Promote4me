<?php
    header("Access-Control-Allow-Origin: *");

    include( '../derp.php' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );

    $auth = $getAuth[ 'result' ];
    $subscriber_id = $auth[ 'subscriber_id' ];

    $getLocations = derp_query( "SELECT * FROM locations WHERE subscriber_id = $subscriber_id" );
    $locations = $getLocations[ 'result' ];

    if( $getLocations["numrows"] == 1 ) {
    	$locations = [ $locations ];
    }

    echo json_encode( $locations );
?>