/* eslint-disable no-cond-assign */

export default function normalizeColorString( string ) {

	let match;

	if ( match = string.match( /(#|0x)?([a-f0-9]{6})/i ) ) {
		return '#' + match[ 2 ];
	}

	if ( match = string.match( /#([a-f0-9])([a-f0-9])([a-f0-9])/i ) ) {
		return '#'
			+ match[ 1 ] + match[ 1 ]
			+ match[ 2 ] + match[ 2 ]
			+ match[ 3 ] + match[ 3 ];
	}

	if ( match = string.match( /rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/ ) ) {
		return '#'
			+ parseInt( match[ 1 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 2 ] ).toString( 16 ).padStart( 2, 0 )
			+ parseInt( match[ 3 ] ).toString( 16 ).padStart( 2, 0 );
	}

	return false;

}
