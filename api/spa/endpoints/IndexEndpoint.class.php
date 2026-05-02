<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));

use DateTime;
// use OpenApi\Annotations as OA;

class IndexEndpoint extends Endpoint
{

    /**
     * This method handles GET requests to the index endpoint.
     * 
     * @param array $req The request parameters.
     * @return void
     * 
     * @OA\Get(
     *     path="/",
     *     summary="summary",
     *     description="description",
     *     @OA\Response(
     *         response=200,
     *         description="Success",
     *     ), 
     * )
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendApiHeaders();

        $tokenIsExpired = true;
        $now = new DateTime();

        $queryToken = $this->networkUtil->getJwtQuery($req);
        $headerToken = $this->networkUtil->getJwtHeader();
        // default to header if present, use query param as fallback
        $parsedJwt = Util::parse_jwt($headerToken ?? $queryToken);
        // $user = null;
        // $subscriberLocations = [];

        $hasValidToken = !is_null($parsedJwt);

        if ($hasValidToken) {
            $tokenExpiry = $parsedJwt->exp;

            $dateExpiry = new DateTime();
            $dateExpiry->setTimestamp($tokenExpiry);
            // $expiryFormatted = $dateExpiry->format('Y-m-d H:i:s');

            $tokenIsExpired = $dateExpiry < $now;

            // $googleId = (string) $parsedJwt->sub;
            // $user = $this->db->get_user_by_google_id($googleId);
            // $subscriberId = $user['subscriber_id'];
            // $subscriberLocations = [];

            // // only retrieve locations if user has subscriber
            // if (!is_null($subscriberId)) {
            //     $subscriberId = (int) $subscriberId;
            //     $subscriberLocations = $this->db->get_locations_for_subscriber($subscriberId);
            // }
        }

        http_response_code(200);

        echo Util::safe_json_encode(
            [
                'status' => "s'all good",
                'tokenIsExpired' => $tokenIsExpired,
                'parsedJwt' => $parsedJwt,
                'headerToken' => $headerToken,
                'queryToken' => $queryToken,
                // 'locations' => $subscriberLocations,
                // 'user' => $user,
            ]
        );
    }
}
