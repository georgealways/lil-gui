import GUI from '../../dist/lil-gui.esm.js';

export const container = document.getElementById( 'container' );

/**
 * @param {object} options
 * @param {function(GUI):GUI?} callback
 * @returns {GUI}
 */
export function make( options, callback = () => { } ) {
	if ( !options.autoPlace ) options.container = container;
	const gui = new GUI( options );
	return callback( gui ) || gui;
}

make( { title: 'Numbers' }, gui => {

	gui.add( { x: 0 }, 'x' ).name( 'No Parameters' );
	gui.add( { x: 0 }, 'x', 0 ).name( 'Min' );
	gui.add( { x: 0 }, 'x' ).max( 0 ).name( 'Max' );

	const guiStep = gui.addFolder( 'Step' );

	guiStep.add( { x: 0 }, 'x' ).step( 0.01 ).name( '0.01' );
	guiStep.add( { x: 0 }, 'x' ).step( 0.1 ).name( '0.1' );
	guiStep.add( { x: 0 }, 'x' ).step( 1 ).name( '1' );
	guiStep.add( { x: 0 }, 'x' ).step( 10 ).name( '10' );

} );

make( { title: 'Implicit step' }, gui => {

	const implicitStep = ( min, max ) => {
		gui.add( { x: max }, 'x', min, max ).name( `[${min},${max}]` );
	};

	implicitStep( 0, 1 );
	implicitStep( 0, 100 );
	implicitStep( -1, 1 );
	implicitStep( 0, 3 );
	implicitStep( 0, 5 );
	implicitStep( 0, 7 );
	implicitStep( 0, 15 );
	implicitStep( 0, 1e32 );

} );

make( { title: 'Explicit step' }, gui => {

	const explicitStep = ( min, max, step, label = step ) => {
		gui.add( { x: max }, 'x', min, max, step ).name( `[${min},${max}] step ${label}` );
	};

	explicitStep( 0, 100, 1 );
	explicitStep( 0, 1, 0.1 );
	explicitStep( -1, 1, 0.25 );
	explicitStep( 1, 16, .01 );
	explicitStep( 0, 15, .015 );
	explicitStep( 0, 5, 1 / 3, '1/3' );

	const oob = gui.addFolder( 'Out of bounds' );

	oob.add( { x: 2 }, 'x', 0, 1 ).name( '[0,1] Too high' );
	oob.add( { x: -2 }, 'x', 0, 1 ).name( '[0,1] Too low' );

} );

