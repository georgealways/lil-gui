import { GUI } from '../dist/lil-gui.esm.js';

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
	let hidden = false;

	const onScroll = () => {
		const passed = window.scrollY > THRESH;
		if ( passed && !hidden ) {
			document.body.classList.add( 'scrolled' );
		} else if ( !passed && hidden ) {
			document.body.classList.remove( 'scrolled' );
		}
		hidden = passed;
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
	document.body.addEventListener( 'click', closeTOC );
	toc.addEventListener( 'click', e => {
		e.stopPropagation();
	} );

	function openTOC() {
		document.body.classList.add( 'toc-open' );
	}

	function closeTOC() {
		document.body.classList.remove( 'toc-open' );
	}

	tocButton.addEventListener( 'click', e => {
		e.stopPropagation();
		document.body.classList.contains( 'toc-open' ) ? closeTOC() : openTOC();
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

	function updateAnchorPositions() {

		anchorPositions.length = 0;

		tocAnchorLinks.forEach( link => {
			const name = link.getAttribute( 'href' ).substr( 1 );
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

	}

	function onScroll() {

		const scrollTop = getScrollTop() + SCROLL_OFFSET;

		for ( let i = 0; i < anchorPositions.length; i++ ) {
			const ap = anchorPositions[ i ];
			if ( scrollTop > ap.top ) {
				setActive( ap.link );
				break;
			}
		}

	}

	function setActive( link ) {
		if ( activeLink ) activeLink.classList.remove( 'active' );
		activeLink = link.parentElement;
		activeLink.classList.add( 'active' );
		activeLink.scrollIntoView( { block: 'nearest' } );
	}

	document.addEventListener( 'scroll', onScroll );
	window.addEventListener( 'resize', debounce( updateAnchorPositions ) );

	requestAnimationFrame( () => {
		updateAnchorPositions();
		onScroll();
	} );

	function getTop( elem ) {
		const box = elem.getBoundingClientRect();
		const top = box.top + getScrollTop();
		return Math.round( top );
	}

	function getScrollTop() {
		const docEl = document.documentElement;
		const body = document.body;
		const clientTop = docEl.clientTop || body.clientTop || 0;
		const scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
		return scrollTop - clientTop;
	}

	function debounce( func, millis ) {
		let timeout;
		return () => {
			clearTimeout( timeout );
			timeout = setTimeout( func, millis );
		};
	}

}

// Guide examples
// ---------------------------------------------------------------------

example( 5, gui => {
	gui.add( document, 'title' );
} );

example( 6, ( gui, code ) => {

	const myObject = {
		myBoolean: true,
		myString: 'lil-gui',
		myNumber: 1,
		myFunction: function() { alert( 'hi' ); }
	};

	gui.add( myObject, 'myBoolean' ).onChange( replacer( code, /myBoolean:\s*$/ ) );
	gui.add( myObject, 'myString' ).onChange( replacer( code, /myString:\s*$/, stringify ) );
	gui.add( myObject, 'myNumber' ).onChange( replacer( code, /myNumber:\s*$/ ) );
	gui.add( myObject, 'myFunction' );

} );

example( 7, ( gui, code ) => {

	const myObject = {
		hasMin: 1,
		hasMax: 99,
		hasStep: 50
	};

	gui.add( myObject, 'hasMin' ).min( 0 ).onChange( replacer( code, /hasMin:\s*$/ ) );
	gui.add( myObject, 'hasMax' ).max( 100 ).onChange( replacer( code, /hasMax:\s*$/ ) );
	gui.add( myObject, 'hasStep' ).step( 10 ).onChange( replacer( code, /hasStep:\s*$/ ) );

} );

example( 8, ( gui, code ) => {

	const myObject = {
		number1: 1,
		number2: 50
	};

	gui.add( myObject, 'number1', 0, 1 ).onChange( replacer( code, /number1:\s*$/ ) );
	gui.add( myObject, 'number2', 0, 100, 10 ).onChange( replacer( code, /number2:\s*$/ ) );

} );

example( 9, ( gui, code ) => {

	const myObject = {
		size: 'Medium',
		speed: 1
	};

	gui.add( myObject, 'size', [ 'Small', 'Medium', 'Large' ] ).onChange( replacer( code, /size:\s*$/, stringify ) );
	gui.add( myObject, 'speed', { Slow: 0.1, Normal: 1, Fast: 5 } ).onChange( replacer( code, /speed:\s*$/ ) );

} );

example( 10, ( gui, code ) => {

	const params = {
		color1: '#AA00FF',
		color2: '#a0f',
		color3: 'rgb(170, 0, 255)',
		color4: 0xaa00ff
	};

	gui.addColor( params, 'color1' ).onChange( replacer( code, /color1:\s*$/, stringify ) );
	gui.addColor( params, 'color2' ).onChange( replacer( code, /color2:\s*$/, stringify ) );
	gui.addColor( params, 'color3' ).onChange( replacer( code, /color3:\s*$/, stringify ) );
	gui.addColor( params, 'color4' ).onChange( replacer( code, /color4:\s*$/ ) );

} );

example( 11, ( gui, code ) => {

	const params = {
		colorObject: { r: 0.667, g: 0, b: 1 },
		colorArray: [ 0.667, 0, 1 ]
	};

	gui.addColor( params, 'colorObject' )
		.onChange( v => {
			replaceTextAfter( code, /r:\s*$/, v.r );
			replaceTextAfter( code, /g:\s*$/, v.g );
			replaceTextAfter( code, /b:\s*$/, v.b );
		} );

	gui.addColor( params, 'colorArray' )
		.onChange( v => {
			replaceTextAfter( code, /\[\s*$/, v[ 0 ] );
			replaceTextAfter( code, /\[\s*\d+\.?\d*\s*,\s*$/, v[ 1 ] );
			replaceTextAfter( code, /\[\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*,\s*$/, v[ 2 ] );
		} );

} );

example( 12, ( gui, code ) => {

	const params = {
		colorObject: { r: 170, g: 0, b: 255 },
		colorArray: [ 170, 0, 255 ]
	};

	gui.addColor( params, 'colorObject', 255 )
		.onChange( v => {
			replaceTextAfter( code, /r:\s*$/, v.r );
			replaceTextAfter( code, /g:\s*$/, v.g );
			replaceTextAfter( code, /b:\s*$/, v.b );
		} );

	gui.addColor( params, 'colorArray', 255 )
		.onChange( v => {
			replaceTextAfter( code, /\[\s*$/, v[ 0 ] );
			replaceTextAfter( code, /\[\s*\d+\.?\d*\s*,\s*$/, v[ 1 ] );
			replaceTextAfter( code, /\[\s*\d+\.?\d*\s*,\s*\d+\.?\d*\s*,\s*/, v[ 2 ] );
		} );

} );

example( 13, gui => {

	const params = {
		scale: 1,
		position: { x: 0, y: 0, z: 0 }
	};

	gui.add( params, 'scale', 0, 1 );

	const folder = gui.addFolder( 'Position' );

	folder.add( params.position, 'x' );
	folder.add( params.position, 'y' );
	folder.add( params.position, 'z' );

} );

example( 17, gui => {

	const params = { feedback: 0 };

	gui.add( params, 'feedback', -1, 1 ).listen();

	const animate = () => {
		params.feedback = Math.sin( Date.now() / 1000 );
		requestAnimationFrame( animate );
	};

	animate();

} );

example( 18, gui => {

	let saved = {};

	const obj = {
		value1: 'original',
		value2: 1996,
		savePreset() {
			saved = gui.save();
			loadButton.enable();
		},
		loadPreset() {
			gui.load( saved );
		}
	};

	gui.add( obj, 'value1' );
	gui.add( obj, 'value2' );

	gui.add( obj, 'savePreset' );

	const loadButton =
        gui.add( obj, 'loadPreset' ).disable();

} );

/** @param {function(GUI,HTMLElement)} callback */
function example( n, callback ) {

	const pre = document.querySelector( `#section-guide > pre:nth-of-type(${n})` );
	const code = pre.querySelector( 'code' );

	const container = document.createElement( 'div' );
	container.classList.add( 'result' );
	pre.parentElement.insertBefore( container, pre.nextElementSibling );

	const gui = new GUI( { container } );
	callback( gui, code );

}

function stringify( v ) {
	return `'${v.replace( /\\/g, '\\\\' ).replace( /'/g, '\\\'' )}'`;
}

function findChildAfter( element, re ) {
	let str = '';
	for ( let i = 0; i < element.childNodes.length; i++ ) {
		const node = element.childNodes.item( i );
		if ( node instanceof Text ) {
			str += node.nodeValue;
		} else {
			if ( re.test( str ) ) {
				return node;
			}
			str += node.innerText;
		}
	}
	console.error( "Couldn't find element after " + re );
}

function replaceContents( element, text ) {
	element.innerHTML = text;
	element.classList.add( 'changed' );
	clearTimeout( element.timeout );
	element.timeout = setTimeout( () => {
		element.classList.remove( 'changed' );
	}, 30 );
}

function replacer( element, re, transform = v => v ) {
	const target = findChildAfter( element, re );
	return function( newValue ) {
		replaceContents( target, transform( newValue ) );
	};
}

function replaceTextAfter( element, re, text ) {
	replaceContents( findChildAfter( element, re ), text );
}
