<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class SwaggerEndpoint extends Endpoint
{
    public function handle_get($req)
    {
        http_response_code(200);

        include(realpath(dirname(__FILE__) . '/../web/index.html'));
    }
}
