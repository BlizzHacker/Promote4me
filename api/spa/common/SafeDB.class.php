<?php

namespace Promote4Me;

use MySQLi;
use mysqli_sql_exception;

// more info - https://www.php.net/manual/en/mysqli.quickstart.prepared-statements.php
// TODO - switch to PDO as shown in
// https://github.com/docker/docker-php-sample/blob/main/src/database.php
class SafeDB
{
    protected static $initialized = FALSE;
    protected static $client;

    public function __construct()
    {
        if (!self::$initialized) {
            // Do something once here for _all_ usages
            try {
                self::$client = SafeDB::get_client_connection();

                self::$initialized = true;
            } catch (mysqli_sql_exception $ex) {
                // Only output error message if not in test environment
                if (!defined('PHPUNIT_COMPOSER_INSTALL') && !class_exists('PHPUnit\Framework\TestCase', false)) {
                    echo 'Failed to create mysqli client\n';
                }
                // throw $th;
            }
        }
    }

    public function __destruct()
    {
        // this code is optional - 'Open non-persistent MySQL connections and
        // result sets are automatically closed when their objects are 
        // destroyed. Explicitly closing open connections and freeing result
        // sets is optional' - https://www.php.net/manual/en/mysqli.close.php

        // if (self::$initialized) {
        //     self::$client->close();
        // }
    }

    private static function get_client_connection()
    {
        $env = [
            'DB_HOST' => 'localhost',
            'DB_NAME' => '',
            'DB_PASS' => '',
            'DB_PORT' => '3306',
            'DB_USER' => 'root',
        ];
        $env_location = realpath(
            dirname(__FILE__) . '/../.env'
        );

        try {
            $env = parse_ini_file($env_location);
        } catch (\Throwable $th) {
            echo "Failed to read .env file at location '$env_location'";
        }

        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

        $host = getenv('DB_HOST');

        if (!$host) {
            $host = $env['DB_HOST'];
        }

        return new MySQLi(
            // !! should be done in env var, NOT here in source
            // !! prepend 'p:' to create persistent connection
            // !! more info - https://www.php.net/manual/en/mysqli.persistconns.php
            // 'p:' . $env['DB_HOST'];
            $host,
            $env['DB_USER'],
            $env['DB_PASS'],
            $env['DB_NAME'],
            isset($env['DB_PORT'])
                ? intval($env['DB_PORT'])
                : null,
        );
    }

    /**
     * This method adds a user to the DB w/ specified type and returns the
     * insert_id of the new user or `-1` when unsuccessful (e.g. for
     * invalid / duplicate entry)
     * 
     * @param string $username
     * @param string $firstName
     * @param string $lastName
     * @param string $email
     * @param string|null $phoneNumber
     * @param string|null $avatarUrl
     * @param string|null $userType 'ADMIN' | 'USER' | 'DEMO' | 'OWNER'
     */
    public function add_user(
        string $username,
        string $firstName,
        string $lastName,
        string $email,
        string|null $phoneNumber = null,
        string|null $avatarUrl = null,
        string|null $userType = 'USER',
    ) {
        $getUserType = $this->get_user_type($userType);

        $userTypeId = $getUserType['user_type_id'];

        $addAdminStmt = self::$client->prepare(
            'INSERT INTO users
            (
                username,
                first_name,
                last_name,
                email_address,
                phone_number,
                avatar_url,
                user_type
            )
            VALUES (?, ?, ?, ?, ?, ?, ?);'
        );

        // 's' means that val is bound as a string
        // 'i' means that val is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $addAdminStmt->bind_param(
            'ssssssi',
            $username,
            $firstName,
            $lastName,
            $email,
            $phoneNumber,
            $avatarUrl,
            $userTypeId
        );

