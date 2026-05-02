<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class ManageAccessEndpoint extends Endpoint
{
    private $error_update_failed = 'Unable to update subscriber status';

    /**
     * This method handles PUT requests to update a user subscriber status.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void
     */
    public function handle_put($req = []): void
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
        $managingUser = $this->db->get_user_by_google_id($googleId);
        $managingUserIsAdminOrAbove = in_array(
            $managingUser['user_type'],
            ['ADMIN', 'OWNER']
        );

        $subscriberId = isset($postData['subscriberId']) && is_numeric($postData['subscriberId'])
            ? (int) $postData['subscriberId']
            : null;
        $subscriberStatus = isset($postData['subscriberStatus'])
            ? (string) $postData['subscriberStatus']
            : null;
        $userId = isset($postData['userId']) && is_numeric($postData['userId'])
            ? (int) $postData['userId']
            : null;

        $isValidSubscriberId = !is_null($subscriberId);
        $isValidStatus = !is_null($subscriberStatus) && in_array(
            $subscriberStatus,
            [
                'ACTIVE',
                'INACTIVE',
                // 'REQUESTED',
            ]
        );
        $isValidUserId = !is_null($userId);

        if (!$isValidSubscriberId || !$isValidStatus || !$isValidUserId) {
            http_response_code(400);
            echo Util::safe_json_encode(
                [
                    'error' => 'Missing or invalid PUT parameters',
                ]
            );
            return;
        }

        if (!$managingUserIsAdminOrAbove) {
            http_response_code(400);
            echo Util::safe_json_encode([
                'error' => $this->error_update_failed,
            ]);
            return;
        }

        $result = $this->db->update_user_subscriber_relationship($userId, $subscriberId, $subscriberStatus);

        if (!$result) {
            http_response_code(400);
            echo Util::safe_json_encode([
                'error' => $this->error_update_failed,
            ]);
            return;
        }

        http_response_code(200);
        echo Util::safe_json_encode(
            [
                'jwt' => $jwt,
            ]
        );
    }
}
