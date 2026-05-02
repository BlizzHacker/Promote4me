<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    include('../derp.php');

    $email = $_POST["email_address"];
    $password = $_POST["password"];
    $username = $_POST["username"];
    $first_name = $_POST["name"];
    $phone = $_POST["phone_number"];

    $password = sha1($password);

    $getUser = derp_query("SELECT * FROM users WHERE email_address = '$email' LIMIT 1");

    $user_exists = $getUser->num_rows > 1;

    if(!$user_exists)
    {
        $user_id = $getUser["user_id"];
        $token_string = sha1($user_id  . $email  . time());

        $return_value = derp_query("INSERT INTO users (email_address,`password`,username,first_name,phone_number) VALUES ('$email','$password','$username','$first_name','$phone')");

        echo "INSERT INTO users (email_address,`password`,username,first_name,phone_number) VALUES ('$email','$password','$username','$first_name','$phone')";

        var_dump($return_value);
    }
    else
    {
        $return_value = array("status"=>"badlogin");
    }

    echo json_encode($return_value);

?>