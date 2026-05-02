<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));
require_once(realpath(dirname(__FILE__) . '/../models/Profile.model.class.php'));

use Promote4Me\Models\Profile;

/**
 * This endpoint manages profile data
 */
class ProfileEndpoint extends Endpoint
{
    private $error_get_failed = 'Unable to get profile';

    /**
     * This method retrieves profile data based on the token present on
     * the request
     *
     * test cases
     *   - ✅ missing token        => 401
     *   - ✅ bad token            => 401
     *   - ✅ no user subscriber   => { ...profile_data, subscriberId: null, subscriberName: null }
     *   - ✅ valid token          => { ...profile_data }
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        // 1. user gets Google ID during login (from auth)
        $googleId = (string) $parsedJwt->sub;
        $user = $this->db->get_user_by_google_id($googleId);
        $user_id = $user['user_id']; // possibly NULL
        $relationships = [];

        // 2. user gets User ID during registration (after filling out form)
        // 3. user gets relationship as final step of registration
        if (!is_null($user_id)) {
            $user_id = (int) $user_id;
            $relationships = $this->db->get_user_subscriber_relationships($user_id);
        }

        $profile = new Profile($googleId);
        $profile->populate($user);
        $profile->relationships = $relationships;
        $profile->userId = $user_id;

        http_response_code(200);
        echo Util::safe_json_encode(
            $profile
        );
    }
}
