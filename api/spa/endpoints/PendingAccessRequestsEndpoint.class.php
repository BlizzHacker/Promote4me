<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class PendingAccessRequestsEndpoint extends Endpoint
{
    /**
     * Handle GET requests to retrieve pending access requests.
     * 
     * Returns pending access requests for subscribers associated with the
     * authenticated admin user.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void Outputs JSON response directly
     */
    public function handle_get($req = []): void
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();

        // If invalid token, requireValidJwt returns 401 and we exit
        if (is_null($parsedJwt)) {
            return;
        }

        $googleId = (string) $parsedJwt->sub;
        $user = $this->db->get_user_by_google_id($googleId);

        // Check if user is ADMIN or OWNER
        $isAdminOrOwner = in_array(
            $user['user_type'],
            ['ADMIN', 'OWNER']
        );

        if (!$isAdminOrOwner) {
            http_response_code(403);
            echo Util::safe_json_encode([
                'error' => 'Forbidden',
            ]);
            return;
        }

        $userId = (int) $user['user_id'];
        $pendingRequests = $this->db->get_access_requests_for_admin($userId, 'REQUESTED');

        http_response_code(200);
        echo Util::safe_json_encode([
            'pendingRequests' => $pendingRequests,
        ]);
    }
}
