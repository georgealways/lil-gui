import './shim';

import { AssertionError } from 'assert';
import fs from 'fs';

// run with "--soft-fail" to exit with code 0 even if tests don't pass
const SOFT_FAIL = !!process.argv.slice( 2 ).find( v => v === '--soft-fail' );

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
				// console.log( stackTraceToFileLink( e.stack ) );
				console.log( e.stack );
			} else {
				console.log( red( `✕ Unexpected error in test: ${this.name}` ) );
				console.log( e.stack );
			}
		}
	}
}

const SUFFIX = /\.test\.js$/;

fs.readdirSync( 'tests' ).forEach( filename => {

	console.log( filename );
	if ( filename.match( SUFFIX ) ) {
		const name = filename.replace( SUFFIX, '' );
		const test = require( '../' + filename ).default;
		tests.push( new Test( name, test ) );
	}

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

function red( str ) { return `\x1b[31m${str}\x1b[0m`; }
function grn( str ) { return `\x1b[32m${str}\x1b[0m`; }

// function stackTraceToFileLink( stack ) {
// 	return stack.match( /[a-z_\-/.\\]+:\d+:\d+/i )[ 0 ];
// }
