const STRING = {
	isPrimitive: true,
	match: v => typeof v === 'string',
	fromHexString: string => string,
	toHexString: value => value
};

const INT = {
	isPrimitive: true,
	match: v => typeof v === 'number',
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

const OBJECT = {
	isPrimitive: false,
	match: v => Object( v ) === v,
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

const FORMATS = [ STRING, INT, ARRAY, OBJECT ];

export default function getColorFormat( value ) {
	return FORMATS.find( format => format.match( value ) );
}
