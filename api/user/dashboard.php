<?php
    header("Access-Control-Allow-Origin: *");

    include('../derp.php');

    $return_value = array( 
        'status' => 'ok',
        'schedule' => 'N/A',
        'photos_month' => '0',
        'photos_week' => '0',
        'photos_today' => '0'
    );
    
    echo json_encode( $return_value );
?>