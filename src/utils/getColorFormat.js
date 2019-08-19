import { isString, isNumber, isObject } from './is.js';

/**
 * @typedef ColorFormat
 * @property {boolean} isPrimitive false for Array and Object formats
 * @property {function(*):boolean} match returns true if a value matches this format
 * @property {function(string,*):*} fromHexString converts from #FFFFFF to this format
 * @property {function(*):string} toHexString converts from this format to #FFFFFF
 */

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

const OBJECT = {
	isPrimitive: false,
	match: isObject,
	fromHexString( string, target ) {
		const int = INT.fromHexString( string );
		target.r = ( int >> 16 & 255 ) / 255;
		target.g = ( int >> 8 & 255 ) / 255;
		target.b = ( int & 255 ) / 255;
	},
	toHexString( { r, g, b } ) {
		const int = ( r * 255 ) << 16 ^ ( g * 255 ) << 8 ^ ( b * 255 ) << 0;
		return INT.toHexString( int );
	}
};

const FORMATS = [ STRING, INT, OBJECT ];

/**
 * @returns {ColorFormat}
 */
export function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}