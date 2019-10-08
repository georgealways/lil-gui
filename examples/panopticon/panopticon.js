import GUI from '../../dist/lil-gui.module.js';

const myObject = {
	options: 10,
	boolean: true,
	string: 'lil-gui',
	number: 0.5,
	color: '#aa00ff',
	function() { alert( 'hi' ); }
};

const autoPlaceGUI = new GUI( { title: 'autoPlace' } );

autoPlaceGUI.add( myObject, 'options', { Small: 1, Medium: 10, Large: 100 } );
autoPlaceGUI.add( myObject, 'boolean' );
autoPlaceGUI.add( myObject, 'string' );
autoPlaceGUI.add( myObject, 'number', 0, 1 );
autoPlaceGUI.addColor( myObject, 'color' );
autoPlaceGUI.add( myObject, 'function' );

const panopticon = document.getElementById( 'panopticon' );

function make( options, callback ) {
	options.container = panopticon;
	// options.collapses = false;
	const gui = new GUI( options );
	callback( gui );
	return gui;
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

make( { title: 'Sliders' }, gui => {

	const guiImplicit = gui.addFolder( 'Implicit step' );

	const implicitStep = ( min, max ) => {
		guiImplicit.add( { x: max }, 'x', min, max ).name( `[${min},${max}]` );
	};

	implicitStep( 0, 1 );
	implicitStep( 0, 100 );
	implicitStep( -1, 1 );
	implicitStep( 0, 3 );
	implicitStep( 0, 5 );
	implicitStep( 0, 7 );
	implicitStep( 0, 15 );
	implicitStep( 0, 1e32 );

	const guiExplicit = gui.addFolder( 'Explicit step' );

	const explicitStep = ( min, max, step, label = step ) => {
		guiExplicit.add( { x: max }, 'x', min, max, step ).name( `[${min},${max}] step ${label}` );
	};

	explicitStep( 0, 100, 1 );
	explicitStep( 0, 1, 0.1 );
	explicitStep( -1, 1, 0.25 );
	explicitStep( 1, 16, .01 );
	explicitStep( 0, 15, .015 );
	explicitStep( 0, 5, 1 / 3, '1/3' );

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

	gui.addColor( { x: 0xaa00ff }, 'x' ).name( 'Hex Integer' );
	gui.addColor( { x: { r: 2 / 3, g: 0, b: 1 } }, 'x' ).name( '{r,g,b} 0-1' );
	gui.addColor( { x: [ 2 / 3, 0, 1 ] }, 'x' ).name( '[r,g,b] 0-1' );

	const guiStrings = gui.addFolder( 'Strings' );

	const colorString = str => guiStrings.addColor( { x: str }, 'x' ).name( `"${str}"` );

	colorString( '#aa00Ff' );
	colorString( 'aa00Ff' );
	colorString( '0xaa00Ff' );
	colorString( '#a0f' );
	colorString( 'a0f' );
	colorString( 'rgb(170, 0, 255)' );

	const guiRGBScale = gui.addFolder( 'RGB Scale' );

	guiRGBScale.addColor( { x: [ 170, 0, 255 ] }, 'x', 255 ).name( '{r,g,b} 0-255' );
	guiRGBScale.addColor( { x: { r: 170, g: 0, b: 255 } }, 'x', 255 ).name( '[r,g,b] 0-255' );

} );

make( { title: 'Folders' }, gui => {

	const folder1 = gui.addFolder( 'Folder' );
	addFiller( folder1 );

	addFiller( gui );

	const folder2 = gui.addFolder( 'Closed Folder' ).close();

	addFiller( folder2 );

	gui.addFolder( 'Empty Folder' );

	const folder3 = gui.addFolder( 'Folder' );

	addFiller( folder3 );

	const folder4 = folder3.addFolder( 'Nested Folder' );

	addFiller( folder4 );

	folder4.addFolder( 'Nested Folder' );

	addFiller( folder4 );

	function getDepth( g ) {
		let depth = 0;
		while ( g !== g.root ) {
			g = g.parent;
			depth++;
		}
		return depth;
	}

	function addFiller( g ) {
		const nested = getDepth( g ) > 0 ? 'Nested ' : '';
		g.add( { x: 0.5 }, 'x', 0, 1 ).name( `${nested}Slider` );
		g.add( { x: true }, 'x' ).name( `${nested}Boolean` );
		g.add( { x: function(){} }, 'x' ).name( `${nested}Button` );
	}
} );

const styleTag = document.createElement( 'style' );
document.head.appendChild( styleTag );

function update() {
	let style = '.lil-gui {\n';
	for ( let prop in stylesheet ) {
		style += `\t${prop}: ${stylesheet[ prop ]};\n`;
	}
	style += '}';
	styleTag.innerHTML = style;
}

const stylesheet = new Proxy( {}, {
	set( target, property, value ) {
		target[ property ] = value;
		update();
		return true;
	},
	get( target, property ){
		return target[ property ];
	}
} );

const cssVarsGUI = make( { title: 'CSS Vars' }, gui => {

	const style = Array.from( document.querySelectorAll( 'style' ) ).find( v => /lil-gui/.test( v.innerHTML ) );

	style.innerHTML.replace( /(--[a-z0-9-]+)\s*:\s*([^;}]*)[;}]/ig, function( $0, property, value ) {

		if ( !( property in stylesheet ) ) {

			stylesheet[ property ] = value;

			if ( /color$/.test( property ) ) {
				gui.addColor( stylesheet, property );
			} else if ( /^\d+px$/.test( value ) ) {
				const anon = {};
				const initial = parseFloat( value.replace( 'px', '' ) );
				anon[ property ] = initial;
				gui.add( anon, property ).min( 0 ).step( 1 ).onChange( v => stylesheet[ property ] = v + 'px' );
			} else if ( /%$/.test( value ) ) {
				const anon = {};
				const initial = parseFloat( value.replace( '%', '' ) );
				anon[ property ] = initial;
				// gui.add( anon, property, 0, 100 )
				gui.add( anon, property )
					.onChange( v => stylesheet[ property ] = v + '%' );
			} else {
				gui.add( stylesheet, property );
			}

		}

	} );

	gui.add( gui, 'reset' );

	gui.add( { log() {
		console.log( JSON.stringify( gui.export(), null, '\t' ) );
	} }, 'log' );

} );
theme( 'Light', {
	'--background-color': '#f6f6f6',
	'--text-color': '#3d3d3d',
	'--title-background-color': '#efefef',
	'--widget-color': '#eaeaea',
	'--highlight-color': '#f2efef',
	'--number-color': '#33bbdb',
	'--string-color': '#97ad00'
} );

