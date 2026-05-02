<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/UsersEndpoint.class.php'));

$endpoint = new UsersEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
