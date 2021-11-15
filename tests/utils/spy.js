/**
 * Replaces a method with a function that calls that method and a "spy" function.
 * @param {object} instance
 * @param {string} methodName
 * @param {Function} spy
 */
export default function( instance, methodName, spy ) {
	const method = instance[ methodName ];
	if ( typeof method !== 'function' ) {
		throw Error( `Tried to spy on "${methodName}" but it's not a function: ${method}` );
	}
	instance[ methodName ] = function() {
		method.apply( this, arguments );
		spy.apply( this, arguments );
	};
}
