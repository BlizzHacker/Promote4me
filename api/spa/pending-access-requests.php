<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/PendingAccessRequestsEndpoint.class.php'));

$endpoint = new PendingAccessRequestsEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
