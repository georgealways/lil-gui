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

// regexp for special markdown directives
const BACKTICK_FENCE = /```\S+\n([\s\S]*?)\n```/gmi;
const SQUIGGLE_FENCE = /~~~js([\s\S]*?)\n~~~/gmi;
const SHOW_EXTERNAL = /<!-- show (\S+) -->/gmi;
const HEADING = /^#+ ([\S\s]*?)$/gmi;

function makeExample( dir ) {

	const slug = dir.substr( dir.lastIndexOf( '/' ) + 1 );

	let body;

	// read example contents
	try {
		body = readFileSync( join( dir, slug + '.md' ), 'utf-8' );
	} catch ( e ) {
		console.error( dir, `doesn't have ${slug}.md` );
		return;
	}

	// find title
	let title = dir;
	try {
		title = HEADING.exec( body )[ 1 ];
	} catch ( e ) {
		console.error( dir, "doesn't have a title" );
	}

	// demote headings
	body = body.replace( HEADING, a => '#' + a );

	// backtick code blocks are broken out of <main> for full bleed style
	body = body.replace( BACKTICK_FENCE, fence => {
		return breakMain( scriptSection( fence ) );
	} );

	// same for squiggle blocks, but they also get a header, and are executed
	body = body.replace( SQUIGGLE_FENCE, ( fence, contents ) => {

		let replaced = '';

		replaced += '<script type="module">';
		// remove whitespace that could confuse markdown
		replaced += contents.replace( /\n{2,}/g, '\n' );
		replaced += '</script>';

		replaced += scriptSection( fence, 'This page:' );
		replaced = breakMain( replaced );

		return replaced;

	} );

	// external code blocks work like squiggle blocks, but they aren't executed
	body = body.replace( SHOW_EXTERNAL, ( _, scriptPath ) => {

		let file = readFileSync( join( dir, scriptPath ), 'utf-8' );
		file = scriptSection( '```js\n' + file.trim() + '\n```', scriptPath );
		file = breakMain( file );
		return file;

	} );

	// render markdown and hbs.html
	let html = template( { title, body: md.render( body ) } );

	// clean up any uneccessary mains from breakMain
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
