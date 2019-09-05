import pkg from './package.json';
import { string } from 'rollup-plugin-string';

const banner = `// ${pkg.name}@${pkg.version}`;

export default {
	input: 'src/main.js',
	output: [
		{ file: pkg.module, format: 'es', banner },
		{ file: '../three.js/examples/jsm/libs/lil-gui.module.js', format: 'es', banner }
	],
	plugins: [
		string( {
			include: '**/*.css'
		} )
	]
};
