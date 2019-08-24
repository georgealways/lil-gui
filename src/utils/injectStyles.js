export default function injectStyles( cssContent, fallbackURL ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const head = document.querySelector( 'head' );
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		head.insertBefore( injected, before );
	} else {
		head.appendChild( injected );
	}
}