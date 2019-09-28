import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';

const input = 'src/index.js';

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
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
		plugins: [ style() ]
	}, {
		input,
		output: Object.assign( { file: pkg.module.replace( '.js', '.min.js' ) }, output ),
		plugins: [
			style( true ),
			terser( {
				output: {
					comments: function( node, comment ) {
						return /lil-gui/i.test( comment.value );
					}
				}
			} )
		]
	}
];

function style( min = false ) {
	return {
		name: 'style',
		resolveId( source ) {
			if ( source === 'style' ) {
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
