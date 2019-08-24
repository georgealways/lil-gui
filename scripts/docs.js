/* eslint-disable no-console */
/* eslint-env node */

const README = 'README.md';
const SOURCE_PATH = 'https://github.com/georgealways/gui/blob/master';

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

// render pretty readme

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

// render docs

const jsdoc2md = require( 'jsdoc-to-markdown' );

const fs = require( 'fs' );
const hljs = require( 'highlight.js' );
const readme = fs.readFileSync( README ).toString();
const template = fs.readFileSync( TEMPLATE ).toString();

let output = template;

output = output.replace( '!=readme', md.render( readme ) );


// render docs

const jsdoc = require( 'jsdoc-api' );

const data = jsdoc.explainSync( {
	files: JSDOC_INPUT
} ).filter( v => v.undocumented !== true );

const transformed = {};
data.forEach( v => {
	delete v.comment;
	if ( v.meta ) {
		v.meta.path = v.meta.path.replace( process.cwd(), SOURCE_PATH );
	}
	transformed[ v.longname ] = v;
} );

const json = JSON.stringify( transformed, null, '\t' );

output = output.replace( '!=jsdoc',
	`<pre>${json}</pre>
	<script type="text/javascript">console.log(${json})</script>`
);

fs.writeFileSync( DEST, output );