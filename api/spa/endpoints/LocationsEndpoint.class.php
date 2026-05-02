<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Validation.class.php'));

// use Promote4Me\Models\Location;

/**
 * This endpoint manages location data
 */
class LocationsEndpoint extends Endpoint
{
    private $error_add_failed = "Unable to add location";
    private $error_delete_failed = "Unable to delete location";
    private $error_get_failed = "Unable to get locations";

    /**
     * This method adds a location (based on user subscriber)
     *
     * test cases
     *   - ✅ missing token        => 401
     *   - ✅ bad token            => 401
     *   - ✅ non-admin user       => 400
     *   - ✅ invalid params       => 400
     *   - ✅ duplicate location   => 400
     *   - ⏳ ???                  => 500, unknown error
     *   - ✅ valid request        => {"message" => "Location has been added", "id" => INT}
     */
    public function handle_post($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        $postData = $this->networkUtil->getPostData(true);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        if (is_null($postData)) {
            http_response_code(400);
            echo Util::safe_json_encode([
                "error" => $this->error_add_failed,
            ]);
            return;
        }

        $location_address = array_key_exists("address", $postData)
            ? $postData["address"]
            : null;
        $location_city = array_key_exists("city", $postData)
            ? $postData["city"]
            : null;
        $location_latitude = array_key_exists("latitude", $postData)
            ? $postData["latitude"]
            : null;
        $location_longitude = array_key_exists("longitude", $postData)
            ? $postData["longitude"]
            : null;
        $location_name = array_key_exists("name", $postData)
            ? $postData["name"]
            : null;
        $location_state = array_key_exists("state", $postData)
            ? $postData["state"]
            : null;

        $has_valid_params = $this->check_location_is_valid(
            $location_address,
            $location_city,
            $location_latitude,
            $location_longitude,
            $location_name,
            $location_state,
        );

        // validate request user
        $googleId = (string) $parsedJwt->sub;
        $user = $this->db->get_user_by_google_id($googleId);
        $user_is_admin_or_above = $user["user_type"] === "ADMIN" || $user["user_type"] === "OWNER";
        $subscriber_id = $user["subscriber_id"];
        $subscriber_locations = [];

        // only retrieve locations if user has subscriber
        if (!is_null($subscriber_id)) {
            $subscriber_id = (int) $subscriber_id;
            $subscriber_locations = $this->db->get_locations_for_subscriber($subscriber_id);
        }

        // validate new location data
        $location_is_duplicate = $this->check_location_exists(
            [
                "location_address" => $location_address,
                "location_city" => $location_city,
                "location_lat" => $location_latitude,
                "location_lng" => $location_longitude,
                "location_name" => $location_name,
                "location_state" => $location_state,
            ],
            $subscriber_locations
        );

        $can_user_add_location = $user_is_admin_or_above
            && $has_valid_params
            && !$location_is_duplicate;

        if (!$can_user_add_location) {
            http_response_code(400);
            echo Util::safe_json_encode([
                "error" => $this->error_add_failed,
            ]);
            return;
        }

        $inserted_id = $this->db->add_location(
            $subscriber_id,
            $location_name,
            $location_address,
            $location_city,
            $location_state,
            $location_latitude,
            $location_longitude,
        );

        http_response_code(200);
        echo Util::safe_json_encode([
            "message" => "Location has been added",
            "id" => (int) $inserted_id,
            "subscriberId" => $subscriber_id,
        ]);
    }

    /**
     * This method deletes a location (based on user subscriber)
     *
     * test cases
     *   - ✅ missing id     => 400
     *   - ✅ missing token  => 401
     *   - ✅ non-admin user => 400
     *   - ✅ id is -1       => 400, invalid id
     *   - ✅ id is 0        => 400, invalid id
     *   - ✅ id is 1        => 400, invalid id
     *   - ✅ id is ""       => 400, invalid id
     *   - ✅ id is "one"    => 400, invalid id
     *   - ✅ id is 518      => 400, valid id but for wrong subscriber
     *   - ✅ id is 599      => 400, location does not exist
     *   - ⏳ ???            => 500, unknown error
     *   - ✅ id is 500      => {"message" => "Location w/ id " . $location_id . " has been deleted"}
     */
    public function handle_delete($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        $can_user_delete_location = false;
        $location_id = -1;

        // parse_url($_SERVER['REQUEST_URI']) // can use to get "path", "query"
        $location_id = isset($_SERVER["HTTP_ID"]) ? (int) $_SERVER["HTTP_ID"] : -1;
        $has_valid_location_id = $location_id !== -1;

        if ($hasValidToken && $has_valid_location_id) {
            // validate request user
            $googleId = (string) $parsedJwt->sub;
            $user = $this->db->get_user_by_google_id($googleId);
            $user_is_admin_or_above = $user["user_type"] === "ADMIN" || $user["user_type"] === "OWNER";
            $subscriber_id = $user["subscriber_id"];
            $subscriber_locations = [];

            // only retrieve locations if user has subscriber
            if (!is_null($subscriber_id)) {
                $subscriber_id = (int) $subscriber_id;
                $subscriber_locations = $this->db->get_locations_for_subscriber($subscriber_id);
            }

            // validate request location
            $index_of_location = array_search(
                $location_id,
                array_column($subscriber_locations, "location_id"),
                true, // ensure type and value both match
            );
            $location_belongs_to_same_subscriber = is_int($index_of_location);

            $can_user_delete_location = $user_is_admin_or_above && $location_belongs_to_same_subscriber;
        }

        if (!$can_user_delete_location) {
            http_response_code(400);
            echo Util::safe_json_encode([
                "error" => $this->error_delete_failed,
            ]);
            return;
        }

        $was_location_deleted = $this->db->delete_location($location_id);

        if (!$was_location_deleted) {
            http_response_code(500);
            echo Util::safe_json_encode([
                "error" => $this->error_delete_failed,
            ]);
            return;
        }

        http_response_code(200);
        echo Util::safe_json_encode([
            "message" => "Location with id $location_id has been deleted",
        ]);
    }

