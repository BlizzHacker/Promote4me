<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/SettingsEndpoint.class.php'));

$endpoint = new SettingsEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
