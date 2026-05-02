<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/TokenEndpoint.class.php'));

$endpoint = new TokenEndpoint(['OPTIONS', 'POST']);

$endpoint->process_request();
