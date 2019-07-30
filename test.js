import { GUI } from './src/GUI.js';

const gui = new GUI();

gui.addColor( { color: '#ff00aa' }, 'color' );

gui.add( { a: 0 }, 'a' )
    .onChange( () => console.log( 'onChange' ) )
    .onFinishChange( () => console.log( 'onFinishChange' ) );

gui.add( { a: 0 }, 'a', 0, 1 )
    .onChange( () => console.log( 'onChange' ) )
    .onFinishChange( () => console.log( 'onFinishChange' ) );

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
gui.add( { 'number': 0.6 }, 'number', 0, 500, 73 );

const folder = gui.addFolder( 'sup' );
folder.add( { string: 'String' }, 'string' );
folder.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );

const folder2 = folder.addFolder( 'more' );
folder2.add( { string: 'String' }, 'string' );
folder2.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );

const folder3 = folder2.addFolder( 'more more' );
folder3.add( { string: 'String' }, 'string' );
folder3.add( { options: 3 }, 'options', { One: 1, Two: 2, Three: 3 } ).onChange( console.log );


gui.add( { boolean: true }, 'boolean' );
gui.add( { function: () => alert( 'hi' ) }, 'function' );

gui.add( { value: false }, 'value' ).name( 'A disabled value' ).disable();

folder.add( { options: 3 }, 'options' ).name( 'dickhead options' ).options( { One: 1, Two: 2, Three: 3 } );


console.log( gui );
