import { AssertionError } from 'assert';

const SOFT_FAIL = !!process.argv.slice( 2 ).find( v => v === '--soft-fail' );

// shim just enough browser stuff to run in node

const createElement = () => ( {
	addEventListener() {},
	appendChild() {},
	insertBefore() {},
	setAttribute() {},
	classList: { add() {} },
	style: { setProperty() {} },
	parentElement: { removeChild() {} }
} );

global.window = {
	addEventListener() {},
	removeEventListener() {}
};

global.document = {
	body: createElement(),
	createElement: createElement,
	querySelector: createElement
};

export default function testRunner( test ) {

	let failures = 0;
	const tests = [];

	class Test {
		constructor( name, fnc ) {
			this.name = name;
			this.fnc = fnc;
		}
		run() {
			try {
				this.fnc();
			} catch ( e ) {
				if ( e instanceof AssertionError ) {
					console.log( '\x1b[31m✕ ' + e.message );
					console.log( '\t' + e.stack.match( /[a-z_\-\\\/\.]+:\d+:\d+/i )[ 0 ] );
				} else {
					console.log( '\x1b[31m✕ Unexpected error in test: ' + name );
					console.log();
					console.log( e.stack );
				}
				failures++;
			}
		}
	}

	test( ( name, fnc ) => {
		tests.push( new Test( name, fnc ) );
	} );

	const numTests = tests.length;

	tests.forEach( t => t.run() );

	if ( failures ) {
		console.log( `\x1b[31m✕ ${failures}/${numTests} tests failed\x1b[0m` );
		process.exit( SOFT_FAIL ? 0 : 1 );
	} else {
		console.log( `\x1b[32m✓ ${numTests}/${numTests} tests passed\x1b[0m` );
		process.exit( 0 );
	}

}