        try {
            $addAdminStmt->execute();

            return $addAdminStmt->insert_id;
        } catch (mysqli_sql_exception $ex) {
            if (str_starts_with($ex->getMessage(), 'Duplicate entry')) {
                // username or email already exists
            }

            return -1;
        }
    }

    /**
     * This method adds a google user using googleId and optional userId and
     * returns the insert_id
     *
     * @param string $googleId
     * @param int|null $userId
     */
    public function add_google_user($googleId, $userId = null)
    {
        if (is_null($userId)) {
            $addGoogleUserStmt = self::$client->prepare(
                'INSERT INTO GoogleUsers (google_id, user_id)
                VALUES(?, NULL);'
            );

            // 's' means that $googleId is bound as a string
            // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
            $addGoogleUserStmt->bind_param(
                's',
                $googleId,
            );
        } else {
            $addGoogleUserStmt = self::$client->prepare(
                'INSERT INTO GoogleUsers (google_id, user_id)
                 VALUES(?, ?);'
            );
            // 's' means that $googleId is bound as a string
            // 'i' means that $userId is bound as an int
            // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
            $addGoogleUserStmt->bind_param(
                'si',
                $googleId,
                $userId,
            );
        }

        $addGoogleUserStmt->execute();

        return $addGoogleUserStmt->insert_id;
    }

    /**
     * This method adds a location and returns the insert_id
     *
     * @param int $subscriberId
     * @param string $locationName
     * @param string $locationAddress
     * @param string $locationCity
     * @param string $locationState
     * @param string $locationLatitude
     * @param string $locationLongitude
     */
    public function add_location(
        int $subscriberId,
        string $locationName,
        string $locationAddress,
        string $locationCity,
        string $locationState,
        string $locationLatitude,
        string $locationLongitude,
    ) {
        $addLocationStmt = self::$client->prepare(
            'INSERT INTO locations (
                subscriber_id,
                location_name,
                location_address,
                location_city,
                location_state,
                location_lat,
                location_lng
            )
            VALUES(?, ?, ?, ?, ?, ?, ?);'
        );

        // 'i' means that val is bound as an integer
        // 's' means that val is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $addLocationStmt->bind_param(
            'issssss',
            $subscriberId,
            $locationName,
            $locationAddress,
            $locationCity,
            $locationState,
            $locationLatitude,
            $locationLongitude,
        );

        $addLocationStmt->execute();

        return $addLocationStmt->insert_id;
    }

    /**
     * This method adds a photo and returns the insert_id
     *
     * @param int $userId
     * @param int $subscriberId
     * @param string $latitude
     * @param string $longitude
     * @param int $locationId
     * @param string $photoUrl
     */
    public function add_photo(
        int $userId,
        int $subscriberId,
        string $latitude,
        string $longitude,
        int $locationId,
        string $photoUrl,
    ) {
        $addPhotoStmt = self::$client->prepare(
            'INSERT INTO photos (
                user_id,
                subscriber_id,
                lat,
                lng,
                location_id,
                photo_url
            )
            VALUES(?, ?, ?, ?, ?, ?);'
        );

        // 'i' means that $userId is bound as an integer
        // 'i' means that $subscriberId is bound as an integer
        // 's' means that $latitude is bound as a string
        // 's' means that $longitude is bound as a string
        // 'i' means that $locationId is bound as an integer
        // 's' means that $photoUrl is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $addPhotoStmt->bind_param(
            'iissis',
            $userId,
            $subscriberId,
            $latitude,
            $longitude,
            $locationId,
            $photoUrl,
        );

        $addPhotoStmt->execute();

        return $addPhotoStmt->insert_id;
    }

    /**
     * This methods adds a relationship between a user and subscriber
     *
     * @param int $userId
     * @param int $subscriberId
     * @param string|null $status Default = 'REQUESTED'
     */
    public function add_user_subscriber_relationship(
        int $userId,
        int $subscriberId,
        string|null $status = 'REQUESTED',
    ) {
        $addUserSubscriberRelationshipStmt = self::$client->prepare(
            'INSERT INTO user_subscriber_relationships (user_id, subscriber_id, status)
            VALUES(?, ?, ?);'
        );

        // 'i' means that $userId is bound as an integer
        // 'i' means that $subscriberId is bound as an integer
        // 's' means that $status is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $addUserSubscriberRelationshipStmt->bind_param(
            'iis',
            $userId,
            $subscriberId,
            $status,
        );

        $addUserSubscriberRelationshipStmt->execute();

        return $addUserSubscriberRelationshipStmt->insert_id;
    }

    /**
     * This method deletes a Google User from the database
     *
     * @param string $googleId
     */
    public function delete_google_user(string $googleId)
    {
        $deleteGoogleUserStmt = self::$client->prepare(
            'DELETE FROM GoogleUsers
            WHERE google_id = ?;'
        );

        // 's' means that $googleId is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $deleteGoogleUserStmt->bind_param(
            's',
            $googleId,
        );

        $deleteGoogleUserStmt->execute();

        return $deleteGoogleUserStmt->affected_rows === 1;
    }

    /**
     * This method deletes a location from the database
     *
     * @param int $locationId
     */
    public function delete_location(int $locationId)
    {
        $deleteLocationStmt = self::$client->prepare(
            'DELETE FROM locations
            WHERE location_id = ?;'
        );

        // 'i' means that $locationId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $deleteLocationStmt->bind_param(
            'i',
            $locationId,
        );

        $deleteLocationStmt->execute();

        return $deleteLocationStmt->affected_rows === 1;
    }

    /**
     * This method deletes a photo from the database
     *
     * @param int $photoId
     */
    public function delete_photo(int $photoId)
    {
        $deletePhotoStmt = self::$client->prepare(
            'DELETE FROM photos
            WHERE photo_id = ?;'
        );

        // 'i' means that $photoId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $deletePhotoStmt->bind_param(
            'i',
            $photoId,
        );

        $deletePhotoStmt->execute();

        return $deletePhotoStmt->affected_rows === 1;
    }

    /**
     * This method deletes a user from the database
     *
     * @param int $userId
     */
    public function delete_user(int $userId)
    {
        $deleteUserStmt = self::$client->prepare(
            'DELETE FROM users
            WHERE user_id = ?;'
        );

        // 'i' means that $userId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $deleteUserStmt->bind_param(
            'i',
            $userId,
        );

        $deleteUserStmt->execute();

        return $deleteUserStmt->affected_rows === 1;
    }

    /**
     * This methods deletes a relationship between a user and subscriber
     *
     * @param int $userId
     * @param int $subscriberId
     */
    public function delete_user_subscriber_relationship(
        int $userId,
        int $subscriberId,
    ) {
        $deleteUserSubscriberRelationshipStmt = self::$client->prepare(
            'DELETE FROM user_subscriber_relationships
            WHERE user_id = ? AND subscriber_id = ?;'
        );

        // 'i' means that $userId is bound as an integer
        // 'i' means that $subscriberId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $deleteUserSubscriberRelationshipStmt->bind_param(
            'ii',
            $userId,
            $subscriberId,
        );

        $deleteUserSubscriberRelationshipStmt->execute();

        return $deleteUserSubscriberRelationshipStmt->affected_rows === 1;
    }

    /**
     * This method returns all app settings in the database
     */
    public function get_app_settings()
    {
        $getAppSettingsStmt = self::$client->prepare(
            'SELECT setting_name, setting_value
            FROM app_settings;'
        );

        $getAppSettingsStmt->execute();

        $result = $getAppSettingsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    // !! Currently unused, so commented out
    /**
     * This method returns all Google Users in the database
     */
    // public function get_google_users_all()
    // {
    //     $getGoogleUsersStmt = self::$client->prepare(
    //         'SELECT * FROM GoogleUsers;'
    //     );

    //     $getGoogleUsersStmt->execute();

    //     $result = $getGoogleUsersStmt->get_result();
    //     $rows = $result->fetch_all(MYSQLI_ASSOC);

    //     return $rows;
    // }

    /**
     * This method attempts to look up a Google User by googleId
     *
     * @param string $googleId
     */
    public function get_google_user(string $googleId)
    {
        $getGoogleUserStmt = self::$client->prepare(
            'SELECT * FROM GoogleUsers WHERE google_id = ? LIMIT 1;'
        );

        // 's' means that $googleId is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getGoogleUserStmt->bind_param('s', $googleId);

        $getGoogleUserStmt->execute();

        $result = $getGoogleUserStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    /**
     * This method attempts to look up a location by locationId
     *
     * @param int $locationId
     */
    public function get_location(int $locationId)
    {
        $getLocationStmt = self::$client->prepare(
            'SELECT
                location_id,
                subscriber_id,
                location_name,
                location_address,
                location_city,
                location_state,
                location_lat,
                location_lng,
                insert_date
            FROM locations WHERE location_id = ? LIMIT 1;'
        );

        // 'i' means that $locationId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getLocationStmt->bind_param('i', $locationId);

        $getLocationStmt->execute();

        $result = $getLocationStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    // !! Currently unused, so commented out
    /**
     * This method returns all locations in the database
     */
    // public function get_locations_all()
    // {
    //     $getLocationsStmt = self::$client->prepare(
    //         'SELECT location_id,
    //             subscriber_id,
    //             location_name,
    //             location_address,
    //             location_city,
    //             location_state,
    //             location_lat,
    //             location_lng,
    //             insert_date
    //         FROM locations;'
    //     );

    //     $getLocationsStmt->execute();

    //     $result = $getLocationsStmt->get_result();
    //     $rows = $result->fetch_all(MYSQLI_ASSOC);

    //     return $rows;
    // }

    /**
     * Returns locations for a subscriber, optionally filtered by photo presence.
     *
     * @param int $subscriberId
     * @param bool|null $hasPhotos Optional filter:
     *   - null: returns all locations (default, backward compatible)
     *   - true: returns only locations with at least one photo
     *   - false: returns only locations with no photos
     * @return array Locations matching the criteria
     */
    public function get_locations_for_subscriber(int $subscriberId, bool|null $hasPhotos = null)
    {
        // Build query based on filter
        if ($hasPhotos === true) {
            // Locations WITH photos
            $query = 'SELECT location_id,
                    subscriber_id,
                    location_name,
                    location_address,
                    location_city,
                    location_state,
                    location_lat,
                    location_lng,
                    insert_date
                FROM locations
                WHERE subscriber_id = ?
                AND location_id IN (
                    SELECT DISTINCT location_id
                    FROM photos
                    WHERE subscriber_id = ?
                );';

            $getLocationsStmt = self::$client->prepare($query);
            $getLocationsStmt->bind_param('ii', $subscriberId, $subscriberId);
        } elseif ($hasPhotos === false) {
            // Locations WITHOUT photos
            $query = 'SELECT location_id,
                    subscriber_id,
                    location_name,
                    location_address,
                    location_city,
                    location_state,
                    location_lat,
                    location_lng,
                    insert_date
                FROM locations
                WHERE subscriber_id = ?
                AND location_id NOT IN (
                    SELECT DISTINCT location_id
                    FROM photos
                    WHERE subscriber_id = ? AND location_id IS NOT NULL
                );';

            $getLocationsStmt = self::$client->prepare($query);
            $getLocationsStmt->bind_param('ii', $subscriberId, $subscriberId);
        } else {
            // All locations (existing behavior)
            $query = 'SELECT location_id,
                    subscriber_id,
                    location_name,
                    location_address,
                    location_city,
                    location_state,
                    location_lat,
                    location_lng,
                    insert_date
                FROM locations
                WHERE subscriber_id = ?;';

            $getLocationsStmt = self::$client->prepare($query);
            $getLocationsStmt->bind_param('i', $subscriberId);
        }

        $getLocationsStmt->execute();

        $result = $getLocationsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method attempts to look up a photo by photoId
     *
     * @param int $photoId
     */
    public function get_photo(int $photoId)
    {
        $getPhotoStmt = self::$client->prepare(
            'SELECT
                photo_id,
                user_id,
                subscriber_id,
                insert_date,
                lat,
                lng,
                location_id,
                photo_url
            FROM photos WHERE photo_id = ? LIMIT 1;'
        );

        // 'i' means that $photoId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getPhotoStmt->bind_param('i', $photoId);

        $getPhotoStmt->execute();

        $result = $getPhotoStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    /**
     * This method returns all photos in the database
     */
    public function get_photos_all()
    {
        $getPhotosStmt = self::$client->prepare(
            'SELECT photo_id,
                user_id,
                subscriber_id,
                insert_date,
                lat,
                lng,
                location_id,
                photo_url
            FROM photos;'
        );

        $getPhotosStmt->execute();

        $result = $getPhotosStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method looks up all photos for a given location
     *
     * @param int $subscriberId
     * @param int $locationId
     */
    public function get_photos_for_location(int $subscriberId, int $locationId)
    {
        $getPhotosStmt = self::$client->prepare(
            'SELECT photo_id,
                user_id,
                subscriber_id,
                insert_date,
                lat,
                lng,
                location_id,
                photo_url
            FROM photos
            WHERE subscriber_id = ? AND location_id = ?;'
        );

        // 'i' means that $subscriberId is bound as an integer
        // 'i' means that $locationId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getPhotosStmt->bind_param('ii', $subscriberId, $locationId);

        $getPhotosStmt->execute();

        $result = $getPhotosStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method looks up all photos for a given subscriber
     *
     * @param int $subscriberId
     */
    public function get_photos_for_subscriber(int $subscriberId)
    {
        $getPhotosStmt = self::$client->prepare(
            'SELECT photo_id,
                user_id,
                subscriber_id,
                insert_date,
                lat,
                lng,
                location_id,
                photo_url
            FROM photos
            WHERE subscriber_id = ?;'
        );

        // 'i' means that $subscriberId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getPhotosStmt->bind_param('i', $subscriberId);

        $getPhotosStmt->execute();

        $result = $getPhotosStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method looks up all photos for a given user
     *
     * @param int $subscriberId
     * @param int $userId
     */
    public function get_photos_for_user(int $subscriberId, int $userId)
    {
        $getPhotosStmt = self::$client->prepare(
            'SELECT photo_id,
                user_id,
                subscriber_id,
                insert_date,
                lat,
                lng,
                location_id,
                photo_url
            FROM photos
            WHERE subscriber_id = ? AND user_id = ?;'
        );

        // 'i' means that $subscriberId is bound as an integer
        // 'i' means that $userId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getPhotosStmt->bind_param('ii', $subscriberId, $userId);

        $getPhotosStmt->execute();

        $result = $getPhotosStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method returns all schedules in the database
     */
    public function get_schedules_all()
    {
        $getSchedulesStmt = self::$client->prepare(
            'SELECT schedule_id,
                subscriber_id,
                schedule_date,
                schedule_events
            FROM schedules;'
        );

        $getSchedulesStmt->execute();

        $result = $getSchedulesStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method returns all settings in the database
     */
    public function get_settings_all()
    {
        $getSettingsStmt = self::$client->prepare(
            'SELECT * FROM settings;'
        );

        $getSettingsStmt->execute();

        $result = $getSettingsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method returns all subscriber settings in the database
     */
    public function get_subscriber_settings_all()
    {
        $getSubscriberSettingsStmt = self::$client->prepare(
            'SELECT subscriber_id,
                setting_id,
                setting_value
            FROM subscriber_settings;'
        );

        $getSubscriberSettingsStmt->execute();

        $result = $getSubscriberSettingsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    // !! Currently unused, so commented out
    /**
     * This method returns all active subscribers in the database
     */
    // public function get_subscribers_active()
    // {
    //     $getActiveSubscribersStmt = self::$client->prepare(
    //         'SELECT subscriber_id,
    //             subscriber_name
    //         FROM subscribers
    //         WHERE subscription_active = 1;'
    //     );

    //     $getActiveSubscribersStmt->execute();

    //     $result = $getActiveSubscribersStmt->get_result();
    //     $rows = $result->fetch_all(MYSQLI_ASSOC);

    //     return $rows;
    // }

    /**
     * This method returns all subscribers in the database
     */
    public function get_subscribers_all()
    {
        $getSubscribersStmt = self::$client->prepare(
            'SELECT subscriber_id,
                subscriber_name,
                insert_date,
                subscription_start_date,
                subscription_end_date,
                subscription_price,
                subscription_active
            FROM subscribers;'
        );

        $getSubscribersStmt->execute();

        $result = $getSubscribersStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method looks up a user by their google id (if they have 
     * been previously stored); it returns data from the tables:
     * GoogleUsers, users, user_types
     *
     * @param string $googleId
     */
    public function get_user_by_google_id(string $googleId)
    {
        $getUserStmt = self::$client->prepare(
            'SELECT
                gu.google_id,
                u.user_id,
                u.username,
                u.first_name,
                u.last_name,
                u.email_address,
                u.phone_number,
                u.avatar_url,
                ut.user_type_name AS user_type,
                usr.subscriber_id,
                s.subscriber_name
            FROM
                GoogleUsers AS gu
            LEFT JOIN users AS u ON
                gu.user_id = u.user_id 
            LEFT JOIN user_types AS ut ON
                u.user_type = ut.user_type_id
            LEFT JOIN user_subscriber_relationships AS usr ON
                u.user_id = usr.user_id
            LEFT JOIN subscribers AS s ON
                usr.subscriber_id = s.subscriber_id
            WHERE gu.google_id = ?;'
        );

        // 's' means that $googleId is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getUserStmt->bind_param('s', $googleId);

        $getUserStmt->execute();

        $result = $getUserStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    /**
     * This method looks up a user by their user id (if they have 
     * been previously stored); it returns data from the tables:
     * GoogleUsers, users, user_types
     *
     * @param int $userId
     */
    public function get_user_by_id(int $userId)
    {
        $getUserStmt = self::$client->prepare(
            'SELECT
                gu.google_id,
                u.user_id,
                u.username,
                u.first_name,
                u.last_name,
                u.email_address,
                u.phone_number,
                u.avatar_url,
                ut.user_type_name AS user_type,
                usr.subscriber_id,
                s.subscriber_name
            FROM
                users AS u
            LEFT JOIN GoogleUsers AS gu ON
                u.user_id = gu.user_id 
            LEFT JOIN user_types AS ut ON
                u.user_type = ut.user_type_id
            LEFT JOIN user_subscriber_relationships AS usr ON
                u.user_id = usr.user_id
            LEFT JOIN subscribers AS s ON
                usr.subscriber_id = s.subscriber_id
            WHERE u.user_id = ?;'
        );

        // 'i' means that $userId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getUserStmt->bind_param('i', $userId);

        $getUserStmt->execute();

        $result = $getUserStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    /**
     * This method returns all subscriber relationships for a given user
     *
     * @param int $userId
     */
    public function get_user_subscriber_relationships(int $userId)
    {
        $getRelationshipsStmt = self::$client->prepare(
            'SELECT
                user_id,
                subscriber_id,
                status,
                last_change
            FROM user_subscriber_relationships
            WHERE user_id = ?;'
        );

        // 'i' means that $userId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getRelationshipsStmt->bind_param('i', $userId);

        $getRelationshipsStmt->execute();

        $result = $getRelationshipsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method searches for a single user type via friendly values
     * (e.g. 'ADMIN', 'USER', etc.)
     *
     * @param string $searchVal
     */
    public function get_user_type(string $searchVal)
    {
        $getUserTypeStmt = self::$client->prepare(
            'SELECT * FROM user_types WHERE user_type_name LIKE ? LIMIT 1;'
        );

        // 's' means that $searchVal is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $getUserTypeStmt->bind_param('s', $searchVal);

        $getUserTypeStmt->execute();

        $result = $getUserTypeStmt->get_result();
        $row = $result->fetch_array(MYSQLI_ASSOC);

        return $row;
    }

    /**
     * This method returns all user types in the database
     */
    public function get_user_types_all()
    {
        $getUserTypesStmt = self::$client->prepare(
            'SELECT user_type_id,
                user_type_name
            FROM user_types;'
        );

        $getUserTypesStmt->execute();

        $result = $getUserTypesStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * This method returns all users in the database
     */
    public function get_users_all()
    {
        $getUsersStmt = self::$client->prepare(
            'SELECT user_id,
                username,
                first_name,
                last_name,
                email_address,
                phone_number,
                avatar_url,
                user_type
            FROM users;'
        );

        $getUsersStmt->execute();

        $result = $getUsersStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }

    /**
     * Thid method assigns a user_id for a given google_id and returns whether
     * or not a single row was updated
     *
     * @param int $newUserId
     * @param string $googleId
     */
    public function set_user_id_for_google_user(
        int $newUserId,
        string $googleId,
    ) {
        $updateGoogleUserStmt = self::$client->prepare(
            'UPDATE GoogleUsers SET user_id = ? WHERE google_id = ?;'
        );

        // 'i' means that $newUserId is bound as an integer
        // 's' means that $googleId is bound as a string
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $updateGoogleUserStmt->bind_param(
            'is',
            $newUserId,
            $googleId,
        );

        $updateGoogleUserStmt->execute();

        return $updateGoogleUserStmt->affected_rows === 1;
    }

    /**
     * This methods updates a relationship between a user and subscriber
     *
     * @param int $userId
     * @param int $subscriberId
     * @param string $status
     */
    public function update_user_subscriber_relationship(
        int $userId,
        int $subscriberId,
        string $status,
    ) {
        $updateUserSubscriberRelationshipStmt = self::$client->prepare(
            'UPDATE user_subscriber_relationships
            SET status = ?
            WHERE user_id = ? AND subscriber_id = ?;'
        );

        // 's' means that $status is bound as a string
        // 'i' means that $userId is bound as an integer
        // 'i' means that $subscriberId is bound as an integer
        // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
        $updateUserSubscriberRelationshipStmt->bind_param(
            'sii',
            $status,
            $userId,
            $subscriberId,
        );

        $updateUserSubscriberRelationshipStmt->execute();

        return $updateUserSubscriberRelationshipStmt->affected_rows === 1;
    }

    /**
     * Get access requests for subscribers associated with an admin user
     *
     * @param int $adminUserId The admin user's ID
     * @param string|null $status Optional status filter ('REQUESTED', 'ACTIVE', 'INACTIVE'). If null, returns all statuses.
     * @return array Array of access requests with user details
     */
    public function get_access_requests_for_admin(int $adminUserId, string|null $status = null): array
    {
        if ($status !== null) {
            // Query with status filter
            $query = 'SELECT
                    usr.user_id,
                    usr.subscriber_id,
                    usr.status,
                    usr.last_change,
                    u.first_name,
                    u.last_name,
                    u.email_address,
                    s.subscriber_name
                FROM user_subscriber_relationships AS usr
                INNER JOIN users AS u ON usr.user_id = u.user_id
                INNER JOIN subscribers AS s ON usr.subscriber_id = s.subscriber_id
                WHERE usr.subscriber_id IN (
                    SELECT subscriber_id
                    FROM user_subscriber_relationships
                    WHERE user_id = ? AND status = \'ACTIVE\'
                )
                AND usr.status = ?;';

            $getAccessRequestsStmt = self::$client->prepare($query);

            // 'i' means that $adminUserId is bound as an integer
            // 's' means that $status is bound as a string
            // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
            $getAccessRequestsStmt->bind_param('is', $adminUserId, $status);
        } else {
            // Query without status filter (all statuses)
            $query = 'SELECT
                    usr.user_id,
                    usr.subscriber_id,
                    usr.status,
                    usr.last_change,
                    u.first_name,
                    u.last_name,
                    u.email_address,
                    s.subscriber_name
                FROM user_subscriber_relationships AS usr
                INNER JOIN users AS u ON usr.user_id = u.user_id
                INNER JOIN subscribers AS s ON usr.subscriber_id = s.subscriber_id
                WHERE usr.subscriber_id IN (
                    SELECT subscriber_id
                    FROM user_subscriber_relationships
                    WHERE user_id = ? AND status = \'ACTIVE\'
                );';

            $getAccessRequestsStmt = self::$client->prepare($query);

            // 'i' means that $adminUserId is bound as an integer
            // more info - https://www.php.net/manual/en/mysqli-stmt.bind-param.php#mysqli-stmt.bind-param.parameters
            $getAccessRequestsStmt->bind_param('i', $adminUserId);
        }

        $getAccessRequestsStmt->execute();

        $result = $getAccessRequestsStmt->get_result();
        $rows = $result->fetch_all(MYSQLI_ASSOC);

        return $rows;
    }
}
