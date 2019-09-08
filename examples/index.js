/* eslint-disable no-console */
import { GUI } from '../build/lil-gui.module.js';

const pre = location.origin + location.pathname;

Array.from( document.querySelectorAll( 'a[href]' ) )
	.filter( a => a.getAttribute( 'href' ).startsWith( pre ) )
	.forEach( a => a.setAttribute( 'href', a.getAttribute( 'href' ).replace( pre, '' ) ) );

class App {

	constructor() {
		this.demos = {};
	}

	init() {

		this.defaultDemo = Object.keys( this.demos )[ 0 ];

		const demo = decodeURIComponent( location.hash.substring( 1 ) );
		if ( demo && ( demo in this.demos ) ) {
			this.demo = demo;
		} else {
			this.demo = this.defaultDemo;
		}

		const snippets = document.getElementById( 'snippets' );

		snippets.querySelectorAll( 'code.language-css' ).forEach( c => {
			new CSSToggle( c );
		} );

		snippets.querySelectorAll( 'code.language-js' ).forEach( c => {
			new ClassToggle( c );
		} );

	}

	set demo( name ) {

		this._demo = name;

		const hash = name === this.defaultDemo ? '' : '#' + name;

		history.replaceState( undefined, undefined, location.search + hash );

		if ( this.gui ) {
			this.gui.children.filter( c => c !== this.demoController ).forEach( c => c.destroy() );
		} else {
			this.gui = new GUI();
			if ( location.search !== '?open' ) {
				this.gui.close();
			}
			this.demoController = this.gui.add( this, 'demo', Object.keys( this.demos ) );
		}

		this.demos[ name ]( this.gui );

	}

	get demo() {
		return this._demo;
	}

}

class CSSToggle {

	constructor( code ) {

		this.domElement = document.createElement( 'div' );

		this.$code = code;
		this.$pre = code.parentElement;

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );
		this.$input.addEventListener( 'change', () => {
			this.enabled = this.$input.checked;
		} );

		this.$pre.parentElement.insertBefore( this.domElement, this.$pre );

		this.domElement.appendChild( this.$pre );
		this.domElement.appendChild( this.$input );

	}

	set enabled( v ) {
		this.domElement.classList.toggle( 'enabled', v );
		if ( this.$style ) {
			document.head.removeChild( this.$style );
			delete this.$style;
		}
		if ( v ) {
			this.$style = document.createElement( 'style' );
			this.$style.innerHTML = this.$code.innerText;
			document.head.appendChild( this.$style );
		}
	}
}

class ClassToggle {
	constructor( code ) {

		this.domElement = document.createElement( 'div' );

		this.$code = code;
		this.$pre = code.parentElement;

		this.className = this.$code.innerText.match( /'(.*)'/ )[ 1 ];

		this.$input = document.createElement( 'input' );
		this.$input.setAttribute( 'type', 'checkbox' );
		this.$input.addEventListener( 'change', () => {
			app.gui.domElement.classList.toggle( this.className, this.$input.checked );
		} );

		this.$pre.parentElement.insertBefore( this.domElement, this.$pre );

		this.domElement.appendChild( this.$pre );
		this.domElement.appendChild( this.$input );

	}

}

const app = new App();

app.demos[ 'Basic' ] = function( gui ) {

	gui.add( { number: 0.5 }, 'number', 0, 1 );
	gui.addColor( { color: 0x6C44BE }, 'color' );
	gui.add( { string: 'message' }, 'string' );
	gui.add( { boolean: true }, 'boolean' );
	gui.add( { button() { alert( 'sup' ); } }, 'button' );

	const folder1 = gui.addFolder( 'Folder' );

	const addFiller = g => {
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
	};

	addFiller( folder1 );

	const folder2 = gui.addFolder( 'Closed Folder' ).close();

	addFiller( folder2 );

	gui.addFolder( 'Empty Folder' );

	const folder3 = gui.addFolder( 'Nested Folders' );

	addFiller( folder3 );

	const folder4 = folder3.addFolder( 'Don\'t go crazy now.' );

	addFiller( folder4 );
	folder4.addFolder( 'Nested "header"', false );
	addFiller( folder4 );

};

