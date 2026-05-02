<?php

namespace Promote4Me;

class Validation
{
    /**
     * This method checks if location id is in array of subscriber locations;
     * returns true if location id is valid for subscriber, false otherwise
     *
     * @param int $locationId Id of location to check
     * @param array $existingSubscriberLocations Array of subscriber locations
     */
    public static function checkLocationIdIsInArray(
        int $locationId,
        array $existingSubscriberLocations
    ): bool {
        foreach ($existingSubscriberLocations as $existingLocation) {
            if ($locationId === $existingLocation['location_id']) {
                return true;
            }
        }

        return false;
    }

    /**
     * This method validates latitude; returns true if valid, false otherwise
     *
     * Note - latitude is valid between -90 and 90
     *
     * @param string|int|float|null $value Value to validate
     */
    public static function validateLatitude(string|int|float|null $value): bool
    {
        if (!is_numeric($value)) {
            return false;
        }

        $value = floatval($value);

        return $value >= -90 && $value <= 90;
    }

    /**
     * This method validates longitude; returns true if valid, false otherwise
     *
     * Note - longitude is valid between -180 and 180
     *
     * @param string|int|float|null $value Value to validate
     */
    public static function validateLongitude(string|int|float|null $value): bool
    {
        if (!is_numeric($value)) {
            return false;
        }

        $value = floatval($value);

        return $value >= -180 && $value <= 180;
    }
}
