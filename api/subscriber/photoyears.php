<?php
    header("Access-Control-Allow-Origin: *");
header( 'CONTENT-TYPE: application/json' );


echo json_encode( [ "2021" , "2020" ] );

?>