<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/RequestAccessEndpoint.class.php'));

$endpoint = new RequestAccessEndpoint(['OPTIONS', 'POST']);

$endpoint->process_request();
