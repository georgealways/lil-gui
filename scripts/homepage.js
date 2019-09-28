import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';

import pkg from '../package.json';
import jsdocData from './api';

const OUTPUT = 'index.html';
const TEMPLATE = 'scripts/homepage.hbs';
const README = 'README.md';
const API = 'API.md';

const JSDOC_DEBUG = !!process.argv.slice( 2 ).find( v => v === '--jsdoc-debug' );

const md = markdownit( {
	html: true,
	highlight: function( str, lang ) {
		if ( lang && hljs.getLanguage( lang ) ) {
			return hljs.highlight( lang, str ).value;
		}
		return '';
	}
} );

const jsdocDebug = JSDOC_DEBUG ? `<script type="text/javascript">
window.jsdocDebug = ${JSON.stringify( jsdocData )};
console.log( "jsdocDebug", jsdocDebug );
</script>` : '';

const template = hbs.compile( read( TEMPLATE ) );

const html = template( {
	readme: md.render( read( README ) ),
	api: md.render( read( API ) ),
	jsdocDebug
} ).replace( new RegExp( `href="${pkg.homepage}`, 'g' ), 'href="' );
// makes hardcoded links in readme relative on real site

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}
