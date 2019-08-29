/* eslint-disable no-console */
import { GUI } from '../build/lil-gui.module.js';

class App {
	constructor() {
		this.demos = {};
	}
	set demo( name ) {

		this._demo = name;

		history.replaceState( undefined, undefined, name === this.defaultDemo ? ' ' : '#' + name );

		if ( this.gui ) {
			this.gui.destroy();
		}

		this.gui = new GUI();
		this.gui.add( this, 'demo', Object.keys( this.demos ) );

		this.demos[ name ]( this.gui );

	}
	get demo() {
		return this._demo;
	}
}

const app = new App();

app.demos[ 'Basic' ] = function( gui ) {

	gui.add( { number: 0.5 }, 'number', 0, 1 );
	gui.addColor( { color: 0x6C44BE }, 'color' );
	gui.add( { string: 'message' }, 'string' );
	gui.add( { boolean: true }, 'boolean' );
	gui.add( { button() { alert( 'sup' ); } }, 'button' );


};

// app.demos[ 'Style' ] = function( gui ) {

// 	gui.add( { number: 0.5 }, 'number', 0, 1 );
// 	gui.addColor( { color: 0x6C44BE }, 'color' );
// 	gui.add( { string: 'message' }, 'string' );
// 	gui.add( { boolean: true }, 'boolean' );
// 	gui.add( { button() { alert( 'sup' ); } }, 'button' );

// 	gui.add( { x: 25 }, 'x', 0, 50, 1 ).name( '--row-height' ).onChange( v => {
// 		gui.domElement.style.setProperty( '--row-height', v + 'px' );
// 	} );

// 	gui.add( { x: 20 }, 'x', 0, 50, 1 ).name( '--widget-height' ).onChange( v => {
// 		gui.domElement.style.setProperty( '--widget-height', v + 'px' );
// 	} );

// 	gui.add( { x: 40 }, 'x', 0, 100, 0.1 ).name( '--name-width' ).onChange( v => {
// 		gui.domElement.style.setProperty( '--name-width', v + '%' );
// 	} );

// 	gui.add( { x: 6 }, 'x', 0, 12, 1 ).name( '--padding' ).onChange( v => {
// 		gui.domElement.style.setProperty( '--padding', v + 'px' );
// 	} );

// 	const folder1 = gui.addFolder( 'Folder' );

// 	const addFiller = g => {
// 		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
// 		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
// 		g.add( { x: 0 }, 'x', 0, 1 ).name( 'Filler' );
// 	};

// 	addFiller( folder1 );

// 	const folder2 = gui.addFolder( 'Closed Folder' ).close();

// 	addFiller( folder2 );

// 	gui.addFolder( 'Empty Folder' );

// 	const folder3 = gui.addFolder( 'Nested Folders' );

// 	addFiller( folder3 );

// 	const folder4 = folder3.addFolder( 'Don\'t go crazy now.' );

// 	addFiller( folder4 );
// 	folder4.addHeader( 'Nested header' );
// 	addFiller( folder4 );
// };

app.demos[ 'Kitchen Sink' ] = function( gui ) {

	gui.addHeader( 'Numbers' );
	// ------------------------------------

	gui.add( { x: 0 }, 'x' ).name( 'No Parameters' );
	gui.add( { x: 0 }, 'x', 0 ).name( 'Min' );
	gui.add( { x: 0 }, 'x' ).max( 0 ).name( 'Max' );

	gui.addHeader( 'Range, implicit step' );
	// ------------------------------------

	let rangeHelper = ( min, max ) => {
		gui.add( { x: max }, 'x', min, max ).name( `[${min},${max}]` );
	};

	rangeHelper( 0, 1 );
	rangeHelper( 0, 100 );
	rangeHelper( -1, 1 );
	rangeHelper( 0, 2 );
	rangeHelper( 0, 3 );
	rangeHelper( 0, 5 );
	rangeHelper( 0, 7 );
	rangeHelper( 1, 16 );
	rangeHelper( 0, 15 );
	rangeHelper( 1, 100 );
	rangeHelper( 0, 1e32 );

	gui.addHeader( 'Range, explicit step' );
	// ------------------------------------

	rangeHelper = ( min, max, step, label = step ) => {
		gui.add( { x: max }, 'x', min, max, step ).name( `[${min},${max}] step ${label}` );
	};

	rangeHelper( 0, 1, 0.1 );
	rangeHelper( 0, 100, 1 );
	rangeHelper( -1, 1, 0.25 );
	rangeHelper( 1, 16, .01 );
	rangeHelper( 0, 15, .015 );
	rangeHelper( 0, 5, 1 / 3, '1/3' );

	gui.addHeader( 'Explicit step, no range' );
	// ------------------------------------

	gui.add( { x: 0 }, 'x' ).step( 0.01 ).name( '0.01' );
	gui.add( { x: 0 }, 'x' ).step( 0.1 ).name( '0.1' );
	gui.add( { x: 0 }, 'x' ).step( 1 ).name( '1' );
	gui.add( { x: 0 }, 'x' ).step( 10 ).name( '10' );

	gui.addHeader( 'Colors' );
	// ------------------------------------

	gui.addColor( { x: '#6C44BE' }, 'x' ).name( 'Hex String' );
	gui.addColor( { x: 0x6C44BE }, 'x' ).name( 'Hex Int' );
	gui.addColor( { x: [ 0, 1, 1 ] }, 'x' ).name( 'RGB Array' );
	gui.addColor( { x: { r: 0, g: 1, b: 1 } }, 'x' ).name( 'RGB Object' );

	gui.addHeader( 'Options' );
	// ------------------------------------

	gui.add( { x: 0 }, 'x', [ 0, 1, 2 ] ).name( 'Array' );
	gui.add( { x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Object' );
	gui.add( { x: -1 }, 'x', [ 0, 1, 2 ] ).name( 'Invalid initial' );

	const longString = 'Anoptionorvaluewithaproblematicallylongname';
	gui.add( { x: longString }, 'x', [ longString, 1, 2 ] ).name( 'Long names' );

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
	folder4.addHeader( 'Nested header' );
	addFiller( folder4 );

	const folderNameWidth = gui.addFolder( '--name-width' );
	// ------------------------------------

	folderNameWidth.domElement.style.setProperty( '--name-width', '60%' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'justABunchOfBooleans' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'withReallyLongNames' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( 'chillingInAList' );
	folderNameWidth.add( { x: true }, 'x', 0, 1 ).name( '🤓' ).domElement.style.setProperty( '--name-width', '10%' );


	gui.add( { x: 0 }, 'x', 0, 1 ).domElement.style.setProperty( '--slider-input-width', '50%' );

};

app.defaultDemo = Object.keys( app.demos )[ 0 ];

const demo = decodeURIComponent( location.hash.substring( 1 ) );
if ( demo && ( demo in app.demos ) ) {
	app.demo = demo;
} else {
	app.demo = app.defaultDemo;
}
