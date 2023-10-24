import { GUI } from '../dist/lil-gui.esm.js';
import './guide-examples.js';

// Basic demo
// ---------------------------------------------------------------------
{
	const myObject = {
		options: 10,
		boolean: true,
		string: 'lil-gui',
		number: 0.5,
		color: '#a0f',
		function() { alert( 'hi' ); }
	};

	const gui = new GUI();

	gui.add( myObject, 'options', { Small: 1, Medium: 10, Large: 100 } );
	gui.add( myObject, 'boolean' );
	gui.add( myObject, 'string' );
	gui.add( myObject, 'number', 0, 1 );
	gui.addColor( myObject, 'color' );
	gui.add( myObject, 'function' );
}

// Hide GUI after scroll thresh
// ---------------------------------------------------------------------
{
	const THRESH = 40;

	const onScroll = () => {
		document.body.classList.toggle( 'scrolled', window.scrollY > THRESH );
	};

	document.addEventListener( 'scroll', onScroll );
	onScroll();

	// Delay transition class so we don't see a fadeout flash on load
	requestAnimationFrame( () => document.body.classList.add( 'loaded' ) );
}

// TOC open / close
// ---------------------------------------------------------------------
{
	const toc = document.getElementById( 'toc' );
	const tocButton = document.getElementById( 'toc-button' );

	const closeTOC = () => document.body.classList.remove( 'toc-open' );
	document.body.addEventListener( 'click', closeTOC );

	toc.addEventListener( 'click', e => e.stopPropagation() );

	tocButton.addEventListener( 'click', e => {
		e.stopPropagation();
		document.body.classList.toggle( 'toc-open' );
	} );

	Array.from( document.querySelectorAll( 'nav a' ) ).forEach( a => {
		a.addEventListener( 'click', closeTOC );
	} );
}

// TOC position indicator
// ---------------------------------------------------------------------
{

	// pixel offset below scroll position to define highlighted section
	const SCROLL_OFFSET = 100;

	// Find all TOC links that point to an anchor
	const tocAnchorLinks = Array.from( document.querySelectorAll( '#toc a[href^="#"]' ) );

	const anchorPositions = [];

	let activeLink;

	const updateAnchorPositions = () => {

		anchorPositions.length = 0;

		tocAnchorLinks.forEach( link => {
			const name = link.getAttribute( 'href' ).substring( 1 );
			const anchor = document.querySelector( `a[name="${name}"]` );
			if ( anchor ) {
				anchorPositions.push( {
					link,
					name,
					top: getTop( anchor )
				} );
			}
		} );

		// Sort by position on page descending
		anchorPositions.sort( ( a, b ) => b.top - a.top );

	};

	const onScroll = () => {

		const scrollTop = getScrollTop() + SCROLL_OFFSET;

		for ( let i = 0; i < anchorPositions.length; i++ ) {
			const ap = anchorPositions[ i ];
			if ( scrollTop > ap.top ) {
				setActive( ap.link );
				break;
			}
		}

	};

	const setActive = link => {
		if ( activeLink ) activeLink.classList.remove( 'active' );
		activeLink = link.parentElement;
		activeLink.classList.add( 'active' );
		activeLink.scrollIntoView( { block: 'nearest' } );
	};

	const getTop = elem => {
		const box = elem.getBoundingClientRect();
		const top = box.top + getScrollTop();
		return Math.round( top );
	};

	const getScrollTop = () => {
		const docEl = document.documentElement;
		const body = document.body;
		const clientTop = docEl.clientTop || body.clientTop || 0;
		const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		return scrollTop - clientTop;
	};

	const debounce = ( func, millis ) => {
		let timeout;
		return () => {
			clearTimeout( timeout );
			timeout = setTimeout( func, millis );
		};
	};

	document.addEventListener( 'scroll', onScroll );
	window.addEventListener( 'resize', debounce( updateAnchorPositions ) );

	requestAnimationFrame( () => {
		updateAnchorPositions();
		onScroll();
	} );

}
