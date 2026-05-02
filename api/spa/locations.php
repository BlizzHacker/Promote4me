<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/LocationsEndpoint.class.php'));

$endpoint = new LocationsEndpoint(['DELETE', 'GET', 'OPTIONS', 'POST']);

$endpoint->process_request();
