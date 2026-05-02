<?php

namespace Promote4Me\Models;

/**
 * Represents a subscriber
 */

class Subscriber
{
    public int $subscriber_id;
    public string $subscriber_name;
    public string $insert_date;
    public string $subscription_start_date;
    public string $subscription_end_date;
    public ?float $subscription_price;
    public ?int $subscription_active;

    public function __construct(
        int $subscriber_id,
        string $subscriber_name,
        string $insert_date,
        string $subscription_start_date,
        string $subscription_end_date,
        ?float $subscription_price,
        ?int $subscription_active
    ) {
        $this->subscriber_id = $subscriber_id;
        $this->subscriber_name = $subscriber_name;
        $this->insert_date = $insert_date;
        $this->subscription_start_date = $subscription_start_date;
        $this->subscription_end_date = $subscription_end_date;
        $this->subscription_price = $subscription_price;
        $this->subscription_active = $subscription_active;
    }

    public function __serialize(): array
    {
        return [
            'subscriber_id' => $this->subscriber_id,
            'subscriber_name' => $this->subscriber_name,
            'insert_date' => $this->insert_date,
            'subscription_start_date' => $this->subscription_start_date,
            'subscription_end_date' => $this->subscription_end_date,
            'subscription_price' => $this->subscription_price,
            'subscription_active' => $this->subscription_active,
        ];
    }

    public function __unserialize(array $data): void
    {
        $this->subscriber_id = $data['subscriber_id'];
        $this->subscriber_name = $data['subscriber_name'];
        $this->insert_date = $data['insert_date'];
        $this->subscription_start_date = $data['subscription_start_date'];
        $this->subscription_end_date = $data['subscription_end_date'];
        $this->subscription_price = $data['subscription_price'];
        $this->subscription_active = $data['subscription_active'];
    }
}
