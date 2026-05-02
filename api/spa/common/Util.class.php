<?php

namespace Promote4Me;

use Exception;

class Util
{
	/**
	 * This function parses GPS data out of EXIF data (if possible); returns
	 * array of values [latitude, longitude] if successful, null otherwise
	 *   - Check calculated values - https://www.fcc.gov/media/radio/dms-decimal
	 *   - Images w/ GPS EXIF - https://github.com/ianare/exif-samples/tree/master/jpg/gps
	 *
	 * @param array|false|null $exifData Value to parse
	 * @param string $format Optional; Default = 'decimal'; When set to
	 *   'pretty', returns values in degrees/minutes/seconds and reference
	 *   direction
	 */
	public static function parseExifGps($exifData, $format = 'decimal')
	{
		if (
			$exifData === false
			|| is_null($exifData)
			|| !array_key_exists('FILE', $exifData)
			|| !str_contains($exifData['FILE']['SectionsFound'], 'GPS')
		) {
			return null;
		}

		$gpsData = $exifData['GPS'];
		$latParts = $gpsData['GPSLatitude'];
		$latRef = $gpsData['GPSLatitudeRef']; // N or S
		$lngParts = $gpsData['GPSLongitude'];
		$lngRef = $gpsData['GPSLongitudeRef']; // E or W

		// latitude parse
		$latPartsDegrees = explode('/', $latParts[0]);
		$latPartsMinutes = explode('/', $latParts[1]);
		$latPartsSeconds = explode('/', $latParts[2]);

		// latitude calculate
		$latDegrees = (float)((float) $latPartsDegrees[0] / (float) $latPartsDegrees[1]);
		$latMinutes = (float)((float) $latPartsMinutes[0] / (float) $latPartsMinutes[1]);
		$latSeconds = (float)((float) $latPartsSeconds[0] / (float) $latPartsSeconds[1]);

		// longitude parse
		$lngPartsDegrees = explode('/', $lngParts[0]);
		$lngPartsMinutes = explode('/', $lngParts[1]);
		$lngPartsSeconds = explode('/', $lngParts[2]);

		// longitude calculate
		$lngDegrees = (float)((float) $lngPartsDegrees[0] / (float) $lngPartsDegrees[1]);
		$lngMinutes = (float)((float) $lngPartsMinutes[0] / (float) $lngPartsMinutes[1]);
		$lngSeconds = (float)((float) $lngPartsSeconds[0] / (float) $lngPartsSeconds[1]);

		// formatting
		$latDecimal = $latDegrees + ($latMinutes / 60) + ($latSeconds / 3600);
		$latPretty = "$latDegrees deg $latMinutes min $latSeconds sec $latRef";

		if ($latRef === 'S') {
			$latDecimal = $latDecimal * -1;
		}

		$lngDecimal = $lngDegrees + ($lngMinutes / 60) + ($lngSeconds / 3600);
		$lngPretty = "$lngDegrees deg $lngMinutes min $lngSeconds sec $lngRef";

		if ($lngRef === 'W') {
			$lngDecimal = $lngDecimal * -1;
		}

		return $format === 'pretty'
			? [$latPretty, $lngPretty]
			: [$latDecimal, $lngDecimal];
	}

	/**
	 * This method parses a JWT and returns an Object of the info it contains;
	 * returns null if parse fails
	 */
	public static function parse_jwt($token)
	{
		if (is_null($token)) {
			return null;
		}

		try {
			$result = json_decode(
				base64_decode(
					str_replace(
						'_',
						'/',
						str_replace(
							'-',
							'+',
							explode(
								'.',
								$token
							)[1]
						)
					)
				)
			);

			return $result;
		} catch (Exception $e) {
			return null;
		}
	}

	/**
	 * This method encodes a value as JSON w/ some protection for edge cases
	 */
	public static function safe_json_encode($value, $options = 0, $depth = 512, $utfErrorFlag = false)
	{
		$encoded = json_encode($value, $options, $depth);

		switch (json_last_error()) {
			case JSON_ERROR_NONE:
				return $encoded;
				// case JSON_ERROR_DEPTH:
				// 	return 'Maximum stack depth exceeded'; // or trigger_error() or throw new Exception()
				// case JSON_ERROR_STATE_MISMATCH:
				// 	return 'Underflow or the modes mismatch'; // or trigger_error() or throw new Exception()
				// case JSON_ERROR_CTRL_CHAR:
				// 	return 'Unexpected control character found';
				// case JSON_ERROR_SYNTAX:
				// 	return 'Syntax error, malformed JSON'; // or trigger_error() or throw new Exception()
				// case JSON_ERROR_UTF8:
				// 	$clean = Util::utf8ize($value);

				// 	if ($utfErrorFlag) {
				// 		return 'UTF8 encoding error'; // or trigger_error() or throw new Exception()
				// 	}

				// 	return Util::safe_json_encode($clean, $options, $depth, true);
			default:
				return 'Unknown error'; // or trigger_error() or throw new Exception()
		}
	}

	public static function utf8ize($mixed)
	{
		if (is_array($mixed)) {
			foreach ($mixed as $key => $value) {
				$mixed[$key] = Util::utf8ize($value);
			}
		} else if (is_string($mixed)) {
			return mb_convert_encoding($mixed, 'UTF-8');
		}

		return $mixed;
	}
}
