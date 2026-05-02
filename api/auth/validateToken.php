<?php
    include('../derp.php');

    $is_valid = false;

    if( isset( $_COOKIE["access_token"] ) ) {
        $token = $_COOKIE[ "access_token" ];

       	$getToken = derp_query( "SELECT * FROM auth WHERE token LIKE '$token' LIMIT 1" );

        $is_valid = $getToken["numrows"] > 0;
    }

    echo json_encode( array( "validation" => $is_valid ) );

?>