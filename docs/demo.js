/* eslint-disable no-console */
import { GUI } from '../build/lil-gui.module.js';

class App {
	constructor() {
		this.demos = {};
	}
	set demo( name ) {

		this.__demo = name;

		history.replaceState( undefined, undefined, name === this.defaultDemo ? ' ' : '#' + name );

		if ( this.gui ) {
			this.gui.destroy();
		}

		this.gui = new GUI();
		this.gui.add( this, 'demo', Object.keys( this.demos ) );

		this.demos[ name ]( this.gui );

	}
	get demo() {
		return this.__demo;
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

app.demos[ 'Kitchen Sink' ] = function( gui ) {

	gui.addHeader( 'Numbers' );

	gui.add( { x: 0 }, 'x' ).name( 'No Parameters' );
	gui.add( { x: 0 }, 'x', 0 ).name( 'Min' );
	gui.add( { x: 0 }, 'x' ).max( 0 ).name( 'Max' );

	gui.addHeader( 'Ranges' );

	const rangeHelper = ( min, max ) => {
		gui.add( { x: ( min + max ) / 2 }, 'x', min, max ).name( `[${min},${max}]` );
	};

	rangeHelper( 0, 1 );
	rangeHelper( -1, 1 );
	rangeHelper( 0, 100 );
	rangeHelper( 1, 16 );

	gui.addHeader( 'Step' );

	gui.add( { x: 0 }, 'x' ).step( 0.01 ).name( '0.01' );
	gui.add( { x: 0 }, 'x' ).step( 0.1 ).name( '0.1 (default)' );
	gui.add( { x: 0 }, 'x' ).step( 1 ).name( '1' );
	gui.add( { x: 0 }, 'x' ).step( 10 ).name( '10' );

	gui.addHeader( 'Colors' );

	gui.addColor( { x: '#6C44BE' }, 'x' ).name( 'Hex String' );
	gui.addColor( { x: 0x6C44BE }, 'x' ).name( 'Hex Int' );
	gui.addColor( { x: [ 0, 1, 1 ] }, 'x' ).name( 'RGB Array' );
	gui.addColor( { x: { r: 0, g: 1, b: 1 } }, 'x' ).name( 'RGB Object' );

	gui.addHeader( 'Options' );

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


};

app.defaultDemo = Object.keys( app.demos )[ 0 ];

const demo = decodeURIComponent( location.hash.substring( 1 ) );
if ( demo && ( demo in app.demos ) ) {
	app.demo = demo;
} else {
	app.demo = app.defaultDemo;
}
