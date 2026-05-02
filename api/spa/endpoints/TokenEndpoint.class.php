<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

class TokenEndpoint extends Endpoint
{
    private readonly array $env;
    private readonly string $cookie_name;

    public function __construct($allowed_methods = ['*'])
    {
        parent::__construct($allowed_methods);

        $this->cookie_name = 'p4mejwt';
        $this->env = parse_ini_file(realpath(dirname(__FILE__) . '/../.env'));
    }

    /**
     * This method adds a google user (if applicable), queries available data
     * (using JWT token) from DB, and sets a cookie (to maintain login status)
     *
     * test cases
     *   - ✅ missing token                                         => 401
     *   - ✅ bad token                                             => 401
     *   - ⏳ ???                                                   => 500, unknown error
     *   - ✅ valid request when GoogleUser does not exist          =>
     *     { 'added' => true, 'hasSubscriberRelationships' => false, 'hasUserAccount' => false, 'jwt' => STRING, 'user' => ARRAY }
     *   - ✅ valid request when GoogleUser exists w/ relationships => ???
     *     { 'added' => false, 'hasSubscriberRelationships' => true, 'hasUserAccount' => true, 'jwt' => STRING, 'user' => ARRAY }
     */
    public function handle_post($req): void
    {
        $this->networkUtil->sendApiHeaders();

        $jwtString = $this->networkUtil->getJwtHeader();
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
            'subscriberRelationships' => [],
        ];

        $googleUser = $this->db->get_google_user($googleId);

        $added = false;
        $hasUserAccount = false;
        $hasSubscriberRelationships = false;
        $userId = null;
        $username = null;

        if (is_null($googleUser)) {
            $this->db->add_google_user($googleId);

            $added = true;
        } else {
            $hasUserAccount = !is_null($googleUser['user_id']);
        }

        if ($hasUserAccount) {
            $userId = $googleUser['user_id'];

            $user = $this->db->get_user_by_id($userId);

            $username = $user['username'];

            $userData['userId'] = $userId;
            $userData['username'] = $username;

            $userSubscriberRelationships = $this->db->get_user_subscriber_relationships($userId);

            $hasSubscriberRelationships = count($userSubscriberRelationships) > 0;
            $userData['subscriberRelationships'] = $userSubscriberRelationships;
        }

        // cannot set 'localhost' as domain, more info - 
        // https://www.php.net/manual/en/function.setcookie.php#73107
        $cookieDomain = $this->env['COOKIE_DOMAIN'] === 'localhost'
            ? false
            : $this->env['COOKIE_DOMAIN'];
        $cookieExpiry = time() + 60 * 60; // 0 // timestamp
        $cookiePath = '/';

        setcookie(
            $this->cookie_name,
            $jwtString, // cookie value
            $cookieExpiry,
            $cookiePath,
            $cookieDomain,
            false, // secure
            false, // HTTP only
        );

        http_response_code(200);
        echo Util::safe_json_encode(
            [
                'added' => $added,
                'hasSubscriberRelationships' => $hasSubscriberRelationships,
                'hasUserAccount' => $hasUserAccount,
                'jwt' => $jwtString,
                'user' => $userData,
            ]
        );
    }
}
