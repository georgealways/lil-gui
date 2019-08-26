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
const toplevel = {};
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


	if ( v.kind === 'function' && v.scope === 'instance' ) {

		v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;
		v.signature += paramsToSignature( v.params );

	} else if ( v.kind === 'class' ) {

		if ( v.params ) {
			v.signature = `**new** ${v.name}` + paramsToSignature( v.params );
		} else {
			// class documented, but the constructor isn't, eg. Controller
			v.signature = `**${v.name}**`;
		}

		v.description = v.description || v.classdesc;

		toplevel[ v.longname ] = v;

	} else if ( v.kind === 'member' && v.scope === 'instance' ) {

		v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;

	}

	v.indexname = v.name;

	// view source url

	v.viewsource = `${path.join( v.meta.path, v.meta.filename )}#L${v.meta.lineno}`;

	delete v.comment; // crowding up my debug

	transformed.push( v );

} );

transformed.forEach( v => {
	if ( v.memberof && v.memberof in toplevel ) {
		const parent = toplevel[ v.memberof ];
		if ( !parent.children ) {
			parent.children = [];
		}
		parent.children.push( v );
	}
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

function paramsToSignature( params ) {
	if ( params.length === 0 ) {
		return '()';
	}
	const paramList = params
		.filter( p => p.name.indexOf( '.' ) === -1 ) // eg options.autoPlace
		.map( singleParamToSignature )
		.join( ', ' );
	return `( ${paramList} )`;
}

function singleParamToSignature( param ) {
	return param.optional ? `[${param.name}]` : param.name;
}

let jsdocTemplate = hbs.compile( fs.readFileSync( 'scripts/api.hbs' ).toString() );

let jsdocMD = jsdocTemplate( {
	data: transformed,
	toplevel: Object.values( toplevel ),
	debug: JSON.stringify( transformed ) } );

let jsdocHTML = md.render( jsdocMD );

output = output.replace( '!=jsdoc', jsdocHTML );

fs.writeFileSync( DEST, output );

