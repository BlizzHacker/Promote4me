<?php
define( 'WP_CACHE', true );
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the
 * installation. You don't have to use the web site, you can
 * copy this file to "wp-config.php" and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * MySQL settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://codex.wordpress.org/Editing_wp-config.php
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u727598957_WyRIb' );

/** MySQL database username */
define( 'DB_USER', 'u727598957_9ITPC' );

/** MySQL database password */
define( 'DB_PASSWORD', '1jW9m8PZqc' );

/** MySQL hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database Charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The Database Collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'nmiwrS6u@ 1M<BG-rv TWYQwP&[pnH4fL3}zR#zhoDPhcGbMN!KoaR2LY?>*rhp*' );
define( 'SECURE_AUTH_KEY',   'f3<6dK{u#Y X$I7!|aNz_lrn;`bgi0:cyE/Y[|qPc}fmM6yjC[w]Z[yM3 gCKTZ4' );
define( 'LOGGED_IN_KEY',     'ax^];]zl<|r)}oWWj<XX7[BZ*No9IbZ,(.X #JtIEv,3.^h1*WzOS5@oLb;[m?zk' );
define( 'NONCE_KEY',         '3@z9bPz_=%_Cu1^q;NA43D[`s3vi:_fdON|a&Ri6iF|G]rE:4u*F]$wZ2R%#E<ML' );
define( 'AUTH_SALT',         'w1u/eHY3kgj){`S3_*rmC2;-,<98f+pox8=&fXM`(m4%7p(MsF[XSCVUbC`thr>*' );
define( 'SECURE_AUTH_SALT',  '#9Ztq1edKZ$i[NL-*p!$K:pm5-`y3W?-V78O)8JNdV?(Z#4qe{ZP%VWlg3Sg-EI.' );
define( 'LOGGED_IN_SALT',    '~3W!5)j#GE~4P!lPnMs~4).Glo/FUg 0P;$fuV.`1-j!Lgm%lp5XiNcuT&n-<yJD' );
define( 'NONCE_SALT',        ';/%fS*6B_is93C)stUvxtp[z+hM#RaOYD>X(/F][xfDVb%7!6e>`YzMWq?W%C14(' );
define( 'WP_CACHE_KEY_SALT', 'b!esJ,QP}M~UnYvVXhz 4![OM5T>Zai#;vF*iR3U%h1;K Ahe.kUu{VR1kEnO(S4' );

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';




define( 'WP_AUTO_UPDATE_CORE', true );
define( 'FS_METHOD', 'direct' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', dirname( __FILE__ ) . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
