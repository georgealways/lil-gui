import pkg from './package.json';
import { minify } from 'terser';

const input = 'src/index.js';

const banner = `/**
 * ${pkg.name}
 * @version ${pkg.version}
 * @author ${pkg.author.name}
 * @license ${pkg.license}
 */`;

const outputModule = {
	banner,
	format: 'es',
	preferConst: true
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
		plugins: [ stylesheet( true ), terser() ]
	},
	{
		input,
		output: { ...outputUMD, file: pkg.main },
		plugins: [ stylesheet(), strip() ]
	},
	{
		input,
		output: { ...outputUMD, file: pkg.main.replace( '.js', '.min.js' ) },
		plugins: [ stylesheet( true ), terser() ]
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
		/^\s*\/\*\* @module.*\n/gm,
		/^\s*\/[/*] eslint-.*\n/gm
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

function terser() {
	return {
		name: 'terser',
		renderChunk( code ) {
			const result = minify( code );
			if ( result.error ) throw result.error;
			if ( result.warnings ) {
				result.warnings.forEach( warning => {
					this.warn( warning );
				} );
			}
			return {
				code: result.code,
				map: result.map
			};

		}
	};
}
