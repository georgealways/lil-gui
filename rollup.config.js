import pkg from './package.json';

import { createFilter } from 'rollup-pluginutils';

function string( opts = {} ) {

	if ( !opts.include ) {
		throw Error( 'include option should be specified' );
	}

	const filter = createFilter( opts.include, opts.exclude );

	return {
		name: 'string',
		transform( content, id ) {
			if ( filter( id ) ) {
				return {
					code: `export default \`${content}\`;`,
					map: { mappings: '' }
				};
			}
		}
	};
}

const banner = `/**
 * ${pkg.name} ${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the MIT License.
 */\n`;

export default {
	input: 'src/index.js',
	output: [
		{ file: pkg.module, format: 'es', banner },
		{ file: '../lil-gui-threejs/examples/jsm/libs/lil-gui.module.js', format: 'es', banner }
	],
	plugins: [
		string( {
			include: '**/*.css'
		} )
	]
};
