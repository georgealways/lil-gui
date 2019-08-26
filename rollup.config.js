import pkg from './package.json';
import { string } from 'rollup-plugin-string';

export default {
	input: 'src/main.js',
	output: [
		{ file: pkg.module, format: 'es' }
		// { file: '../three.js/examples/jsm/libs/lil-gui.module.js', format: 'es' }
	],
	plugins: [
		string( {
			include: '**/*.css'
		} )
	]
};