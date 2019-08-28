import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';

const OUTPUT = 'docs/index.html';
const TEMPLATE = 'scripts/docs.html';
const README = 'README.md';
const API = 'API.md';

const md = markdownit( {
	html: true,
	highlight: function( str, lang ) {
		if ( lang && hljs.getLanguage( lang ) ) {
			return hljs.highlight( lang, str ).value;
		}
		return '';
	}
} );

fs.writeFileSync( OUTPUT,
	read( TEMPLATE )
		.replace( '!=readme', md.render( read( README ) ) )
		.replace( '!=api', md.render( read( API ) ) )
);

function read( path ) {
	return fs.readFileSync( path ).toString();
}