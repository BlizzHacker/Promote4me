<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/UserTypesEndpoint.class.php'));

$endpoint = new UserTypesEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
