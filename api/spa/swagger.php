<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/SwaggerEndpoint.class.php'));

$endpoint = new SwaggerEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
