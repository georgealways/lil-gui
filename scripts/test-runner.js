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
					console.log( '\x1b[31m✕ ' + e.message );
					console.log( '\t' + stackTraceToFileLink( e.stack ) );
				} else {
					console.log( '\x1b[31m✕ Unexpected error in test: ' + this.name );
					console.log();
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
		console.log( `\x1b[31m✕ ${failures}/${numTests} tests failed\x1b[0m` );
		process.exit( SOFT_FAIL ? 0 : 1 );
	} else {
		console.log( `\x1b[32m✓ ${numTests}/${numTests} tests passed\x1b[0m` );
		process.exit( 0 );
	}

}

function stackTraceToFileLink( stack ) {
	return stack.match( /[a-z_\-\\\/\.]+:\d+:\d+/i )[ 0 ];
}