theme( 'Solarized~ Light', {
	'--background-color': '#fdf6e3',
	'--text-color': '#657b83',
	'--title-background-color': '#f5efdc',
	'--widget-color': '#eee8d5',
	'--highlight-color': '#e7e1cf',
	'--number-color': '#2aa0f3',
	'--string-color': '#97ad00'
} );

theme( 'Solarized~ Dark', {
	'--background-color': '#002b36',
	'--text-color': '#b2c2c2',
	'--title-background-color': '#001f27',
	'--widget-color': '#094e5f',
	'--highlight-color': '#0a6277',
	'--number-color': '#2aa0f2',
	'--string-color': '#97ad00'
} );

theme( 'Tennis', {
	'--background-color': '#32405e',
	'--text-color': '#ebe193',
	'--title-background-color': '#111111',
	'--widget-color': '#057170',
	'--highlight-color': '#9c2872',
	'--number-color': '#ffffff',
	'--string-color': '#ffbf00'
} );

function theme( title, styles ) {

	make( { title }, gui => {

		for ( let prop in styles ) {
			gui.domElement.style.setProperty( prop, styles[ prop ] );
		}

		gui.domElement.style.setProperty( '--name-width', '60%' );
		for ( let prop in styles ){
			gui.addColor( styles, prop );
		}
		gui.add( { Apply() {
			cssVarsGUI.import( gui.export() );
		} }, 'Apply' );
	} );
}
