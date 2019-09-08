import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import jsdocData from './api.js';

const OUTPUT = 'index.html';
const TEMPLATE = 'scripts/homepage.html';
const README = 'README.md';
const API = 'API.md';
const snippets = 'snippets.md';

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
window.jsdocDebug = ${JSON.stringify( jsdocData, null, '\t' )};
console.log( "jsdocDebug", jsdocDebug );
</script>`;

fs.writeFileSync( OUTPUT,
	read( TEMPLATE )
		.replace( '!=readme', md.render( read( README ) ) )
		.replace( '!=api', md.render( read( API ) ) )
		.replace( '!=jsdocDebug', jsdocDebug )
		.replace( '!=snippets', md.render( read( snippets ) ) )
);

function read( path ) {
	return fs.readFileSync( path ).toString();
}
