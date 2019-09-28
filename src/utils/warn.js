import config from '../config';

export default function warn() {
	if ( !config.warn ) return;
	// eslint-disable-next-line no-console
	return console.warn.apply( console, arguments );
}
