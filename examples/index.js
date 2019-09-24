import PageGUI from '../examples/pages/PageGUI.js';

const pages = {};

pages.Basic = gui => {

	gui.add( { number: 0.5 }, 'number', 0, 1 );
	gui.addColor( { color: 0x6C44BE }, 'color' );
	gui.add( { string: 'message' }, 'string' );
	gui.add( { boolean: true }, 'boolean' );
	gui.add( { button() { alert( 'sup' ); } }, 'button' );

};

pages[ 'Hall Of Sliders' ] = gui => {

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

pages[ 'Numbers Unbound' ] = gui => {

	gui.add( { x: 0 }, 'x' ).name( 'No Parameters' );
	gui.add( { x: 0 }, 'x', 0 ).name( 'Min' );
	gui.add( { x: 0 }, 'x' ).max( 0 ).name( 'Max' );

	gui.addFolder( 'Explicit step, no range', false );

	gui.add( { x: 0 }, 'x' ).step( 0.01 ).name( '0.01' );
	gui.add( { x: 0 }, 'x' ).step( 0.1 ).name( '0.1' );
	gui.add( { x: 0 }, 'x' ).step( 1 ).name( '1' );
	gui.add( { x: 0 }, 'x' ).step( 10 ).name( '10' );

};

pages[ 'Kitchen Sink' ] = gui => {

	gui.addFolder( 'Colors', false );

	gui.addColor( { x: 0x00aaff }, 'x' ).name( 'Hex Int' );
	gui.addColor( { x: [ 0, 2 / 3, 1 ] }, 'x' ).name( 'RGB Array' );
	gui.addColor( { x: { r: 0, g: 2 / 3, b: 1 } }, 'x' ).name( 'RGB Object' );

	gui.addFolder( 'Color Strings', false );

	const colorString = str => gui.addColor( { x: str }, 'x' ).name( str );

	colorString( '#00aAfF' );
	colorString( '00aAfF' );
	colorString( '0x00aAfF' );
	colorString( '#0af' );
	colorString( '0af' );
	colorString( 'rgb(0, 170, 255)' );

	gui.addFolder( 'RGB Scale', false );

	gui.addColor( { x: [ 0, 170, 255 ] }, 'x', 255 );
	gui.addColor( { x: { r: 0, g: 170, b: 255 } }, 'x', 255 );

	gui.addFolder( 'Options', false );

	gui.add( { x: 0 }, 'x', [ 0, 1, 2 ] ).name( 'Array' );
	gui.add( { x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Object' );
	gui.add( { x: {} }, 'x', [ 0, 1, 2 ] ).name( 'Invalid initial' );
	gui.add( { x: {} }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Invalid initial' );

	const longString = 'Anoptionorvaluewithaproblematicallylongname';
	gui.add( { x: longString }, 'x', [ longString, 1, 2 ] ).name( 'Long names' );

	const folder1 = gui.addFolder( 'Folder', true );

	const addFiller = g => {
		g.add( { x: 0.5 }, 'x', 0, 1 ).name( 'Filler Slider' );
		g.add( { x: function(){} }, 'x' ).name( 'Filler Button' );
		g.add( { x: function(){} }, 'x' ).name( 'Filler Button' );
		g.add( { x: function(){} }, 'x' ).name( 'Filler Button' );
		g.add( { x: function(){} }, 'x' ).name( 'A Very Long Filler Button' );
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

new PageGUI( pages, {
	queryMode: true,
	queryKey: 'demo',
	queryOpen: true
} );
