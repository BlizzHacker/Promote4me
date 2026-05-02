<?php

namespace Promote4Me\Models;

/**
 * Represents a location
 */
class Location
{
    public ?string $address;
    public ?string $city;
    public int $id;
    public string $insertDate;
    public ?string $lat;
    public ?string $lng;
    public string $name;
    public ?string $state;
    public ?int $subscriberId;

    public function __construct(
        int $location_id,
        ?int $subscriber_id = null,
        string $location_name,
        ?string $location_address = null,
        ?string $location_city = null,
        ?string $location_state = null,
        ?string $location_lat = null,
        ?string $location_lng = null,
        string $insert_date,
    ) {
        $this->address = $location_address;
        $this->city = $location_city;
        $this->id = $location_id;
        $this->insertDate = $insert_date;
        $this->lat = $location_lat;
        $this->lng = $location_lng;
        $this->name = $location_name;
        $this->state = $location_state;
        $this->subscriberId = $subscriber_id;
    }

    public function __serialize(): array
    {
        return [
            'location_address' => $this->address,
            'location_city' => $this->city,
            'location_id' => $this->id,
            'insert_date' => $this->insertDate,
            'location_lat' => $this->lat,
            'location_lng' => $this->lng,
            'location_name' => $this->name,
            'location_state' => $this->state,
            'subscriber_id' => $this->subscriberId,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->address = $data['location_address'];
        $this->city = $data['location_city'];
        $this->id = $data['location_id'];
        $this->insertDate = $data['insert_date'];
        $this->lat = $data['location_lat'];
        $this->lng = $data['location_lng'];
        $this->name = $data['location_name'];
        $this->state = $data['location_state'];
        $this->subscriberId = $data['subscriber_id'];
    }

    /**
     * This method populates most of the fields within the location
     * using data returned from the DB
     *
     * @param array $location Data from the DB
     */
    // public function populate(array $location)
    // {
    //     $this->address = $location['location_address'];
    //     $this->city = $location['location_city'];
    //     $this->id = $location['location_id'];
    //     $this->insertDate = $location['insert_date'];
    //     $this->lat = $location['location_lat'];
    //     $this->lng = $location['location_lng'];
    //     $this->name = $location['location_name'];
    //     $this->state = $location['location_state'];
    //     $this->subscriberId = $location['subscriber_id'];
    // }
}
