<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/PhotosEndpoint.class.php'));

$endpoint = new PhotosEndpoint(['GET', 'OPTIONS', 'POST']);

$endpoint->process_request();
