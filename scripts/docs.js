/* eslint-disable no-console */
/* eslint-env node */

const README = 'README.md';
const JSDOC_INPUT = 'build/gui.module.js';
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
output = output.replace( '!=jsdoc', md.render( jsdoc2md.renderSync( {
	files: JSDOC_INPUT
} ) ) );

fs.writeFileSync( DEST, output );