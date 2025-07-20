import base from 'eslint-config-gmb';
import jsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';

export default [

	...base,

	{ ignores: [ 'dist' ] },

	// custom
	{
		rules: {
			'no-param-reassign': 'off',
			'import/order': 'off',
			'@gmb/comma-dangle-single': 'off',
		}
	},

	// jsdoc
	{
		files: [ 'src/**/*.js' ],
		plugins: { jsdoc },
		rules: {
			'jsdoc/require-description-complete-sentence': 'warn',
			'jsdoc/require-description': 'warn',
			// forbid newlines after description
			'jsdoc/tag-lines': [ 'warn', 'any', {
				tags: {
					description: {
						lines: 'never'
					}
				}
			} ],
		}
	},

	// node
	{
		files: [ 'rollup.config.js', 'scripts/**/*.js', 'tests/**/*.js' ],
		languageOptions: {
			ecmaVersion: 2022,
			globals: { ...globals.node },
		}
	},

	// no-console
	{
		files: [ 'src/**/*.js', 'tests/*.test.js' ],
		rules: { 'no-console': 'warn' },
	}

];
