import glob from 'glob';
import markdownit from 'markdown-it';
import hljs from 'highlight.js';
import hbs from 'handlebars';
import rimraf from 'rimraf';

import fs from 'fs';
import { join } from 'path';

import pkg from '../package.json';

// deletes generated index.html files from markdown-based examples
const CLEAN = process.argv.includes( '--clean' );

// creates a markdown parser with a custom syntax highlighting pass for code blocks
const md = getMarkdown();

const TEMPLATE = 'homepage/example.hbs.html';
const template = hbs.compile( fs.readFileSync( TEMPLATE, 'utf-8' ) );

// markdown examples are expected to have a .gitignore containing index.html
glob( 'examples/*/.gitignore', ( err, files ) => {

	if ( err ) {
		return console.error( err );
	}

	const dirs = files.map( f => f.replace( '/.gitignore', '' ) );

	if ( CLEAN ) {
		return clean( dirs );
	}

	console.time( 'examples' );
	dirs.forEach( makeExample );
	console.timeEnd( 'examples' );

} );

// regexp for special markdown directives
const BACKTICK_FENCE = /```\S+\n[\s\S]*?\n```/gmi;
const SQUIGGLE_FENCE = /~~~js([\s\S]*?)\n~~~/gmi;
const SHOW_EXTERNAL = /<!-- show (\S+) -->/gmi;
const HEADING = /^#+ ([\S\s]*?)$/mi;

function makeExample( dir ) {

	const slug = dir.substr( dir.lastIndexOf( '/' ) + 1 );

	let body;

	// read example contents from examples/xyz/xyz.md
	try {
		body = fs.readFileSync( join( dir, slug + '.md' ), 'utf-8' );
	} catch ( e ) {
		console.error( dir, `doesn't have ${slug}.md` );
		return;
	}

	// find title
	let title = dir;
	try {
		title = body.match( HEADING )[ 1 ];
	} catch ( e ) {
		console.error( dir, "doesn't have a title" );
	}

	// backtick code blocks are broken out of <main> for full bleed style
	body = body.replace( BACKTICK_FENCE, block => scriptSection( block ) );

	// same for squiggle blocks, but they also get a header, and are executed
	body = body.replace( SQUIGGLE_FENCE, ( block, code ) => {

		// remove whitespace that could confuse markdown
		code = code.replace( /\n{2,}/g, '\n' );

		const script = `<script type="module">${code}</script>`;
		const section = scriptSection( block, 'This page:' );

		return script + section;

	} );

	// external code blocks aren't executed, but they get a header like squiggle blocks
	body = body.replace( SHOW_EXTERNAL, ( _, scriptPath ) => {

		const header = `<a href="${scriptPath}">${scriptPath}</a>`;

		const file = fs.readFileSync( join( dir, scriptPath ), 'utf-8' );

		const block = '```js\n' + file.trim() + '\n```';

		return scriptSection( block, header );

	} );

	body = md.render( body );

	// render markdown and hbs.html
	let html = template( { title, body, pkg } );

	// clean up any lingering mains from scriptSection
	html = html.replace( /<main>\s*<\/main>/gmi, '' );

	fs.writeFileSync( join( dir, 'index.html' ), html );

}

function scriptSection( fenceBlock, header ) {

	let section = '<section class="script">';

	if ( header ) section += `<header>${header}</header>`;

	section += '\n\n';
	section += fenceBlock;
	section += '\n\n';

	section += '</section>';

	return `</main>${section}<main>`;

}

function getMarkdown() {

	const CUSTOM_TOKENS = [
		'$customToken',
		'$constructor',
		'$widget',
		'$onFinishChange',
		'$prepareFormElement',
		'$updateDisplay',
		'$save',
		'$load',
		'$modifyValue'
	];

	const tokenREs = CUSTOM_TOKENS
		.map( escapeRegExp )
		.map( str => new RegExp( `${str}\\b`, 'g' ) );
		// ^ why won't this work with a preceding \b?

	return markdownit( {
		html: true,
		highlight: function( code, language ) {

			if ( !language || !hljs.getLanguage( language ) ) return '';

			let v = hljs.highlight( code, { language } ).value;

			// wraps whole word matches for any CUSTOM_TOKEN in span.hljs-custom
			for ( let token of tokenREs ) {
				v = v.replace( token, '<span class="hljs-custom">$&</span>' );
			}

			return v;

		}
	} );

}

// adds backslashes to special regex characters
function escapeRegExp( string ) {
	return string.replace( /[.*+?^${}()|[\]\\]/g, '\\$&' );
}

function clean( dirs ) {

	dirs
		.map( dir => join( dir, 'index.html' ) )
		.filter( fs.existsSync )
		.map( index => rimraf( index, err => {

			if ( err ) {
				return console.error( err );
			}

			console.log( 'deleted', index );

		} ) );

}
