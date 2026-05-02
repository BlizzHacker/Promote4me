<?php

namespace Promote4Me;

require_once(realpath(dirname(__FILE__) . '/NetworkUtil.class.php'));
require_once(realpath(dirname(__FILE__) . '/SafeDB.class.php'));

class Endpoint
{
    public $allowed_methods;
    /** @var SafeDB */
    protected $db;
    /** @var NetworkUtil */
    protected $networkUtil;

    public function __construct(
        $allowed_methods = ['*'],
        $db = null,
        $networkUtil = null,
    ) {
        $this->allowed_methods = $allowed_methods === ['*']
            ? ['DELETE', 'GET', 'OPTIONS', 'POST', 'PUT']
            : $allowed_methods;

        if (is_null($db)) {
            $this->db = new SafeDB();
        } else {
            $this->db = $db;
        }

        if (is_null($networkUtil)) {
            $this->networkUtil = new NetworkUtil();
        } else {
            $this->networkUtil = $networkUtil;
        }
    }

    public function process_request(): void
    {
        $clientOrigin = '';

        // courtesy of https://stackoverflow.com/a/41335048
        if (array_key_exists('HTTP_ORIGIN', $_SERVER)) {
            $clientOrigin = $_SERVER['HTTP_ORIGIN'];
        } else if (array_key_exists('HTTP_REFERER', $_SERVER)) {
            $clientOrigin = $_SERVER['HTTP_REFERER'];
        } else if (array_key_exists('REMOTE_ADDR', $_SERVER)) {
            $clientOrigin = $_SERVER['REMOTE_ADDR'];
        }

        str_replace('http:\/\/', 'http://', $clientOrigin);
        str_replace('https:\/\/', 'https://', $clientOrigin);

        $this->networkUtil->sendAccessControlHeaders($clientOrigin);

        if (!array_key_exists('REQUEST_METHOD', $_SERVER)) {
            http_response_code(400);
            return;
        }

        switch ($_SERVER['REQUEST_METHOD']) {
            case 'DELETE':
                $this->handle_delete($_REQUEST);
                break;
            case 'GET':
                $this->handle_get($_GET);
                break;
            case 'OPTIONS':
                $this->handle_options($_REQUEST);
                break;
            case 'POST':
                $this->handle_post($_POST);
                break;
            case 'PUT':
                $this->handle_put($_POST);
                break;
            default:
                http_response_code(400);
                break;
        }
    }

    public function handle_delete($req)
    {
        http_response_code(400);
    }

    public function handle_get($req)
    {
        http_response_code(400);
    }

    public function handle_options($req)
    {
        http_response_code(204);

        header('Allow: ' . implode(', ', $this->allowed_methods));
    }

    public function handle_post($req)
    {
        http_response_code(400);
    }

    public function handle_put($req)
    {
        http_response_code(400);
    }
}
