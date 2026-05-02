<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/InfoEndpoint.class.php'));

$endpoint = new InfoEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
