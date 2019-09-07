import jsdoc from 'jsdoc-api';
import hbs from 'handlebars';
import fs from 'fs';

const TEMPLATE = 'scripts/api.hbs';
const OUTPUT = 'API.md';
const JSDOC_INPUT = 'src/**/*.js';

const WRITE = !!process.argv.slice( 2 ).find( v => v === '--write' );

// url prefix for view source links, needs trailing slash
const REPO = 'https://github.com/georgealways/gui/blob/master/';

// sort by kind as opposed to the order of definition
const KIND_SORT = [ 'class', 'typedef', 'function', 'member' ];

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

jsdoc.explainSync( { files: JSDOC_INPUT } )
	.filter( v => v.undocumented !== true )
	.filter( v => v.kind !== 'package' )
	.filter( v => v.kind !== 'module' )
	.forEach( transform );

function transform( v ) {

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

	if ( v.kind === 'typedef' ) {

		v.signature = v.name;

	} else if ( v.kind === 'function' && v.scope === 'instance' ) {

		v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;

		v.indexname = `**${v.indexname}**`;

		if ( v.params ) {
			v.indexname += '()';
			v.signature += paramsToSignature( v.params );
		}

		if ( v.returns !== undefined ) {
			const type = v.returns[ 0 ].type.names[ 0 ];
			if ( type === v.memberof && v.returns[ 0 ].description === 'self' ) {
				v.indextype = '→ self'; // "chainable"
			} else {
				v.indextype = '→ ' + type;
			}
		}

	} else if ( v.kind === 'class' ) {

		if ( v.params !== undefined ) {
			v.signature = `new **${v.name}**` + paramsToSignature( v.params );

			v.indexname = `**new ${v.name}**`;
			v.indexname += '()';

			// collect it
			v.memberof = v.longname;
		}

		// sometimes get classdesc instead of regular desc for classes
		v.description = v.description || v.classdesc;

		v.children = [];

		topLevel[ v.longname ] = v;

	} else if ( v.kind === 'member' && v.scope === 'instance' ) {

		v.signature = `${v.memberof.toLowerCase()}.**${v.name}**`;

		if ( v.type ) {
			v.indextype = ': ' + v.type.names.join( '|' );
		}

	}

	// view source url
	const joined = v.meta.path + '/' + v.meta.filename;
	v.viewsource = `${joined}#L${v.meta.lineno}`;
	v.definedat = joined.replace( REPO, '' ) + ':' + v.meta.lineno;

	// clogging up my debug
	delete v.comment;
	delete v.meta;

	transformed.push( v );

}

// associate transformed children with their memberof types
transformed.forEach( v => {

	if ( v.memberof && v.memberof in topLevel ) {

		const parent = topLevel[ v.memberof ];

		if ( v.children ) {
			// prevent circular structure in json
			v = JSON.parse( JSON.stringify( v ) );
			delete v.children;
		}

		parent.children.push( v );

	}

} );

// done processing, get an array for handlebars
const jsdocData = Object.values( topLevel );

// sort topLevel by explicit order
jsdocData.sort( ( a, b ) => {
	return customComparison( TOP_LEVEL_SORT, a.name, b.name );
} );

// sort children by kind, then alphabetically with special chars at the end
jsdocData.forEach( t => {
	t.children.sort( childSort );
} );

const output = hbs.compile( fs.readFileSync( TEMPLATE ).toString() )
	.call( undefined, { jsdocData } )
	.replace( /\n{2,}/g, '\n\n' ); // clean up extra whitespace

// bounce to mp3
if ( WRITE ) {
	fs.writeFileSync( OUTPUT, output );
}

// or tell docs.js what's up
export default jsdocData;

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
		.map( singleParamToSignature )
		.join( ', ' );

	return `( ${paramList} )`;

}

function singleParamToSignature( param ) {

	let name = param.name;

	if ( param.defaultvalue !== undefined ) {
		name += '=' + param.defaultvalue;
	} else if ( param.optional ) {
		name += '?';
	}

	if ( param.defaultvalue === undefined &&
		param.type &&
		param.type.names[ 0 ] !== '*' &&
		param.type.names[ 0 ] !== 'any' ) {
		name += ' : ' + param.type.names[ 0 ];
	}

	return name;

}
