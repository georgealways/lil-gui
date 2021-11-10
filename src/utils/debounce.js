export default function debounce( func, delay ) {

	let timeout;

	return function( ...args ) {

		clearTimeout( timeout );

		timeout = setTimeout( () => func( ...args ), delay );

	};

}
