import jsdocAPI from 'jsdoc-api';
import hbs from 'handlebars';
import fs from 'fs';

const OUTPUT = 'API.md';
const TEMPLATE = 'scripts/api.hbs';

const JSDOC_INPUT = [
	'src/GUI.js',
	'src/Controller.js',
	'src/BooleanController.js',
	'src/ColorController.js',
	'src/FunctionController.js',
	'src/NumberController.js',
	'src/OptionController.js',
	'src/StringController.js',
	'src/Header.js'
];

// url prefix for view source links, needs trailing slash
const REPO = 'https://github.com/georgealways/gui/blob/master/';

// sort by kind as opposed to the order of definition
const KIND_SORT = [ 'class', 'function', 'member' ];

// put members that start with special chars at the end
const ALPHABET_SORT = 'abcdefghijklmnopqrstuvwxyz$_'.split( '' );

// explicit index order, anything not in here goes to the end
const TOP_LEVEL_SORT = [ 'GUI', 'Controller' ];

// begin script!

// jsdoc data is decorated with indexname, signature, viewsource link etc.
// then collected here
const transformed = [];

// classes are collected as top level entries for the index
// then stored in this map by longname
const topLevel = {};

jsdocAPI.explainSync( { files: JSDOC_INPUT } )
	.filter( v => v.undocumented !== true )
	.filter( v => v.kind !== 'package' )
	.filter( v => v.kind !== 'module' )
	.forEach( v => {

		forEachRecursive( v, ( object, key, value ) => {

			if ( typeof value == 'string' ) {

				// replace local directories with path to github
				value = value.replace( process.cwd(), REPO.substr( 0, REPO.length - 1 ) );

				// jsdoc gets a little too excited about modules
				value = value.replace( /^module:/, '' );

			}

			object[ key ] = value;

		} );

		v.indexname = v.name;

		if ( v.kind === 'function' && v.scope === 'instance' ) {

			v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;
			v.signature += paramsToSignature( v.params );

			v.indexname = `**${v.indexname}**`;

			// functions with no required params get an empty signature in index
			v.indexname += v.params.filter( v => !v.optional ).length ? '(…)' : '()';

			if ( v.returns !== undefined ) {
				v.indextype = '→ ' + v.returns[ 0 ].type.names[ 0 ];
			}

			if ( v.tags !== undefined && v.tags.find( v => v.title === 'chainable' ) ) {
				v.indextype = '→ self';
			}

		} else if ( v.kind === 'class' ) {

			if ( v.params !== undefined ) {
				v.signature = `**new** ${v.name}` + paramsToSignature( v.params );
			} else {
				// class is documented, but the constructor isn't, eg. Controller
				v.signature = `**${v.name}**`;
			}

			// sometimes get classdesc instead of regular desc for classes
			v.description = v.description || v.classdesc;

			// store classes for index
			topLevel[ v.longname ] = v;

		} else if ( v.kind === 'member' && v.scope === 'instance' ) {

			v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;

			v.indextype = ': `' + v.type.names.join( '|' ) + '`';

		}

		// view source url
		const joined = v.meta.path + '/' + v.meta.filename;
		v.viewsource = `${joined}#L${v.meta.lineno}`;
		v.definedat = joined.replace( REPO, '' ) + ':' + v.meta.lineno;
		transformed.push( v );

	} );

// associate transformed children with their memberof types
transformed.forEach( v => {

	if ( v.memberof && v.memberof in topLevel ) {

		const parent = topLevel[ v.memberof ];

		if ( !parent.children ) {
			parent.children = [];
		}

		parent.children.push( v );

	}

} );

// done processing, get an array for handlebars
const jsdoc = Object.values( topLevel );

// sort topLevel by explicit order
jsdoc.sort( ( a, b ) => {
	return customComparison( TOP_LEVEL_SORT, a.name, b.name );
} );

// sort children by kind, then alphabetically with special chars at the end
jsdoc.forEach( t => {
	t.children.sort( childSort );
} );

const output = hbs.compile( fs.readFileSync( TEMPLATE ).toString() )
	.call( undefined, { jsdoc } )
	.replace( /\n{2,}/g, '\n\n' ); // clean up extra whitespace

// bounce to mp3
fs.writeFileSync( OUTPUT, output );

function childSort( a, b ) {

	const kindComparison = customComparison( KIND_SORT, a.kind, b.kind );
	if ( kindComparison !== 0 ) return kindComparison;

	const alphabetComparison = customComparison( ALPHABET_SORT, a.name[ 0 ], b.name[ 0 ] );

	if ( alphabetComparison !== 0 ) return alphabetComparison;

	return a.name.localeCompare( b.name );

}

function forEachRecursive( object, callback ) {
	for ( let key in object ) {
		const value = object[ key ];
		if ( Object( value ) === value ) {
			forEachRecursive( value, callback );
		} else {
			callback( object, key, value );
		}
	}
}

function customComparison( ordering, a, b ) {
	let ai = ordering.indexOf( a );
	let bi = ordering.indexOf( b );
	if ( ai === -1 ) ai = Infinity;
	if ( bi === -1 ) bi = Infinity;
	return ai - bi;
}

function paramsToSignature( params ) {

	if ( params.length === 0 ) {
		return '()';
	}

	const paramList = params
		.filter( p => p.name.indexOf( '.' ) === -1 ) // eg options.autoPlace
		.map( singleParamToSignature )
		.join( ', ' );

	return `( ${paramList} )`;

}

function singleParamToSignature( param ) {
	return param.optional ? `[${param.name}]` : param.name;
}