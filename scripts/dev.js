import concurrently from 'concurrently';
import pkg from '../package.json';

dev( {
	'api': {
		onchange: [
			'src/**/*.js',
			'scripts/api*'
		],
		color: 'green'
	},
	'homepage': {
		onchange: [
			'scripts/homepage.js',
			'homepage/homepage.hbs.html',
			'package.json',
			'*.md'
		],
		color: 'white'
	},
	'icons': {
		onchange: [
			'style/icons/*.svg',
			'scripts/icons.js'
		],
		color: 'blue'
	},
	'test': {
		onchange: [
			pkg.module,
			'tests/**/*.js'
		],
		flag: '--soft-fail',
		color: 'yellow'
	},
	'postcss': {
		onchange: [
			pkg.config.style
		],
		color: 'magenta'
	},
	'sass': 	{ flag: '--watch', color: 'magenta' },
	'rollup': 	{ flag: '-w', color: 'cyan' },
	'server': 	{ color: 'gray' }
} );

function dev( config ) {

	const commands = [];

	const longest = getLongest( Object.keys( config ) );

	for ( let name in config ) {

		const { onchange, flag, color } = config[ name ];

		let command;

		if ( onchange ) {
			const files = onchange.map( w => `'${w}'` ).join( ' ' );
			command = `./node_modules/.bin/onchange ${files} -- npm run ${name}`;
		} else {
			command = `npm run ${name}`;
		}

		if ( flag ) {
			command += ' -- ' + flag;
		}

		name = name.padStart( longest, '·' );

		commands.push( {
			command,
			name,
			prefixColor: `${color}.inverse`
		} );

	}

	concurrently( commands, { prefix: '{name}' } ).catch( error => {
		console.log( error );
	} );

}

function getLongest( arr ) {
	return arr.reduce( ( a, b ) => a.length > b.length ? a : b ).length;
}
