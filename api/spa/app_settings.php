<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/AppSettingsEndpoint.class.php'));

$endpoint = new AppSettingsEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
