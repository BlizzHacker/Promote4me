<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/ProfileEndpoint.class.php'));

$endpoint = new ProfileEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
