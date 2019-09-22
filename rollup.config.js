import pkg from './package.json';
import { string } from 'rollup-plugin-string';

const banner = `// ${pkg.name}@${pkg.version}`;

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
