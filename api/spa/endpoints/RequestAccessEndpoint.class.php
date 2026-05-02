<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class RequestAccessEndpoint extends Endpoint
{
    /**
     * This method handles POST requests to request access to a subscriber.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void
     */
    public function handle_post($req = []): void
    {
        $this->networkUtil->sendApiHeaders();

        $jwt = $this->networkUtil->getJwtHeader();
        $parsedJwt = $this->networkUtil->requireValidJwt();

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        $postData = $this->networkUtil->getPostData(true);
        $googleId = (string) $parsedJwt->sub;

        $subscriberId = isset($postData['subscriberId'])
            ? (int) $postData['subscriberId']
            : null;

        if (is_null($subscriberId)) {
            http_response_code(400);
            echo Util::safe_json_encode(
                [
                    'error' => 'Missing required POST parameters',
                ]
            );
            return;
        }

        // TODO - add check that request (user and sub combo) does NOT already exist and return an error

        $userDbResp = $this->db->get_user_by_google_id($googleId);
        $userId = (int) $userDbResp['user_id'];

        $this->db->add_user_subscriber_relationship($userId, $subscriberId);

        http_response_code(200);
        echo Util::safe_json_encode(
            [
                'jwt' => $jwt,
            ]
        );
    }
}
