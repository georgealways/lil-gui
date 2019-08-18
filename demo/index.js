import { GUI } from '../build/gui.module.js';

const randomVariables = [
    'x',
    'y',
    'variance',
    'speed',
    'frequency',
    'spread',
    'jitter',
    'velocity',
    'damping',
    'width',
    'height',
    'environment',
    'multiplier',
    'strength',
    'delta'
];

const GUIS = {

    'Basic': function( gui ) {

        gui.add( { options: 'Basic' }, 'options', [ 'Basic', 'Headers', 'Folders' ] );
        gui.add( { number: 0 }, 'number' );
        gui.add( { slider: 0.5 }, 'slider', 0, 1 );
        gui.add( { boolean: true }, 'boolean' );
        gui.addHeader( 'Header' );
        gui.add( { string: 'string' }, 'string' );
        gui.addColor( { color: '#eeaaff' }, 'color' );
        gui.add( { function: () => alert( 'sup' ) }, 'function' );

    },

    'One Slider': function( gui ) {

        gui.add( { strength: 0 }, 'strength', 0, 1, 0.1 );

    },

    'Folders': function( gui ) {

        let folder;
        folder = gui.addFolder( 'folder' );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', -1, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 100 );
        folder.add( { a: Math.random() }, 'a', 0, 32, 1 );

        folder = gui.addFolder( 'folder' );
        folder.add( { a: Math.random() }, 'a', 0, 1000 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );

        folder = gui.addFolder( 'folder' );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );
        folder.add( { a: Math.random() }, 'a', 0, 1 );

    },

    'Old Kitchen Sink': function( gui ) {


        gui.add( { a: 0 }, 'a', 0, 1 )
            .onChange( () => console.log( 'onChange' ) )
            .onFinishChange( () => console.log( 'onFinishChange' ) );
        gui.add( { a: 0 }, 'a' )
            .onChange( () => console.log( 'onChange' ) )
            .onFinishChange( () => console.log( 'onFinishChange' ) );

        gui.addColor( { color: '#ff00aa' }, 'color' );

        gui.add( { a: 0 }, 'a', [ 0, 1, 2 ] )
            .onChange( () => console.log( 'onChange' ) )
            .onFinishChange( () => console.log( 'onFinishChange' ) );

        gui.add( { a: 'a' }, 'a' )
            .onChange( () => console.log( 'onChange' ) )
            .onFinishChange( () => console.log( 'onFinishChange' ) );

        gui.add( { a: true }, 'a' )
            .onChange( () => console.log( 'onChange' ) )
            .onFinishChange( () => console.log( 'onFinishChange' ) );

        gui.add( { options: 'b' }, 'options', [ 'a', 'b', 'c' ] ).onChange( console.log );

        const obj = { number: 0 };
        gui.add( obj, 'number' ).onChange( console.log );
        gui.add( { 'number': 0.2 }, 'number', 0 ).name( 'number min' );
        gui.add( { 'number': 0.4 }, 'number', 0, 1 ).name( 'number min max' );
        gui.add( { 'number': 0.6 }, 'number' ).min( 0 ).max( 1 ).name( 'number min max methods' );
        gui.add( { 'number': 0.6 }, 'number', 0, 500, 73 ).disable();

        const folder0 = gui.addFolder( 'sup' );
        folder0.add( { string: 'String' }, 'string' );
        folder0.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );

        const folder2 = folder0.addFolder( 'more' );
        folder2.add( { string: 'String' }, 'string' );
        folder2.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );

        const folder3 = folder2.addFolder( 'more more' );
        folder3.add( { string: 'String' }, 'string' );
        folder3.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );


        gui.add( { boolean: true }, 'boolean' );
        gui.add( { function: () => alert( 'hi' ) }, 'function' );

        gui.add( { value: false }, 'value' ).name( 'A disabled value' ).disable();
        gui.add( { value: false }, 'value' ).name( 'longunbreakablewordwhathappens' );

        folder0.add( { options: 3 }, 'options' ).name( 'options' ).options( { One: 1, Two: 2, Three: 3 } );

    }

};

let gui;

function buildGUI( builder ) {
    if ( gui !== undefined ) {
        gui.destroy();
    }
    gui = new GUI();
    builder( gui );
}

function makeButton( name ) {
    const button = document.createElement( 'button' );
    button.innerHTML = name;
    button.addEventListener( 'click', () => {
        buildGUI( GUIS[ name ] );
    } );
    document.body.appendChild( button );
}

for ( let name in GUIS ) {
    makeButton( name );
}

buildGUI( GUIS[ 'Basic' ] );