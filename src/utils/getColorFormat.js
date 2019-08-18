import { isString, isNumber, isObject } from './is.js';

/**
 * @typedef ColorFormat
 * @property {boolean} isPrimitive false for Array and Object formats
 * @property {function(*):boolean} match returns true if a value matches this format
 * @property {function(string):*} fromHexString converts from #FFFFFF to this format
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

const ARRAY = {
	isPrimitive: false,
	match: Array.isArray,
	fromHexString( string ) {
		const int = INT.fromHexString( string );
		return [
			( int >> 16 & 255 ) / 0xff,
			( int >> 8 & 255 ) / 0xff,
			( int & 255 ) / 0xff
		];
	},
	toHexString( [ r, g, b ] ) {
		const int = ( r * 0xff ) << 16 ^ ( g * 0xff ) << 8 ^ ( b * 0xff ) << 0;
		return INT.toHexString( int );
	}
};

const OBJECT = {
	isPrimitive: false,
	match: isObject,
	fromHexString( string ) {
		const int = INT.fromHexString( string );
		return {
			r: ( int >> 16 & 255 ) / 0xff,
			g: ( int >> 8 & 255 ) / 0xff,
			b: ( int & 255 ) / 0xff
		};
	},
	toHexString( { r, g, b } ) {
		const int = ( r * 0xff ) << 16 ^ ( g * 0xff ) << 8 ^ ( b * 0xff ) << 0;
		return INT.toHexString( int );
	}
};

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

/**
 * @returns {ColorFormat}
 */
export function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}