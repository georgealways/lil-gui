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
		output: Object.assign( { file: pkg.module }, output ),
		plugins: [ stylesheet() ]
	},
	{
		input,
		output: Object.assign( { file: '../lil-gui-threejs/examples/jsm/libs/lil-gui.module.js' }, output ),
		plugins: [ stylesheet() ]
	},
	{
		input,
		output: Object.assign( { file: pkg.module.replace( '.js', '.min.js' ) }, output ),
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
	return {
		name: 'stylesheet',
		resolveId( source ) {
			if ( source === 'stylesheet' ) {
				return min ? pkg.config.styleMin : pkg.config.style;
			}
			return null;
		},
		transform( content, id ) {
			if ( !id.endsWith( '.css' ) ) return;
			return {
				code: `export default \`${content.trim()}\`;`,
				map: { mappings: '' }
			};
		}
	};
}
