import fs from 'fs';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';
import { execSync } from 'child_process';

import pkg from '../package.json';
import jsdocData from './api';

const OUTPUT = 'index.html';
const TEMPLATE = 'homepage/homepage.hbs.html';
const README = 'README.md';
const GUIDE = 'Guide.md';
const MIGRATING = 'Migrating.md';
const API = 'API.md';

console.time( 'homepage' );

// README.md
// -----------------------------------------------------------------------------

let readme = read( README );

// remove homepage link
readme = readme.replace( '[**Homepage**](https://lil-gui.georgealways.com/) •', '' );

// Guide.md
// -----------------------------------------------------------------------------

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

// include major & minor version in CDN examples, bad form to use bare/latest
guide = guide.replace( /@VERSION/g, '@' + pkg.version.substring( 0, pkg.version.lastIndexOf( '.' ) ) );

// API.md
// -----------------------------------------------------------------------------

// build TOC from API
const api = read( API );
let apitoc;

// this regex catches everything after the first heading, up until a certain comment
api.replace( /^# API([\s\S]*)<!--endtoc-->/m, function( a, b ) {
	apitoc = b.replace( /^#/gm, '##' ); // demote headings
} );

const apibody = api.replace( apitoc, '' );

// api.js debug helper
// -----------------------------------------------------------------------------

// console.logs the jsdocData object on the generated html file
// so you can inspect it in dev tools
const JSDOC_DEBUG = false;

const jsdocDebug = JSDOC_DEBUG ? `<script type="text/javascript">
window.jsdocDebug = ${JSON.stringify( jsdocData )};
console.log( "jsdocDebug", jsdocDebug );
</script>` : '';

// build info
// -----------------------------------------------------------------------------

const builds = {
	module: pkg.module,
	moduleMin: pkg.module.replace( '.js', '.min.js' )
};

const cmdToKB = cmd => {
	const bytes = parseInt( execSync( cmd ).toString() );
	return ( bytes / 1000 ).toFixed( 1 );
};

const sizeMin = cmdToKB( `cat ${builds.moduleMin} | wc -c` );
const sizeGzip = cmdToKB( `gzip -c ${builds.moduleMin} | wc -c` );

// render
// -----------------------------------------------------------------------------

const template = hbs.compile( read( TEMPLATE ) );

const md = markdownit( {
	html: true,
	highlight: function( code, language ) {
		if ( language && hljs.getLanguage( language ) ) {
			return hljs.highlight( code, { language } ).value;
		}
		return '';
	}
} );

let html = template( {
	readme: md.render( readme ),
	guidetoc: md.render( guidetoc ),
	guide: md.render( guide ),
	migrating: md.render( read( MIGRATING ) ),
	apitoc: md.render( apitoc ),
	apibody: md.render( apibody ),
	builds,
	sizeMin,
	sizeGzip,
	jsdocDebug,
	pkg
} );

// html final processing
// -----------------------------------------------------------------------------

// makes hardcoded links in readme relative on real site
html = html.replace( new RegExp( `href="${pkg.homepage}/?`, 'g' ), 'href="' );

// open external links in a new window
html = html.replace( /href="(https?:)?\/\//g, m => `target="_blank" ${m}` );

// move anchors from inside to before headers
html = html.replace( /(<h[12]>)(<a name=".*"><\/a>)\s*/g, ( ...args ) => {
	return `${args[ 2 ]}\n${args[ 1 ]}`;
} );

fs.writeFileSync( OUTPUT, html );

function read( path ) {
	return fs.readFileSync( path ).toString();
}

console.timeEnd( 'homepage' );
