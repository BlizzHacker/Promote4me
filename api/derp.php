<?php

global $db;

try {
    $db = new mysqli("srv1283.hstgr.io","u727598957_promote4me","Promote4me!","u727598957_promote4me");
    // $db = new mysqli("193.46.196.1","u727598957_promote4me","Promote4me!","u727598957_promote4me");
    // $db = new mysqli("localhost","root","","promote4me");
} catch (mysqli_sql_exception $ex) {
    echo "Derp file encountered problem while connecting to DB";
}

function derp_escape($string){
  global $db;
  return $db->real_escape_string($string);
}

function derp_sessionvar($name){
  return isset($_SESSION[$name]) ? derp_escape($_SESSION[$name]) : null;
}

function derp_postvar($name){
  if(isset($_POST[$name])){
    if(!is_array($_POST[$name])){
      return isset($_POST[$name]) ? derp_escape($_POST[$name]) : null;
    }else{
      return isset($_POST[$name]) ? $_POST[$name] : null;
    }
  }else{
    return null;
  }
}

function derp_getvar($name){
  if(!is_array($_GET[$name])){
    return isset($_GET[$name]) ? derp_escape($_GET[$name]) : null;
  }else{
    return isset($_GET[$name]) ? $_GET[$name] : null;
  }
}

function derp_query($query){
  global $db;
  
  $status = array(
    "error" => null,
    "result" => null,
    "numrows" => 0,
    "insert_id" => -1,
    "query" => ""
  );

  $status["query"] = $query;
  
  $result = $db->query($query);
  
  if(trim($db->error) == ""){
    if($db->insert_id != 0){
      $status["insert_id"] = $db->insert_id;
    }
    
    if(isset($result->num_rows)){
      
      $status["numrows"] = $result->num_rows;
      
      if($result->num_rows == 1){
        $status["result"] = $result->fetch_assoc();
      }else if($result->num_rows > 1){
        $rows = [];

        while($row = $result->fetch_assoc()){
          array_push($rows,$row);
        }

        $status["result"] = $rows;
      }
      
    }
  }else{
    $status["error"] = $db->error;
  }
  
  return $status;
}

function safe_json_encode($value, $options = 0, $depth = 512, $utfErrorFlag = false) {
  $encoded = json_encode($value, $options, $depth);
  switch (json_last_error()) {
    case JSON_ERROR_NONE:
      return $encoded;
    case JSON_ERROR_DEPTH:
      return 'Maximum stack depth exceeded'; // or trigger_error() or throw new Exception()
    case JSON_ERROR_STATE_MISMATCH:
      return 'Underflow or the modes mismatch'; // or trigger_error() or throw new Exception()
    case JSON_ERROR_CTRL_CHAR:
      return 'Unexpected control character found';
    case JSON_ERROR_SYNTAX:
      return 'Syntax error, malformed JSON'; // or trigger_error() or throw new Exception()
    case JSON_ERROR_UTF8:
      $clean = utf8ize($value);
      if ($utfErrorFlag) {
        return 'UTF8 encoding error'; // or trigger_error() or throw new Exception()
      }
      return safe_json_encode($clean, $options, $depth, true);
    default:
      return 'Unknown error'; // or trigger_error() or throw new Exception()
  }
}

function utf8ize($mixed) {
  if (is_array($mixed)) {
    foreach ($mixed as $key => $value) {
      $mixed[$key] = utf8ize($value);
    }
  } else if (is_string ($mixed)) {
    return utf8_encode($mixed);
  }
  
  return $mixed;
}

?>