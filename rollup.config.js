import pkg from './package.json';
import livereload from 'rollup-plugin-livereload';
import serve from 'rollup-plugin-serve';
import { string } from 'rollup-plugin-string';

export default {
    input: 'src/GUI.js',
    output: [
        { file: pkg.module, format: 'es' }
    ],
    plugins: [
        string( {
            include: '**/*.css'
        } ),
        serve(),
        livereload()
    ]
};