export default function( cssContent ) {
	const injected = document.createElement( 'style' );
	injected.innerHTML = cssContent;
	const before = document.querySelector( 'head link[rel=stylesheet], head style' );
	if ( before ) {
		document.head.insertBefore( injected, before );
	} else {
		document.head.appendChild( injected );
	}
}
