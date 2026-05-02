<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class RegisterEndpoint extends Endpoint
{
    /**
     * This method handles POST requests to register a new user.
     * 
     * @param array $req The request parameters (not used in this method).
     * @return void
     */
    public function handle_post($req): void
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

        $googleId = $parsedJwt->sub;
        $userData = [
            'email' => $parsedJwt->email,
            'firstName' => $parsedJwt->given_name,
            'fullName' => $parsedJwt->name,
            'googleId' => $googleId,
            'lastName' => $parsedJwt->family_name,
            'picture' => $parsedJwt->picture,
        ];

        $postData = $this->networkUtil->getPostData(true);

        $avatar_url = $parsedJwt->picture;
        $email = isset($postData['email'])
            ? $postData['email']
            : null;
        $firstName = isset($postData['firstName'])
            ? $postData['firstName']
            : null;
        $lastName = isset($postData['lastName'])
            ? $postData['lastName']
            : null;
        $phoneNumber = isset($postData['phoneNumber'])
            ? $postData['phoneNumber']
            : null;
        $username = isset($postData['username'])
            ? $postData['username']
            : null;

        if (
            (is_null($email) || strlen($email) < 1) ||
            (is_null($firstName) || strlen($firstName) < 1) ||
            (is_null($lastName) || strlen($lastName) < 1) ||
            (is_null($username) || strlen($username) < 1)
        ) {
            echo Util::safe_json_encode(['error' => 'Missing required POST parameters']);
            http_response_code(400);
            return;
        }

        // TODO - add check that username does NOT already exist and return an error
        $newUserId = $this->db->add_user(
            $username,
            $firstName,
            $lastName,
            $email,
            $phoneNumber,
            $avatar_url,
            'ADMIN',
        );

        if ($newUserId === -1) {
            http_response_code(500);
            return;
        }

        $this->db->set_user_id_for_google_user($newUserId, $googleId);

        http_response_code(200);
        echo Util::safe_json_encode(
            [
                'jwt' => $jwt,
                'newUserId' => $newUserId,
            ]
        );
    }
}
