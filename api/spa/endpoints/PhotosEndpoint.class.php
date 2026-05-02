<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/../common/Endpoint.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Util.class.php'));
require_once(realpath(dirname(__FILE__) . '/../common/Validation.class.php'));

class PhotosEndpoint extends Endpoint
{
    private $errorAddFailed = 'Unable to add photo';
    private $errorGetFailed = 'Unable to get photos';
    private $messageAddSuccess = 'Photo has been added';
    private string $uploadDir;

    /**
     * This construct method is needed to initialize $uploadDir on class instance
     */
    public function __construct($allowed_methods = ['*'], $db = null, $networkUtil = null)
    {
        parent::__construct($allowed_methods, $db, $networkUtil);

        $this->uploadDir = realpath(dirname(__FILE__) . '/../uploads/');
    }

    /**
     * This method retrieves photos (based on user subscriber)
     *
     * test cases
     *   - ✅ missing token                           => 401
     *   - ✅ bad token                               => 401
     *   - ✅ no user subscriber                      => []
     *   - ✅ non-existent location                   => []
     *   - ✅ non-existent user                       => []
     *   - ✅ location not associated w/ subscriber   => []
     *   - ✅ user not associated w/ subscriber       => []
     *   - ✅ valid location filter                   => [photos for location]
     *   - ✅ valid user filter                       => [photos for user]
     *   - ✅ valid token                             => [photos for subscriber]
     */
    public function handle_get($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();
        $photos = [];

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        $googleId = (string) $parsedJwt->sub;
        $user = $this->db->get_user_by_google_id($googleId);
        $subscriberId = $user['subscriber_id'];

        // only retrieve photos if user has subscriber
        if (!is_null($subscriberId)) {
            $subscriberId = (int) $subscriberId;
            $filterLocationId = isset($_GET['location'])
                ? (int) $_GET['location']
                : null;
            $filterUserId = isset($_GET['user'])
                ? (int) $_GET['user']
                : null;

            if (!is_null($filterUserId)) {
                $filterUserId = (int) $filterUserId;

                $photos = $this->db->get_photos_for_user($subscriberId, $filterUserId);
            } else if (!is_null($filterLocationId)) {
                $filterLocationId = (int) $filterLocationId;

                $photos = $this->db->get_photos_for_location($subscriberId, $filterLocationId);
            } else {
                $photos = $this->db->get_photos_for_subscriber($subscriberId);
            }
        }

        http_response_code(200);
        echo Util::safe_json_encode($photos);
    }

    /**
     * This method adds a photo
     *
     * test cases
     *   - ✅ missing token                                     => 401
     *   - ✅ bad token                                         => 401
     *   - ✅ invalid params                                    => 400
     *   - ✅ location belongs to other subscriber              => 400
     *   - ✅ valid request w/o EXIF data + invalid lat and lng => 400
     *   - ⏳ ???                                               => 500, unknown error
     *   - ✅ valid request w/ EXIF data                        =>
     *     {'message' => 'Photo has been added', 'id' => INT, 'latLng' => array(2), 'name' => STRING, 'subscriberId' => INT }
     *   - ✅ valid request w/o EXIF data + valid lat and lng   =>
     *     {'message' => 'Photo has been added', 'id' => INT, 'latLng' => array(2), 'name' => STRING, 'subscriberId' => INT }
     */
    public function handle_post($req)
    {
        $this->networkUtil->sendApiHeaders();

        $parsedJwt = $this->networkUtil->requireValidJwt();

        // TODO - check if token is expired
        $hasValidToken = !is_null($parsedJwt);

        // if invalid token, $this->networkUtil->requireValidJwt returns bad request
        if (!$hasValidToken) {
            return;
        }

        $postData = $this->networkUtil->getPostData(true);

        // if FILES unavailable or location missing/invalid, return bad request
        if (
            is_null($postData)
            || is_null($postData['location_id'])
            || !is_numeric($postData['location_id'])
            || count($_FILES) < 1
        ) {
            http_response_code(400);
            echo Util::safe_json_encode([
                'error' => $this->errorAddFailed,
            ]);
            return;
        }

        $googleId = (string) $parsedJwt->sub;
        $locationId = (int) $postData['location_id'];
        $paramLat = array_key_exists('lat', $postData)
            ? $postData['lat']
            : null; // optional, only used if EXIF missing
        $paramLng = array_key_exists('lng', $postData)
            ? $postData['lng']
            : null; // optional, only used if EXIF missing
        $subscriberLocations = [];
        $uploadedImage = $_FILES['image'];

        $user = $this->db->get_user_by_google_id($googleId);
        $subscriberId = $user['subscriber_id'];
        $userId = $user['user_id']; // possibly NULL

        if (!is_null($userId)) {
            $userId = (int) $userId;
        }

        if (!is_null($subscriberId)) {
            $subscriberId = (int) $subscriberId;
            $subscriberLocations = $this->db->get_locations_for_subscriber($subscriberId);
        }

        $locationIsValid = Validation::checkLocationIdIsInArray($locationId, $subscriberLocations);

        if (is_null($userId) || !$locationIsValid) {
            http_response_code(400);
            echo Util::safe_json_encode([
                'error' => $this->errorAddFailed,
            ]);
            return;
        }

        $uploadedImageFilename = $uploadedImage['name'];
        // $uploadedImageSize = $uploadedImage['size'];
        $uploadedImageTempName = $uploadedImage['tmp_name'];
        $exif = exif_read_data(
            $uploadedImageTempName,
            null,
            true,
            false,
        );

        $latLng = Util::parseExifGps($exif);

        if (is_null($latLng)) {
            $latLng = [
                $paramLat,
                $paramLng
            ];
        }

        $hasValidLat = Validation::validateLatitude($latLng[0]);
        $hasValidLng = Validation::validateLongitude($latLng[1]);

        if (!$hasValidLat || !$hasValidLng) {
            http_response_code(400);
            echo Util::safe_json_encode([
                'error' => $this->errorAddFailed,
            ]);
            return;
        }

        $latTrimmed = substr((string) $latLng[0], 0, 12); // limit fractional digits for DB
        $lngTrimmed = substr((string) $latLng[1], 0, 13); // limit fractional digits for DB

        // !! explode() must be split into a separate line from end() call
        // !! because end() expects a variable passed by reference
        // !! more info - https://vijayasankarn.wordpress.com/2017/08/28/php-only-variables-should-be-passed-by-reference/
        $filenameParts = explode('.', $uploadedImageFilename);
        $extension = end($filenameParts);
        $uniqueName = uniqid();
        $filenameToSave = "$uniqueName.$extension";
        $uploadpath = "$this->uploadDir/$filenameToSave";

        // !! below actually saves image data in upload dir and adds to DB
        move_uploaded_file($uploadedImageTempName, $uploadpath);
        $photoId = $this->db->add_photo(
            $userId,
            $subscriberId,
            $latTrimmed,
            $lngTrimmed,
            $locationId,
            $filenameToSave
        );

        http_response_code(200);
        echo Util::safe_json_encode([
            'id' => $photoId,
            'latLng' => [
                $latTrimmed,
                $lngTrimmed,
            ],
            'message' => $this->messageAddSuccess,
            'name' => $filenameToSave,
            'subscriberId' => $subscriberId,
            // 'exif' => $exif,
            // 'uploadpath' => $uploadpath,
        ]);
    }
}
