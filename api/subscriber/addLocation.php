<?php
    header("Access-Control-Allow-Origin: *");

    include('../derp.php');

    $return_value = array( 'status' => 'ok' );

    $token = isset( $_POST[ 'token' ] ) ? $_POST[ 'token' ] : NULL;
    $name = isset( $_POST[ 'name' ] ) ? $_POST[ 'name' ] : NULL;
    $address = isset( $_POST[ 'address' ] ) ? $_POST[ 'address' ] : NULL;
    $lat = isset( $_POST[ 'lat' ] ) ? $_POST[ 'lat' ] : NULL;
    $lng = isset( $_POST[ 'lng' ] ) ? $_POST[ 'lng' ] : NULL;

    $getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );
    $auth = $getAuth[ 'result' ];

    $subscriber_id = $auth[ 'subscriber_id' ];

    $addLocation = derp_query( "INSERT INTO locations ( subscriber_id , location_name , location_address , location_lat , location_lng ) VALUES ( $subscriber_id , '$name' , '$address' , '$lat' , '$lng' )" );
    
    echo json_encode( $return_value );
?>