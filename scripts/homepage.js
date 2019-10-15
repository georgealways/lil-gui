import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';

import pkg from '../package.json';
import jsdocData from './api';

const OUTPUT = 'index.html';
const TEMPLATE = 'scripts/homepage.hbs.html';
const README = 'README.md';
const TUTORIAL = 'Tutorial.md';
const API = 'API.md';

const JSDOC_DEBUG = false;

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
	tutorial: md.render( read( TUTORIAL ) ),
	jsdocDebug,
	pkg
} ).replace( new RegExp( `href="${pkg.homepage}`, 'g' ), 'href="' );
// makes hardcoded links in readme relative on real site

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}