    /**
     * This method retrieves locations (based on user subscriber)
     *
     * test cases
     *   - ✅ missing token        => 401
     *   - ✅ bad token            => 401
     *   - ✅ no user subscriber   => []
     *   - ✅ valid token          => [locations]
     *   - ✅ hasPhotos=true       => [locations with photos]
     *   - ✅ hasPhotos=false      => [locations without photos]
     *   - ✅ hasPhotos=invalid    => 400
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();
        $subscriber_locations = [];

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        // Parse and validate hasPhotos filter
        $hasPhotosFilter = $this->parse_has_photos_filter();

        if ($hasPhotosFilter === 'invalid') {
            http_response_code(400);
            echo Util::safe_json_encode([
                "error" => "Invalid hasPhotos value. Use 'true' or 'false'."
            ]);
            return;
        }

        $googleId = (string) $parsedJwt->sub;
        $user = $this->db->get_user_by_google_id($googleId);
        $subscriber_id = $user["subscriber_id"];

        // only retrieve locations if user has subscriber
        if (!is_null($subscriber_id)) {
            $subscriber_id = (int) $subscriber_id;
            $subscriber_locations = $this->db->get_locations_for_subscriber($subscriber_id, $hasPhotosFilter);
        }

        http_response_code(200);
        echo Util::safe_json_encode($subscriber_locations);
    }

    /**
     * This method checks if given location already exists for a subscriber;
     * returns true if the provided location is a duplicate, false otherwise
     *
     * Note - DB stores lat and lng as strings, so this method converts those
     * values to floats for accurate comparison
     */
    private function check_location_exists($new_location, array $existing_subscriber_locations): bool
    {
        foreach ($existing_subscriber_locations as $existing_location) {
            if (
                $new_location["location_address"] === $existing_location["location_address"]
                && $new_location["location_city"] === $existing_location["location_city"]
                && floatval($new_location["location_lat"]) === floatval($existing_location["location_lat"])
                && floatval($new_location["location_lng"]) === floatval($existing_location["location_lng"])
                && $new_location["location_name"] === $existing_location["location_name"]
                && $new_location["location_state"] === $existing_location["location_state"]
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Parses the hasPhotos query parameter from the request.
     *
     * @return bool|string|null Returns:
     *   - true if hasPhotos=true
     *   - false if hasPhotos=false
     *   - null if parameter not provided
     *   - 'invalid' if parameter has invalid value
     */
    private function parse_has_photos_filter(): bool|string|null
    {
        if (!isset($_GET['hasPhotos'])) {
            return null;
        }

        $value = $_GET['hasPhotos'];

        if ($value === 'true') {
            return true;
        }

        if ($value === 'false') {
            return false;
        }

        return 'invalid';
    }

    /**
     * This method checks if the provided values are valid for new location;
     * returns true if all params are valid, false otherwise
     *
     * Note - latitude is valid between -90 and 90
     * Note - longitude is valid between -180 and 180
     */
    private function check_location_is_valid(
        string | null $location_address,
        string | null $location_city,
        string | null $location_latitude,
        string | null $location_longitude,
        string | null $location_name,
        string | null $location_state,
    ): bool {
        $has_valid_strings = !is_null($location_address) && strlen($location_address) > 0
            && !is_null($location_city) && strlen($location_city) > 0
            && !is_null($location_name) && strlen($location_name) > 0
            && !is_null($location_state) && strlen($location_state) > 0;

        $has_valid_lat = !is_null($location_latitude) && strlen($location_latitude) > 0 && is_numeric($location_latitude);

        if ($has_valid_lat) {
            $lat_num = floatval($location_latitude);
            $has_valid_lat = Validation::validateLatitude($lat_num);
        }

        $has_valid_lng = !is_null($location_longitude) && strlen($location_longitude) > 0 && is_numeric($location_longitude);

        if ($has_valid_lng) {
            $lng_num = floatval($location_longitude);
            $has_valid_lng = Validation::validateLongitude($lng_num);
        }

        return $has_valid_strings && $has_valid_lat && $has_valid_lng;
    }
}
