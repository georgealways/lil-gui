import { make, container } from './kitchen-sink.js';

const Default = {};
const themes = {
	Default,
	Light: {
		'--background-color': '#f6f6f6',
		'--text-color': '#3d3d3d',
		'--title-background-color': '#efefef',
		'--title-text-color': '#3d3d3d',
		'--widget-color': '#eaeaea',
		'--hover-color': '#f0f0f0',
		'--focus-color': '#fafafa',
		'--number-color': '#07aacf',
		'--string-color': '#8da300'
	},
	'Solarized~ Light': {
		'--background-color': '#fdf6e3',
		'--text-color': '#657b83',
		'--title-background-color': '#f5efdc',
		'--title-text-color': '#657b83',
		'--widget-color': '#eee8d5',
		'--hover-color': '#e7e1cf',
		'--focus-color': '#e6ddc7',
		'--number-color': '#2aa0f3',
		'--string-color': '#97ad00'
	},
	'Solarized~ Dark': {
		'--background-color': '#002b36',
		'--text-color': '#b2c2c2',
		'--title-background-color': '#001f27',
		'--title-text-color': '#b2c2c2',
		'--widget-color': '#094e5f',
		'--hover-color': '#0a6277',
		'--focus-color': '#0b6c84',
		'--number-color': '#2aa0f2',
		'--string-color': '#97ad00'
	},
	'Tennis': {
		'--background-color': '#32405e',
		'--text-color': '#ebe193',
		'--title-background-color': '#713154',
		'--title-text-color': '#ffffff',
		'--widget-color': '#057170',
		'--hover-color': '#057170',
		'--focus-color': '#b74f88',
		'--number-color': '#ddfcff',
		'--string-color': '#ffbf00'
	}
};

const colorGUI = make( { title: 'Customization' }, gui => {

	gui.add( { theme: Default }, 'theme', themes )
		.name( 'Themes' )
		.onChange( v => {
			if ( v === Default ) {
				colorGUI.reset();
				allVarGUI.reset();
			} else {
				colorGUI.load( { controllers: v } );
			}
		} );

	return gui.addFolder( 'Colors' );

} );

const allVarGUI = make( { title: 'All CSS Vars' } );

const customDisplay = document.createElement( 'pre' );
customDisplay.id = 'custom-css';
container.appendChild( customDisplay );

const customStyleTag = document.createElement( 'style' );
document.head.appendChild( customStyleTag );

const originalStyles = {};

const stylesheet = new Proxy( {}, {
	set( target, property, value ) {
		if ( !( property in target ) ) {
			originalStyles[ property ] = value;
		}
		target[ property ] = value;
		updateStylesheet();
		return true;
	}
} );

function updateStylesheet() {
	let style = '';
	for ( let prop in stylesheet ) {
		const value = stylesheet[ prop ];
		if ( value === originalStyles[ prop ] ) continue;
		style += `\t${prop}: ${value};\n`;
	}
	if ( style ) {
		style = '.lil-gui {\n' + style + '}';
		customDisplay.innerHTML = style;
		customStyleTag.innerHTML = style;
	} else {
		customDisplay.innerHTML = '';
		customStyleTag.innerHTML = '';
	}
}

const defaultStyleTag = Array.from( document.querySelectorAll( 'style' ) )
	.find( tag => tag.innerHTML.includes( 'lil-gui' ) );

defaultStyleTag.innerHTML.replace( /(--[a-z0-9-]+)\s*:\s*([^;}]*)[;}]/ig, ( _, property, value ) => {

	if ( property in stylesheet ) return;

	stylesheet[ property ] = value;

	if ( /color$/.test( property ) ) {

		colorGUI.addColor( stylesheet, property );

	} else if ( /^\d+px$/.test( value ) ) {

		const obj = {};
		const initial = parseFloat( value.replace( 'px', '' ) );
		obj[ property ] = initial;

		allVarGUI.add( obj, property, 0, undefined, 1 ).onChange( v => stylesheet[ property ] = v + 'px' );

	} else if ( /%$/.test( value ) ) {

		const obj = {};
		const initial = parseFloat( value.replace( '%', '' ) );
		obj[ property ] = initial;

		allVarGUI.add( obj, property, 0 ).onChange( v => stylesheet[ property ] = v + '%' );

	} else {

		allVarGUI.add( stylesheet, property );

	}

} );
