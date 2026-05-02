<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/RegisterEndpoint.class.php'));

$endpoint = new RegisterEndpoint(['OPTIONS', 'POST']);

$endpoint->process_request();