make( { title: 'Options' }, gui => {

	gui.add( { x: 0 }, 'x', [ 0, 1, 2 ] ).name( 'Array' );
	gui.add( { x: 0 }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Object' );
	gui.add( { x: {} }, 'x', [ 0, 1, 2 ] ).name( 'Invalid initial' );
	gui.add( { x: {} }, 'x', { Label1: 0, Label2: 1, Label3: 2 } ).name( 'Invalid initial' );

	const longString = 'Anoptionorvaluewithaproblematicallylongname';
	gui.add( { x: longString }, 'x', [ longString, 1, 2 ] ).name( 'Long names' );

} );

make( { title: 'Colors' }, gui => {

	const colorString = str => gui.addColor( { x: str }, 'x' ).name( `"${str}"` );

	colorString( '#aa00Ff' );
	colorString( 'aa00Ff' );
	colorString( '0xaa00Ff' );
	colorString( '#a0f' );
	colorString( 'a0f' );
	colorString( 'rgb(170, 0, 255)' );

} );

make( { title: 'Color Strings' }, gui => {

	gui.addColor( { x: 0xaa00ff }, 'x' ).name( 'Hex Integer' );
	gui.addColor( { x: { r: 2 / 3, g: 0, b: 1 } }, 'x' ).name( '{r,g,b} 0-1' );
	gui.addColor( { x: [ 2 / 3, 0, 1 ] }, 'x' ).name( '[r,g,b] 0-1' );

	const guiRGBScale = gui.addFolder( 'RGB Scale' );

	guiRGBScale.addColor( { x: [ 170, 0, 255 ] }, 'x', 255 ).name( '{r,g,b} 0-255' );
	guiRGBScale.addColor( { x: { r: 170, g: 0, b: 255 } }, 'x', 255 ).name( '[r,g,b] 0-255' );

} );

make( { title: 'Folders' }, gui => {

	const folder1 = gui.addFolder( 'Folder' );
	addFiller( folder1 );

	addFiller( gui );

	gui.addFolder( 'Empty Folder' );

	const folder2 = gui.addFolder( 'Closed Folder' ).close();

	addFiller( folder2 );

} );

make( { title: 'Nested Folders' }, gui => {

	const folder3 = gui.addFolder( 'Folder' );

	addFiller( folder3 );

	const folder4 = folder3.addFolder( 'Nested Folder' );

	addFiller( folder4 );

	folder4.addFolder( 'Nested Folder' );

	addFiller( folder4 );

} );

function addFiller( g ) {
	const nested = getDepth( g ) > 0 ? 'Nested ' : '';
	g.add( { x: 0.5 }, 'x', 0, 1 ).name( `${nested}Slider` );
	g.add( { x: true }, 'x' ).name( `${nested}Boolean` );
	g.add( { x: function() { } }, 'x' ).name( `${nested}Button` );
}

function getDepth( g ) {
	let depth = 0;
	while ( g !== g.root ) {
		g = g.parent;
		depth++;
	}
	return depth;
}

make( { title: 'Disable' }, gui => {

	gui.add( { Number: 0 }, 'Number' ).disable().enable();
	gui.add( { Number: 0 }, 'Number' ).disable();

	gui.add( { Slider: 0 }, 'Slider', 0, 1 ).disable().enable();
	gui.add( { Slider: 0 }, 'Slider', 0, 1 ).disable();

	gui.add( { String: 'foo' }, 'String' ).disable().enable();
	gui.add( { String: 'foo' }, 'String' ).disable();

	gui.add( { Boolean: true }, 'Boolean' ).disable().enable();
	gui.add( { Boolean: true }, 'Boolean' ).disable();

	gui.add( { Options: 'a' }, 'Options', [ 'a', 'b', 'c' ] ).disable().enable();
	gui.add( { Options: 'a' }, 'Options', [ 'a', 'b', 'c' ] ).disable();

	gui.add( { func() { console.log( 'hi' ); } }, 'func' ).name( 'Function' ).disable().enable();
	gui.add( { func() { console.log( 'hi' ); } }, 'func' ).name( 'Function' ).disable();

	gui.addColor( { Color: 0xaa00ff }, 'Color' ).disable().enable();
	gui.addColor( { Color: 0xaa00ff }, 'Color' ).disable();

} );

make( { title: 'Listen' }, gui => {

	const params = { animate: false };

	gui.add( params, 'animate' );

	function listenTester( name, cycle, ...addArgs ) {

		const obj = {};
		obj[ name ] = cycle[ cycle.length - 1 ];
		gui.add( obj, name, ...addArgs ).listen();
		let index = 0;

		const loop = () => {

			if ( params.animate ) obj[ name ] = cycle[ index ];
			if ( ++index > cycle.length - 1 ) {
				index = 0;
			}

			setTimeout( loop, 1000 );

		};

		loop();

	}

	listenTester( 'Number', [ 1, 2, 3, 4, 5 ] );
	listenTester( 'Slider', [ 5, 4, 3, 2, 1 ], 1, 5 );

	listenTester( 'String', [ 'foo', 'bar', 'baz' ] );
	listenTester( 'Boolean', [ true, false ] );

	listenTester( 'Options', [ 'a', 'b', 'c' ], [ 'a', 'b', 'c' ] );

	gui.add = gui.addColor; // hehe
	listenTester( 'Color', [ 0xaa00ff, 0x00aaff, 0xffaa00 ] );

} );

const autoPlaceShort = make( { title: 'autoPlace Short', autoPlace: true }, gui => {

	const obj = {
		options: 10,
		boolean: true,
		string: 'lil-gui',
		number: 0.5,
		color: '#aa00ff'
	};

	gui.add( obj, 'options', { Small: 1, Medium: 10, Large: 100 } );
	gui.add( obj, 'boolean' );
	gui.add( obj, 'string' );
	gui.add( obj, 'number', 0, 1 );
	gui.addColor( obj, 'color' );

} );

const autoPlaceLong = make( { title: 'autoPlace Long', autoPlace: true }, gui => {

	for ( let i = 0; i < 50; i++ ) {
		gui.add( { x: i / 49 }, 'x', 0, 1 );
	}

} );

make( { title: 'autoPlace' }, gui => {

	const opts = {
		None: undefined,
		Short: autoPlaceShort,
		Long: autoPlaceLong
	};

	autoPlaceShort.hash = '#auto-place-short';
	autoPlaceLong.hash = '#auto-place-long';

	const guis = Object.values( opts ).filter( v => v );

	const hideAll = () => {
		guis.forEach( gui => gui.hide() );
	};

	hideAll();

	const picker = gui.add( {}, 'Show', opts ).onChange( gui => {

		hideAll();

		if ( gui ) {
			gui.show();
			location.hash = gui.hash;
		} else {
			location.hash = '';
		}

	} );

	// parse hash
	guis.forEach( gui => {
		if ( gui.hash === location.hash ) {
			picker.setValue( gui );
		}
	} );

} );

make( { title: 'onChange' }, gui => {

	const tallies = { onChange: 0, onFinishChange: 0 };

	function change() {
		console.log( this.property + ' onChange' );
		tallies.onChange++;
	}

	function finishChange() {
		console.log( this.property + ' onFinishChange' );
		tallies.onFinishChange++;
	}

	let folder;

	folder = gui.addFolder( 'Tallies' );
	folder.add( tallies, 'onChange' ).disable().listen();
	folder.add( tallies, 'onFinishChange' ).disable().listen();

	gui.add( { Number: 0 }, 'Number' ).onChange( change ).onFinishChange( finishChange );

	gui.add( { Slider: 0 }, 'Slider', 0, 1 ).onChange( change ).onFinishChange( finishChange );

	gui.add( { String: 'foo' }, 'String' ).onChange( change ).onFinishChange( finishChange );

	gui.add( { Boolean: true }, 'Boolean' ).onChange( change ).onFinishChange( finishChange );

	gui.add( { Options: 'a' }, 'Options', [ 'a', 'b', 'c' ] ).onChange( change ).onFinishChange( finishChange );

	gui.add( { func() { console.log( 'hi' ); } }, 'func' ).onChange( change ).onFinishChange( finishChange );

	gui.addColor( { Color: 0xaa00ff }, 'Color' ).onChange( change ).onFinishChange( finishChange );

	gui.onFinishChange( e => {
		console.log( 'gui.onFinishChange', e );
	} );

} );
