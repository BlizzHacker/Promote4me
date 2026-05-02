<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/SubscribersEndpoint.class.php'));

$endpoint = new SubscribersEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
