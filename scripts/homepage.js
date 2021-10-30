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
const MIGRATING = 'Migrating.md';
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

let readme = read( README );

// remove homepage link
readme = readme.replace('[**Homepage**](https://lil-gui.georgealways.com/) • ', '');

// build TOC from API
const api = read( API );
let apitoc;

// this regex catches everything after the first heading, up until a certain comment
api.replace( /^# API([\s\S]*)<!--endtoc-->/m, function( a, b ) {
	apitoc = b.replace( /^#/gm, '##' ); // demote headings
} );

// build TOC from guide & insert anchors beside guide headers
let guide = read( GUIDE );
let guidetoc = '';
let guidetocIndex = 1;
const guidePrefix = 'Guide#';

// the regex catches all h2's
guide = guide.replace( /^## ([\s\S]*?)$/gm, function( _, heading ) {

	// sanitize title for url
	const slug = heading.replace( /[^a-zA-Z]+/gm, '-' );

	guidetoc += `${guidetocIndex}. [${heading}](#${guidePrefix}${slug})\n`;
	guidetocIndex++;

	// inject anchor into guide md
	return `## <a name="${guidePrefix}${slug}"></a> ${heading}`;

} );

const apibody = api.replace( apitoc, '' );

let html = template( {
	readme: md.render( readme ),
	guidetoc: md.render( guidetoc ),
	guide: md.render( guide ),
	migrating: md.render( read( MIGRATING ) ),
	apitoc: md.render( apitoc ),
	apibody: md.render( apibody ),
	jsdocDebug,
	pkg
} );

// makes hardcoded links in readme relative on real site
html = html.replace( new RegExp( `href="${pkg.homepage}/?`, 'g' ), 'href="' );

// open non anchor links in a new window
html = html.replace( /href="(?!#)/g, 'target="_blank" href="' );

// move anchors from inside to before headers
html = html.replace(/(<h[12]>)(<a name=".*"><\/a>)\s*/g, (...args) => {
	return `${args[2]}\n${args[1]}`;
});

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}

