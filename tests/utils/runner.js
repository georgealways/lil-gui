import './shim';

import { AssertionError } from 'assert';
import fs from 'fs';

// run with --soft-fail to exit with code 0 even if tests don't pass

const SOFT_FAIL = process.argv.includes( '--soft-fail' );

console.time( 'tests' );

// collect tests

const tests = [];
fs.readdirSync( 'tests' ).forEach( filename => {

	if ( !filename.endsWith( '.js' ) ) return;

	const test = require( '../' + filename ).default;
	const name = filename.replace( '.js', '' );

	tests.push( new Test( name, test ) );

} );

// run tests

let failures = 0;
const numTests = tests.length;

tests.forEach( t => t.run() );

// results

console.timeEnd( 'tests' );

if ( failures > 0 ) {
	console.log( red( `✕ ${failures}/${numTests} tests failed` ) );
	process.exit( SOFT_FAIL ? 0 : 1 );
} else {
	console.log( grn( `✓ ${numTests}/${numTests} tests passed` ) );
	process.exit( 0 );
}

function Test( name, test ) {
	this.name = name;
	this.run = () => {
		try {
			test();
		} catch ( e ) {
			failures++;
			if ( e instanceof AssertionError ) {
				console.log( red( `✕ ${e.message}` ) );
				console.log( e.stack );
			} else {
				console.log( red( `✕ Unexpected error in test: ${this.name}` ) );
				console.log( e.stack );
			}
		}
	};
}

function red( str ) { return `\x1b[31m${str}\x1b[0m`; }
function grn( str ) { return `\x1b[32m${str}\x1b[0m`; }
