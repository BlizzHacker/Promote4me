<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/IndexEndpoint.class.php'));

$endpoint = new IndexEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
