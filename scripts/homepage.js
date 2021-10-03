import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';

import pkg from '../package.json';
import jsdocData from './api';

const OUTPUT = 'index.html';
const TEMPLATE = 'scripts/homepage.hbs.html';
const README = 'README.md';
const GUIDE = 'Guide.md';
const API = 'API.md';

const JSDOC_DEBUG = false;

const md = markdownit( {
	html: true,
	highlight: function( code, language ) {
		if ( language && hljs.getLanguage( language ) ) {
			return hljs.highlight( code, { language } ).value;
		}
		return '';
	}
} );

const jsdocDebug = JSDOC_DEBUG ? `<script type="text/javascript">
window.jsdocDebug = ${JSON.stringify( jsdocData )};
console.log( "jsdocDebug", jsdocDebug );
</script>` : '';

const template = hbs.compile( read( TEMPLATE ) );

const api = read( API );

let apitoc;

// todo: gross
api.replace( /# API([\s\S]*)<!--endtoc-->/m, function( a, b ) {
	apitoc = b.replace( /^#/gm, '##' ); // demote headings
} );

const apibody = api.replace( apitoc, '' );

const html = template( {
	readme: md.render( read( README ) ),
	apitoc: md.render( apitoc ),
	apibody: md.render( apibody ),
	guide: md.render( read( GUIDE ) ),
	jsdocDebug,
	pkg
} ).replace( new RegExp( `href="${pkg.homepage}`, 'g' ), 'href="' );
// makes hardcoded links in readme relative on real site

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}

