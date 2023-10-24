import { GUI } from '../dist/lil-gui.esm.js';

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

	const loadButton = gui.add( obj, 'loadPreset' ).disable();

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
