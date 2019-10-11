/* eslint-disable no-cond-assign */

export default function( string ) {

	let match, result;

	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {

		result = match[ 2 ];

	} else if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {

		result = parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );

	} else if ( match = string.match( /^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i ) ) {

		result = match[ 1 ] + match[ 1 ] + match[ 2 ] + match[ 2 ] + match[ 3 ] + match[ 3 ];

	}

	if ( result ) {
		return '#' + result;
	}

	return false;

}
