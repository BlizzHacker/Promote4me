<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/ManageAccessEndpoint.class.php'));

$endpoint = new ManageAccessEndpoint(['OPTIONS', 'PUT']);

$endpoint->process_request();
