import { AssertionError } from 'assert';

// run with "--soft-fail" to exit with code 0 even if tests don't pass
const SOFT_FAIL = !!process.argv.slice( 2 ).find( v => v === '--soft-fail' );

// a very lil test runner
export default function( spec ) {

	let failures = 0;
	const tests = [];

	class Test {
		constructor( name, test ) {
			this.name = name;
			this.test = test;
		}
		run() {
			try {
				this.test();
			} catch ( e ) {
				failures++;
				if ( e instanceof AssertionError ) {
					console.log( red( `✕ ${e.message}` ) );
					console.log( stackTraceToFileLink( e.stack ) );
				} else {
					console.log( red( `✕ Unexpected error in test: ${this.name}` ) );
					console.log( e.stack );
				}
			}
		}
	}

	spec( ( name, test ) => {
		tests.push( new Test( name, test ) );
	} );

	const numTests = tests.length;

	tests.forEach( t => t.run() );

	if ( failures > 0 ) {
		console.log( red( `✕ ${failures}/${numTests} tests failed` ) );
		process.exit( SOFT_FAIL ? 0 : 1 );
	} else {
		console.log( grn( `✓ ${numTests}/${numTests} tests passed` ) );
		process.exit( 0 );
	}

}

const red = str => `\x1b[31m${str}\x1b[0m`;
const grn = str => `\x1b[32m${str}\x1b[0m`;

function stackTraceToFileLink( stack ) {
	return stack.match( /[a-z_\-\\\/\.]+:\d+:\d+/i )[ 0 ];
}