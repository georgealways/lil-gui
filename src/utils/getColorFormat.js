import normalizeColorString from './normalizeColorString';

const STRING = {
	isPrimitive: true,
	match: v => typeof v === 'string',
	fromHexString: normalizeColorString,
	toHexString: normalizeColorString
};

const INT = {
	isPrimitive: true,
	match: v => typeof v === 'number',
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,

	// The arrow function is here to appease tree shakers like esbuild or webpack.
	// See https://esbuild.github.io/api/#tree-shaking
	match: v => Array.isArray( v ),

	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target[ 0 ] = ( int >> 16 & 255 ) / 255 * rgbScale;
		target[ 1 ] = ( int >> 8 & 255 ) / 255 * rgbScale;
		target[ 2 ] = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( [ r, g, b ], rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const _target = { r: 0, g: 0, b: 0 };

/**
 * THREE.Color instances are stored with Linear-sRGB ("srgb-linear") components,
 * but users will interact with the color picker using sRGB ("srgb"). Convert
 * to Linear-sRGB when updating the THREE.Color instance, and to sRGB when
 * updating the color picker. If THREE.ColorManagement is disabled, no
 * conversions occur.
 */
const CLASS = {
	isPrimitive: false,
	match: v => Object( v ) === v && v.isColor === true,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		const r = ( int >> 16 & 255 ) / 255 * rgbScale;
		const g = ( int >> 8 & 255 ) / 255 * rgbScale;
		const b = ( int & 255 ) / 255 * rgbScale;

		target.setRGB( r, g, b, 'srgb' );

	},
	toHexString( target, rgbScale = 1 ) {

		target.getRGB( _target, 'srgb' );

		rgbScale = 255 / rgbScale;

		const int = ( _target.r * rgbScale ) << 16 ^
			( _target.g * rgbScale ) << 8 ^
			( _target.b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
	fromHexString( string, target, rgbScale = 1 ) {

		const int = INT.fromHexString( string );

		target.r = ( int >> 16 & 255 ) / 255 * rgbScale;
		target.g = ( int >> 8 & 255 ) / 255 * rgbScale;
		target.b = ( int & 255 ) / 255 * rgbScale;

	},
	toHexString( { r, g, b }, rgbScale = 1 ) {

		rgbScale = 255 / rgbScale;

		const int = ( r * rgbScale ) << 16 ^
			( g * rgbScale ) << 8 ^
			( b * rgbScale ) << 0;

		return INT.toHexString( int );

	}
};

const FORMATS = [ STRING, INT, ARRAY, CLASS, OBJECT ];

export default function( value ) {
	return FORMATS.find( format => format.match( value ) );
}
