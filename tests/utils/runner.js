import './shim.js';
import fs from 'fs';

// run with --soft-fail to exit with code 0 even if tests don't pass
const SOFT_FAIL = process.argv.includes( '--soft-fail' );

console.time( 'tests' );

// run tests

let failures = 0;

const tests = fs.readdirSync( 'tests' )
	.filter( file => file.endsWith( '.js' ) )
	.map( async file => {
		const module = await import( '../' + file );
		run( file, module.default );
	} );

await Promise.all( tests );

// results

console.timeEnd( 'tests' );

const numTests = tests.length;

if ( failures > 0 ) {
	console.log( red( `✕ ${failures}/${numTests} tests failed` ) );
	process.exit( SOFT_FAIL ? 0 : 1 );
} else {
	console.log( grn( `✓ ${numTests}/${numTests} tests passed` ) );
	process.exit( 0 );
}

function run( name, test ) {
	try {
		test();
	} catch ( e ) {
		failures++;
		console.log( red( `Error in test: ${name}` ) );
		console.log( e.stack );
	}
}

function red( str ) { return `\x1b[31m${str}\x1b[0m`; }
function grn( str ) { return `\x1b[32m${str}\x1b[0m`; }
