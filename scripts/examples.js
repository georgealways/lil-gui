import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import glob from 'glob';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';

const TEMPLATE = 'homepage/example.hbs.html';
const template = hbs.compile( readFileSync( TEMPLATE, 'utf-8' ) );

const md = markdownit( {
	html: true,
	highlight: function( code, language ) {
		if ( language && hljs.getLanguage( language ) ) {
			return hljs.highlight( code, { language } ).value;
		}
		return '';
	}
} );

console.time( 'examples' );

glob( 'examples/*/.gitignore', ( err, files ) => {

	if ( err ) {
		return console.error( err );
	}

	files
		.map( f => f.replace( '/.gitignore', '' ) )
		.map( makeExample );

} );

console.timeEnd( 'examples' );

function makeExample( dir ) {

	const PRE = /```\S+\n([\s\S]*?)\n```/gmi;
	const PRE_EXT = /<!-- show (\S+) -->/gmi;
	const PRE_RUN = /~~~js([\s\S]*?)\n~~~/gmi;

	const slug = dir.substr( dir.lastIndexOf( '/' ) + 1 );

	// read example contents
	let body;
	try {
		body = readFileSync( join( dir, slug + '.md' ), 'utf-8' );
	} catch ( e ) {
		console.error( dir, `doesn't have ${slug}.md` );
		return;
	}

	const HEADING = /^#+ ([^\n]*)/i;

	let title = dir;
	try {
		title = body.match( HEADING )[ 1 ];
	} catch ( e ) {
		console.error( dir, 'doesn\'t have a title' );
	}

	// demote headings
	body = body.replace( HEADING, a => '#' + a );

	// pre's are broken out of <main> for full bleed style
	body = body.replace( PRE, fence => {
		return breakMain( scriptSection( fence ) );
	} );

	// render to a pre and run
	body = body.replace( PRE_RUN, ( fence, contents ) => {

		let replaced = '';
		replaced += '<script type="module">';
		replaced += contents.replace( /\n{2,}/g, '\n' );
		replaced += '</script>';
		replaced += scriptSection( fence, 'This page:' );
		replaced = breakMain( replaced );

		return replaced;

	} );

	// render external file to pre
	body = body.replace( PRE_EXT, ( _, scriptPath ) => {

		let file = readFileSync( join( dir, scriptPath ), 'utf-8' );
		file = scriptSection( '```js\n' + file.trim() + '\n```', scriptPath );
		file = breakMain( file );
		return file;

	} );

	body = md.render( body );

	let html = template( { title, body } );
	html = html.replace( /<main>\s*<\/main>/gmi, '' );

	writeFileSync( join( dir, 'index.html' ), html );

}

function breakMain( str ) {
	return `</main>${str}<main>`;
}

function scriptSection( contents, header ) {
	let section = '\n\n<section class="script">';
	if ( header ) section += `<header>${header}</header>`;
	section += '\n\n';
	section += contents;
	section += '\n\n</section>\n\n';
	return section;
}
