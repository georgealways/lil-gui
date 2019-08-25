/* eslint-disable no-console */
/* eslint-env node */

const README = 'README.md';
const REPO = 'https://github.com/georgealways/gui/blob/master';

const JSDOC_INPUT = [
	'src/GUI.js',
	'src/Controller.js',
	'src/BooleanController.js',
	'src/ColorController.js',
	'src/FunctionController.js',
	'src/NumberController.js',
	'src/OptionController.js',
	'src/StringController.js',
	'src/Header.js'
];

const TEMPLATE = 'docs/template.html';
const DEST = 'docs/index.html';

const fs = require( 'fs' );
const path = require( 'path' );
const hbs = require( 'handlebars' );
const hljs = require( 'highlight.js' );
const jsdoc = require( 'jsdoc-api' );
// https://github.com/markdown-it/markdown-it#syntax-highlighting
const md = require( 'markdown-it' )( {
	html: true,
	highlight: function( str, lang ) {
		if ( lang && hljs.getLanguage( lang ) ) {
			try {
				return hljs.highlight( lang, str ).value;
			} catch ( e ) {}
		}
		return ''; // use external default escaping
	}
} );


const readme = fs.readFileSync( README ).toString();
const template = fs.readFileSync( TEMPLATE ).toString();

let output = template;

// render readme

output = output.replace( '!=readme', md.render( readme ) );

// render docs

const transformed = [];
const data = jsdoc.explainSync( {
	files: JSDOC_INPUT
} );

data.forEach( v => {

	if ( v.undocumented ) return;

	if ( v.kind === 'package' ) return;

	if ( v.kind === 'module' ) return;

	v = Object.assign( {}, v );

	// string replacement

	forEachRecursive( v, ( object, key, value, depth ) => {

		if ( typeof value == 'string' ) {

			// replace local directories with path to github
			value = value.replace( process.cwd(), REPO );

			// jsdoc finds modules to be very novel
			value = value.replace( /^module:/, '' );

		}

		object[ key ] = value;

	} );

	// nicename

	v.nicename = v.longname.replace( /(\w+)#/g, ( $0, $1 ) => {
		return $1 + '.';
	} );

	if ( v.scope === 'instance' ) {
		v.nicename = v.nicename.replace( /(\w+)\./g, ( $0, $1 ) => {
			return $1.toLowerCase() + '.';
		} );
	}

	if ( v.kind === 'function' ) {
		// v.nicename += '𝑓';//v.params.length ? '(…)' : '()';
	}

	if ( v.kind === 'class' ) {
		// v.nicename = 'new ' + v.nicename + '(…)';
	}

	// view source url

	v.viewsource = `${path.join( v.meta.path, v.meta.filename )}#L${v.meta.lineno}`;

	delete v.comment; // crowding up my debug

	transformed.push( v );

} );

function forEachRecursive( object, callback, depth = 0 ) {
	for ( let key in object ) {
		const value = object[ key ];
		if ( Object( value ) === value ) {
			forEachRecursive( value, callback, depth + 1 );
		} else {
			callback( object, key, value, depth );
		}
	}
}

let jsdocTemplate = hbs.compile( fs.readFileSync( 'scripts/api.hbs' ).toString() );

let jsdocHTML = jsdocTemplate( { data: transformed, json: JSON.stringify( transformed ) } );

output = output.replace( '!=jsdoc', jsdocHTML );

fs.writeFileSync( DEST, output );

