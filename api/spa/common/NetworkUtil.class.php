<?php

namespace Promote4Me;

use DateTime;

class NetworkUtil
{
	public static $acceptedHeaders = 'Accept, Accept-Encoding, Connection, Content-Length, Content-Type, Cookie, Host, id, Postman-Token, token, User-Agent';

	/**
	 * This method returns the POST request data if present; null otherwise
	 *
	 * @param bool $decodeJson When true, decode JSON (for raw POST requests)
	 * @param string $fileToRead File from which to read body data; default is 'php://input'
	 */
	public function getPostData(
		$decodeJson = false,
		$fileToRead = 'php://input',
	) {
		$bodyPostData = file_get_contents($fileToRead);
		$hasBodyPostData = $bodyPostData && strlen($bodyPostData) > 0;
		$hasGlobalPostData = count($_POST) > 0;

		if ($hasBodyPostData) {
			// decode JSON data into PHP associative array
			return $decodeJson
				? json_decode($bodyPostData, true)
				: $bodyPostData;
		}

		if ($hasGlobalPostData) {
			return $_POST;
		}

		// no POST data was present, return null
		return null;
	}

	/**
	 * This method returns the value of the JWT request header (named 'token') or null
	 * if it is not present
	 */
	public function getJwtHeader()
	{
		$headerName = 'HTTP_TOKEN';

		if (array_key_exists($headerName, $_SERVER)) {
			return $_SERVER[$headerName];
		}

		return null;
	}

	/**
	 * This method returns the value of the JWT request query param (named 'token') or null
	 * if it is not present
	 */
	public function getJwtQuery($methodObj)
	{
		if (is_null($methodObj)) {
			return null;
		}

		$paramName = 'token';

		if (array_key_exists($paramName, $methodObj)) {
			return $methodObj[$paramName];
		}

		return null;
	}

	/**
	 * This method looks for a JWT in the request header values (named 'token')
	 * and optionally checks the expiration on it
	 *
	 * - if missing or invalid, output 401 + error, return null
	 * - if expired + required, output 401 + error w/ expiry, return null
	 * - if valid, return parsed JWT
	 */
	public function requireValidJwt($requireNonExpired = false)
	{
		$now = new DateTime();
		$headerToken = $this->getJwtHeader();
		$parsedJwt = Util::parse_jwt($headerToken);

		$hasValidToken = !is_null($parsedJwt);

		if (!$hasValidToken) {
			http_response_code(401);
			echo Util::safe_json_encode(['error' => 'Invalid JWT Token']);

			return null;
		}

		$tokenExpiry = $parsedJwt->exp;

		$dateExpiry = new DateTime();
		$dateExpiry->setTimestamp($tokenExpiry);
		$expiryFormatted = $dateExpiry->format('Y-m-d H:i:s');

		$isTokenExpired = $dateExpiry < $now;

		if ($requireNonExpired && $isTokenExpired) {
			http_response_code(401);
			echo Util::safe_json_encode(['error' => "JWT Token expired at $expiryFormatted"]);

			return null;
		}

		// add properties for any claims that are missing
		if (!property_exists($parsedJwt, 'email')) {
			$parsedJwt->email = null;
		}
		if (!property_exists($parsedJwt, 'given_name')) {
			$parsedJwt->given_name = null;
		}
		if (!property_exists($parsedJwt, 'name')) {
			$parsedJwt->name = null;
		}
		if (!property_exists($parsedJwt, 'family_name')) {
			$parsedJwt->family_name = null;
		}
		if (!property_exists($parsedJwt, 'picture')) {
			$parsedJwt->picture = null;
		}

		return $parsedJwt;
	}

	/**
	 * This method writes 'Access-Control-*' headers to the response (for XHR / CORS)
	 *
	 * @param string $clientOrigin
	 */
	public function sendAccessControlHeaders($clientOrigin = '')
	{
		// header('Access-Control-Allow-Headers: *');
		// header('Access-Control-Allow-Origin: *');
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Allow-Headers: ' . NetworkUtil::$acceptedHeaders);
		header('Access-Control-Allow-Methods: DELETE, GET, OPTIONS, POST, PUT');
		header("Access-Control-Allow-Origin: $clientOrigin");
	}

	/**
	 * This method writes 'Content-Type' JSON headers to the response
	 */
	public function sendApiHeaders()
	{
		header('Content-Type: application/json;charset=utf-8');
	}

	/**
	 * This method writes 'Content-Type' HTML headers to the response
	 */
	public function sendContentHeaders()
	{
		header('Content-Type: text/html;charset=utf-8');
	}
}
