import fs from 'fs';

const TYPES_FILE = 'dist/lil-gui.esm.d.ts';

const OLD_PARAMS = '\\(object: object, property: string';
const NEW_PARAMS = '<T>(object: T, property: keyof T';

let contents = fs.readFileSync( TYPES_FILE, 'utf8' );

const replace = ( before, after ) => contents.replace( new RegExp( before, 'g' ), after );

contents = replace(
	`add${OLD_PARAMS}`,
	`add${NEW_PARAMS}`
);

contents = replace(
	`addColor${OLD_PARAMS}`,
	`addColor${NEW_PARAMS}`
);

contents = replace(
	'\\* @param \\{object\\} object',
	'* @param {T} object'
);

contents = replace(
	'\\* @param \\{string\\} property',
	'* @param {keyof T} property'
);

fs.writeFileSync( TYPES_FILE, contents );
