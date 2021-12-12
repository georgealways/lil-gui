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

const TEMPLATE = 'homepage/example.hbs.html';
const template = hbs.compile( fs.readFileSync( TEMPLATE, 'utf-8' ) );

const md = getMarkdown();

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
const BACKTICK_FENCE = /```\S+\n([\s\S]*?)\n```/gmi;
const SQUIGGLE_FENCE = /~~~js([\s\S]*?)\n~~~/gmi;
const SHOW_EXTERNAL = /<!-- show (\S+) -->/gmi;
const HEADING = /^#+ ([\S\s]*?)$/mi;

function makeExample( dir ) {

	const slug = dir.substr( dir.lastIndexOf( '/' ) + 1 );

	let body;

	// read example contents
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

		const header = `<a href="${scriptPath}">${scriptPath}</a>`;

		let file = fs.readFileSync( join( dir, scriptPath ), 'utf-8' );
		file = scriptSection( '```js\n' + file.trim() + '\n```', header );
		file = breakMain( file );
		return file;

	} );

	body = md.render( body );

	// render markdown and hbs.html
	let html = template( { title, body, pkg } );

	// clean up any uneccessary mains from breakMain
	html = html.replace( /<main>\s*<\/main>/gmi, '' );

	fs.writeFileSync( join( dir, 'index.html' ), html );

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
			for ( let token of tokenREs ) {
				v = v.replace( token, '<span class="hljs-custom">$&</span>' );
			}

			return v;

		}
	} );

}

function escapeRegExp( string ) {
	// $& means the whole matched string
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
