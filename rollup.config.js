import pkg from './package.json';
import { string } from 'rollup-plugin-string';

console.log( pkg.version );

const banner = `/**
 * ${pkg.name} v${pkg.version}
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
