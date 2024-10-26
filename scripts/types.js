// jsdoc-api doesn't support "keyof", so we need to patch the generated types

import fs from 'fs';

const TYPES_FILE = 'dist/lil-gui.esm.d.ts';

let contents = fs.readFileSync( TYPES_FILE, 'utf-8' );

const OLD_PARAMS = '(object: object, property: string';
const NEW_PARAMS = '<T>(object: T, property: keyof T';

console.log( `Types: Patching ${TYPES_FILE}...\n` );

replace(
	`add${OLD_PARAMS}`,
	`add${NEW_PARAMS}`
);

replace(
	`addColor${OLD_PARAMS}`,
	`addColor${NEW_PARAMS}`
);

replace(
	'* @param {object} object',
	'* @param {T} object'
);

replace(
	'* @param {string} property',
	'* @param {keyof T} property'
);

fs.writeFileSync( TYPES_FILE, contents );

function replace( before, after ) {
	const regex = new RegExp( escapeRegExp( before ), 'g' );
	const matches = contents.match( regex );
	const count = matches ? matches.length : 0;
	if ( count === 0 ) {
		console.log( `Error: Could not find any instances of: "${before}"` );
		process.exit( 1 );
	} else {
		console.log( `Replaced ${count} instances:` );
		console.log( dim( before ) );
		console.log( after );
		console.log();
		contents = contents.replace( regex, after );
	}
}

function escapeRegExp( string ) {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

function dim( str ) {
	return `\x1b[2m${str}\x1b[0m`;
}