app.demos[ 'Hall of Sliders' ] = function( gui ) {

	gui.addFolder( 'Implicit step', false );

	const implicitStep = ( min, max ) => {
		gui.add( { x: max }, 'x', min, max ).name( `[${min},${max}]` );
	};

	implicitStep( 0, 1 );
	implicitStep( 0, 100 );
	implicitStep( -1, 1 );
	implicitStep( 0, 2 );
	implicitStep( 0, 3 );
	implicitStep( 0, 5 );
	implicitStep( 0, 7 );
	implicitStep( 1, 16 );
	implicitStep( 0, 15 );
	implicitStep( 1, 100 );
	implicitStep( 0, 1e32 );

	gui.addFolder( 'Explicit step', false );

	const explicitStep = ( min, max, step, label = step ) => {
		gui.add( { x: max }, 'x', min, max, step ).name( `[${min},${max}] step ${label}` );
	};

	explicitStep( 0, 1, 0.1 );
	explicitStep( 0, 100, 1 );
	explicitStep( -1, 1, 0.25 );
	explicitStep( 1, 16, .01 );
	explicitStep( 0, 15, .015 );
	explicitStep( 0, 5, 1 / 3, '1/3' );

};

app.demos[ 'Numbers Unbound' ] = function( gui ) {

	gui.add( { x: 0 }, 'x' ).name( 'No Parameters' );
	gui.add( { x: 0 }, 'x', 0 ).name( 'Min' );
	gui.add( { x: 0 }, 'x' ).max( 0 ).name( 'Max' );

	gui.addFolder( 'Explicit step, no range', false );

	gui.add( { x: 0 }, 'x' ).step( 0.01 ).name( '0.01' );
	gui.add( { x: 0 }, 'x' ).step( 0.1 ).name( '0.1' );
	gui.add( { x: 0 }, 'x' ).step( 1 ).name( '1' );
	gui.add( { x: 0 }, 'x' ).step( 10 ).name( '10' );

};

app.demos[ 'Kitchen Sink' ] = function( gui ) {

	gui.addFolder( 'Colors', false );

	gui.addColor( { x: '#6C44BE' }, 'x' ).name( 'Hex String' );
	gui.addColor( { x: 0x6C44BE }, 'x' ).name( 'Hex Int' );
	gui.addColor( { x: [ 0, 1, 1 ] }, 'x' ).name( 'RGB Array' );
	gui.addColor( { x: { r: 0, g: 1, b: 1 } }, 'x' ).name( 'RGB Object' );

	gui.addFolder( 'Options', false );

	gui.add( { x: 0 }, 'x', [ 0, 1, 2 ] ).name( 'Array' );
	gui.add( { x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Object' );
	gui.add( { x: -1 }, 'x', [ 0, 1, 2 ] ).name( 'Invalid initial' );

	const longString = 'Anoptionorvaluewithaproblematicallylongname';
	gui.add( { x: longString }, 'x', [ longString, 1, 2 ] ).name( 'Long names' );

	const folder1 = gui.addFolder( 'Folder', true );

	const addFiller = g => {
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
	};

	addFiller( folder1 );

	const folder2 = gui.addFolder( 'Closed Folder' ).close();

	addFiller( folder2 );

	gui.addFolder( 'Empty Folder' );

	const folder3 = gui.addFolder( 'Nested Folders' );

	addFiller( folder3 );

	const folder4 = folder3.addFolder( 'Don\'t go crazy now.' );

	addFiller( folder4 );
	folder4.addFolder( 'Nested "header"', false );
	addFiller( folder4 );

	const folderNameWidth = gui.addFolder( '--name-width' );

	folderNameWidth.domElement.style.setProperty( '--name-width', '60%' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'justABunchOfBooleans' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'withReallyLongNames' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'chillingInAList' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( '🤓' ).domElement.style.setProperty( '--name-width', '10%' );

	gui.add( { x: 0 }, 'x', 0, 1 ).domElement.style.setProperty( '--slider-input-width', '50%' );

};

app.init();
