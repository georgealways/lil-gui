export function injectStyles( cssContent, fallbackURL ) {
	const injected = document.createElement( 'style' );
	injected.type = 'text/css';
	injected.innerHTML = cssContent;
	const head = document.getElementsByTagName( 'head' )[ 0 ];
	try {
		head.appendChild( injected );
	} catch ( e ) {
		// eslint-disable-next-line no-console
		console.warn( `Failed to inject styles. Manually include the stylesheet at ${fallbackURL}` );
	}
}