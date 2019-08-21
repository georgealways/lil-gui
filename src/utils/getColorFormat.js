import { isString, isNumber, isObject } from './is.js';

/**
 * @interface ColorFormat
 * @description Defines a conversion between a color format and its 7 
 * character CSS string representation, ie. `"#FFFFFF"`
 */

/**
 * @lends ColorFormat
 * @implements {ColorFormat}
 */
const OBJECT = {

	/**
	 * If true, `fromHexString` returns a new value, otherwise it expects a 
	 * second parameter to mutate.
	 * @type {boolean}
	 */
	isPrimitive: false,

	/**
	 * @method
	 * @param {*} value
	 * @returns {boolean} true if the value matches this format
	 */
	match: isObject,

	/**
	 * Converts from "#FFFFFF" to this format
	 * 
	 * @method
	 * @param {string} string 7 character CSS hex string
	 * @param {Object} target Object to mutate if this isn't a primitive format
	 * @returns none
	 */
	fromHexString( string, target ) {
		const int = INT.fromHexString( string );
		target.r = ( int >> 16 & 255 ) / 255;
		target.g = ( int >> 8 & 255 ) / 255;
		target.b = ( int & 255 ) / 255;
	},

	/**
	 * Converts from this format to "#FFFFFF"
	 * 
	 * @method
	 * @param {*} value
	 * @returns {string}
	 */
	toHexString( { r, g, b } ) {
		const int = ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
		return INT.toHexString( int );
	}

};


const STRING = {
	isPrimitive: true,
	match: isString,
	fromHexString: string => string,
	toHexString: value => value
};

const INT = {
	isPrimitive: true,
	match: isNumber,
	fromHexString: string => parseInt( string.substring( 1 ), 16 ),
	toHexString: value => '#' + value.toString( 16 ).padStart( 6, 0 )
};

const ARRAY = {
	isPrimitive: false,
	match: Array.isArray,
	fromHexString( string, target ) {
		const int = INT.fromHexString( string );
		target[ 0 ] = ( int >> 16 & 255 ) / 255;
		target[ 1 ] = ( int >> 8 & 255 ) / 255;
		target[ 2 ] = ( int & 255 ) / 255;
	},
	toHexString( [ r, g, b ] ) {
		const int = ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
		return INT.toHexString( int );
	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

export function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}