import jsdocData from './api';

import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import pkg from '../package.json';

const OUTPUT = 'index.html';
const TEMPLATE = 'scripts/site.html';
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

const jsdocDebug = `<script type="text/javascript">
window.jsdocDebug = ${JSON.stringify( jsdocData )};
console.log( "jsdocDebug", jsdocDebug );
</script>`;

const html = read( TEMPLATE )
	.replace( '!=readme', md.render( read( README ) ) )
	.replace( '!=api', md.render( read( API ) ) )
	.replace( '!=jsdocDebug', jsdocDebug )
	.replace( new RegExp( `href="${pkg.homepage}`, 'g' ), 'href="' ); // make hardcoded links in readme relative

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}
