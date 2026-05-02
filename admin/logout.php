<?php

unset($_COOKIE["access_token"]);
setcookie('access_token', null, -1, '/');

header('Location: login.php');

?>