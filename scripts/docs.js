/* eslint-disable no-console */
/* eslint-env node */

const README = 'README.md';
const JSDOC_INPUT = require( '../package.json' ).module;
const TEMPLATE = 'docs/template.html';
const DEST = 'docs/index.html';

const md = require( 'markdown-it' )( {
	html: true,
	// https://github.com/markdown-it/markdown-it#syntax-highlighting
	highlight: function( str, lang ) {
		if ( lang && hljs.getLanguage( lang ) ) {
			try {
				return hljs.highlight( lang, str ).value;
			} catch ( e ) {}
		}
		return ''; // use external default escaping
	}
} );
const jsdoc2md = require( 'jsdoc-to-markdown' );

const fs = require( 'fs' );
const hljs = require( 'highlight.js' );
const readme = fs.readFileSync( README ).toString();
const template = fs.readFileSync( TEMPLATE ).toString();

let output = template;

output = output.replace( '!=readme', md.render( readme ) );

const kind = [ 'function', 'member' ];

let jsdocData = jsdoc2md.getTemplateDataSync( {
	files: JSDOC_INPUT
} );

jsdocData = jsdocData.sort( ( a, b ) => {
	const diff = kind.indexOf( a.kind ) - kind.indexOf( b.kind );
	if ( diff === 0 ) {
		return a.id.localeCompare( b.id );
	}
	return diff;
} );

const guiIndex = jsdocData.findIndex( i => {
	return i.kind === 'class' && i.name === 'GUI';
} );
const guiClass = jsdocData.splice( guiIndex, 1 )[ 0 ];

const controllerIndex = jsdocData.findIndex( i => {
	return i.kind === 'class' && i.name === 'Controller';
} );
const controllerClass = jsdocData.splice( controllerIndex, 1 )[ 0 ];

jsdocData.unshift( controllerClass );
jsdocData.unshift( guiClass );


// console.log(  );
output = output.replace( '!=jsdoc', md.render( jsdoc2md.renderSync( {
	data: jsdocData
} ) ) );

fs.writeFileSync( DEST, output );