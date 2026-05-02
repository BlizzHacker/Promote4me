<?php


    header("Access-Control-Allow-Origin: *");
    header("Content-Type: application/json");

$base = array( "subscriber_city" => "Salt Lake City" , "subscriber_state" => "UT" );

echo json_encode($base);

?>