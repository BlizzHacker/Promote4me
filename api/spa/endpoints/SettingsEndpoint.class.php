<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class SettingsEndpoint extends Endpoint
{
    /**
     * This method handles GET requests to retrieve all settings.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendApiHeaders();

        $allSettings = $this->db->get_settings_all();

        http_response_code(200);

        echo Util::safe_json_encode($allSettings);
    }
}
