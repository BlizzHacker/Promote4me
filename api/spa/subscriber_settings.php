<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/endpoints/SubscriberSettingsEndpoint.class.php'));

$endpoint = new SubscriberSettingsEndpoint(['GET', 'OPTIONS']);

$endpoint->process_request();
