<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));

class InfoEndpoint extends Endpoint
{
    /**
     * This method handles GET requests to provide PHP info.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendContentHeaders();

        http_response_code(200);

        phpinfo();
    }
}
