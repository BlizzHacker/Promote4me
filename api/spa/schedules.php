<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/SchedulesEndpoint.class.php'));

$endpoint = new SchedulesEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
