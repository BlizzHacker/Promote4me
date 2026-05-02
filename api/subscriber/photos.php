<?php
    header("Access-Control-Allow-Origin: *");
    header( 'CONTENT-TYPE: application/json' );

    include( '../derp.php' );

    $token = isset( $_GET[ 'token' ] ) ? $_GET[ 'token' ] : NULL;

    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );

	$auth = $getAuth[ 'result' ];

	$subscriber_id = $auth[ 'subscriber_id' ];

    $getPhotos = derp_query( "SELECT * FROM photos WHERE subscriber_id = $subscriber_id LIMIT 150" );

    $photos = $getPhotos[ 'result' ];

    if( $getPhotos["numrows"] == 1 ) {
    	$photos = [ $photos ];
    }

    echo json_encode( $photos );
?>