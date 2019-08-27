import concurrently from 'concurrently';
import pkg from '../package.json';

watch( {
	api: [
		'src/**/*.js',
		'scripts/api.hbs',
		'scripts/api.js'
	],
	docs: [
		'scripts/docs*',
		'API.md',
		'README.md'
	],
	icons: [
		'style/icons/*.svg',
		'scripts/icons.js'
	],
	test: {
		watch: [
			pkg.module,
			'scripts/test*'
		],
		flag: '--soft-fail'
	},
	sass: '--watch',
	rollup: '-w',
	server: 'live-server --watch=build,docs --no-browser'
} );

function watch( config ) {

	const commands = [];

	let i = 0;
	const colors = [
		'green',
		'white',
		'blue',
		'yellow',
		'magenta',
		'cyan',
		'black'
	];

	for ( let name in config ) {

		const arg = config[ name ];

		let command, flag, watch;

		if ( name in pkg.scripts ) {

			if ( typeof arg == 'string' ) {

				command = `npm run ${name} -- ${arg}`;

			} else if ( Array.isArray( arg ) ) {

				watch = arg;

			} else if ( Object( arg ) === arg ) {

				watch = arg.watch;
				flag = arg.flag;

			}

			if ( watch ) {
				const files = watch.map( w => `'${w}'` ).join( ' ' );
				command = `./node_modules/.bin/onchange ${files} -- npm run ${name}`;
				if ( flag ) {
					command += ' -- ' + flag;
				}
			}

		} else {
			command = './node_modules/.bin/' + arg;
		}

		commands.push( { command, name, prefixColor: colors[ i++ ] } );

	}

	concurrently( commands ).catch( error => {
		console.log( error );
	} );

}