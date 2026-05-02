<?php
    include('../derp.php');

    $R = 6371;

    $lat = isset($_GET["lat"]) ? $_GET["lat"] : null;
    $lon = isset($_GET["lng"]) ? $_GET["lng"] : null;
    
    
    $distance = 1; 
    $rad = $distance / $R;

    $radR = rad2deg($rad/$R);
    $max_lat = $lat + radR;
    $min_lat = $lat - radR;
    $radR = rad2deg($rad/$R/cos(deg2rad($lat)));
    $max_lon = $lon + radR;


    $query = 'SELECT * FROM locations WHERE ';
    $query .= '(latitude > ' . $min_lat . ' AND latitude < ' . $max_lat . ')';
    $query .= ' AND (longitude > ' . $min_lon . ' AND longitude < ' . $max_lon . ')';
    // refining query -- this part returns no results
    $query .= ' AND acos(sin('.deg2rad($lat).') * sin(radians(latitude)) + cos('.deg2rad($lat).') ' 
    $query .= '* cos(radians(latitude)) * cos(radians(longitude) - ('.deg2rad($lon).'))) <= '.$rad;

?>