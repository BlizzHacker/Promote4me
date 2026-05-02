<?php

if(empty($_COOKIE["access_token"]))
{
	header("Location: login.php");
}
else
{
	header("Location: dashboard.php");
}

?>