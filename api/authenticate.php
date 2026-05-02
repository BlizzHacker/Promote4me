<?php
    header("ACCESS-CONTROL-ALLOW-ORIGIN: *");
    header("Access-Control-Allow-Headers: *");
    header("Content-Type: application/json");

    include('../derp.php');

    $email = isset($_POST[ 'email_address' ]) ? $_POST[ 'email_address' ] : NULL;
    $password = isset($_POST[ 'password' ]) ? $_POST[ 'password' ] : NULL;

    $return_value = array( 'status' => 'badlogin' );

            var_dump($_POST);

    if ( $email != NULL && $password != NULL ) {
        $password = sha1($password);

        $getUser = derp_query( "SELECT * FROM users WHERE email_address = '$email'" );

        var_dump($getUser);

        $user_exists = $getUser['numrows'] > 0;

        if ( $user_exists ) {
            $user = $getUser[ 'result' ];
            $user_id = $user[ 'user_id' ];
            $subscriber_id = $user[ 'subscriber_id' ];
            $token_string = sha1( $user_id  . $email  . time() );

            derp_query( "INSERT INTO auth ( user_id , subscriber_id , token ) VALUES ( $user_id , $subscriber_id , '$token_string' )" );

            $return_value = array( 'status' => 'ok' , 'token' => $token_string );
        }

    }

    
    echo json_encode($return_value);
?>