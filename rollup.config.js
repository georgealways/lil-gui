import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const input = 'src/index.js';

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * Released under the MIT License.
 */\n`;

const output = {
	banner,
	format: 'es',
	preferConst: true
};

export default [
	{
		input,
		output: { ...output, file: pkg.module },
		plugins: [ stylesheet() ]
	},
	{
		input,
		output: { ...output, file: '../lil-gui-threejs/examples/jsm/libs/lil-gui.module.js' },
		plugins: [ stylesheet() ]
	},
	{
		input,
		output: { ...output, file: pkg.module.replace( '.js', '.min.js' ) },
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
