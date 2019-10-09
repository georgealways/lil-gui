import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const input = 'src/index.js';

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * Released under the MIT License.
 */\n`;

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
		plugins: [ stylesheet() ]
	},
	{
		input,
		output: { ...outputModule, file: pkg.module.replace( '.js', '.min.js' ) },
		plugins: [
			stylesheet( true ),
			terser( {
				output: {
					comments( node, comment ) {
						return /lil-gui/i.test( comment.value );
					}
				}
			} )
		]
	},
	{
		input,
		output: { ...outputUMD, file: pkg.main },
		plugins: [ stylesheet() ]
	}
];

function stylesheet( min = false ) {
	const path = min ? pkg.config.styleMin : pkg.config.style;
	return {
		name: 'stylesheet',
		resolveId( source ) {
			if ( source === 'stylesheet' ) {
				return path;
			}
			return null;
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
