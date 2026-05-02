<?php

    header("Access-Control-Allow-Origin: *");
header('Content-type: application/json');
include('../derp.php');

// Directory where we're storing uploaded images
// Remember to set correct permissions or it won't work
$upload_dir = '../uploads';

$fileid = uniqid();
$tmpName = $_FILES['p4_image_upload']['name'];
$tmp = explode( '.' , $tmpName );
$ext = end( $tmp );
$filename = "$fileid.$ext";
$uploadpath = "$upload_dir/$filename";
$lat = 0.0;
$lng = 0.0;

if( isset( $_POST["lat"] ) || isset( $_POST["lng"] ) ) {
    $lat = isset( $_POST["lat"] ) ? $_POST["lat"] : 0.0;
    $lng = isset( $_POST["lng"] ) ? $_POST["lng"] : 0.0;    
}

move_uploaded_file( $_FILES[ 'p4_image_upload' ][ 'tmp_name' ] , $uploadpath );

$imageLocation = get_image_location( $uploadpath );
$token = derp_getvar( "token" );

$getAuth = derp_query( "SELECT subscriber_id , user_id FROM auth WHERE UPPER(token) = UPPER('$token')" );

$auth = $getAuth[ 'result' ];

$subscriber_id = $auth[ 'subscriber_id' ];
$user_id = $auth[ 'user_id' ];

$query = "INSERT INTO photos ( user_id , subscriber_id , lat , lng , photo_url ) VALUES ( $user_id , $subscriber_id , '$lat' , '$lng' , '$filename') ";

$addPhoto = derp_query( $query );

echo json_encode( array( "status" => "ok" , "file" => $filename ) );

?>