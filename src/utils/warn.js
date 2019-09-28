export default function warn() {
	if ( warn.disabled ) return;
	// eslint-disable-next-line no-console
	return console.warn.apply( console, arguments );
}
