import terser from '@rollup/plugin-terser';
import pkg from './scripts/package.js';

const input = 'src/index.js';

const banner = `/**
 * ${pkg.name}
 * ${pkg.homepage}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const outputModule = {
	banner,
	format: 'es'
};

const outputUMD = {
	banner,
	format: 'umd',
	name: 'lil',
	exports: 'named'
};

export default [
	{
		input,
		output: { ...outputModule, file: pkg.module },
		plugins: [ stylesheet(), strip() ]
	},
	{
		input,
		output: { ...outputModule, file: pkg.module.replace( '.js', '.min.js' ) },
		plugins: [ stylesheet( true ), terser( { module: true } ) ]
	},
	{
		input,
		output: { ...outputUMD, file: pkg.main },
		plugins: [ stylesheet(), strip() ]
	},
	{
		input,
		output: { ...outputUMD, file: pkg.main.replace( '.js', '.min.js' ) },
		plugins: [ stylesheet( true ), terser( { module: false } ) ]
	}
];

function stylesheet( min = false ) {
	const path = min ? pkg.config.styleMin : pkg.config.style;
	return {
		name: 'stylesheet',
		resolveId( source ) {
			return source === 'stylesheet' ? path : null;
		},
		transform( content, id ) {
			if ( id !== path ) return;
			return {
				code: `export default \`${content.trim()}\`;`,
				map: { mappings: '' }
			};
		}
	};
}

function strip() {
	const regexps = [
		/^\n?\t*\/\*\* @module.*\n/gm,
		/^\n?\t*\/\* eslint-.*\n/gm,
		/^\t*\/\/ eslint-.*\n/gm
	];
	return {
		name: 'strip',
		renderChunk( code ) {
			regexps.forEach( re => {
				code = code.replace( re, '' );
			} );
			return {
				code,
				map: { mappings: '' }
			};
		}
	};
}
