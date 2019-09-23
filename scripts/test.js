import './test-shim.js';
import test from './test-runner.js';
import assert from 'assert';

import GUI, { GUI as _GUI } from '..';

test( unit => {

	unit( '', () => {

		assert.strictEqual( GUI, _GUI, 'GUI is available as both default and named export' );

		const gui = new GUI();

		assert( gui, 'can be instantiated' );

		assert.strictEqual( typeof gui.add, 'function', 'gui.add exists' );

		assert( gui.add( { x: false }, 'x' ) instanceof GUI.BooleanController );
		assert( gui.add( { x: 0 }, 'x' ) instanceof GUI.NumberController );

		const onChangeShorthand = function(){};

		let ctrl;

		ctrl = gui.add( { x: false }, 'x', onChangeShorthand );
		assert.strictEqual( ctrl._onChange, onChangeShorthand );

		ctrl = gui.add( { x: 0 }, 'x', [ 0, 1, 2 ], onChangeShorthand );
		assert.strictEqual( ctrl._onChange, onChangeShorthand );

		ctrl = gui.add( { x: 0 }, 'x', { a: 0, b: 1 }, onChangeShorthand );
		assert.strictEqual( ctrl._onChange, onChangeShorthand );

		ctrl = gui.add( { x: 0 }, 'x', 0, 1, 0.1, onChangeShorthand );
		assert.strictEqual( ctrl._onChange, onChangeShorthand );

	} );

	unit( 'name', () => {

		const gui = new GUI();
		const name = 'david';
		const controller = gui.add( { x: 0 }, 'x' ).name( name );

		assert.strictEqual( controller.$name.innerHTML, name, 'name sets innerHTML' );

	} );

	unit( 'number', () => {

		const gui = new GUI();
		const controller1 = gui.add( { x: 0 }, 'x' );
		const controller2 = gui.add( { x: 0 }, 'x', 0 );

		assert.strictEqual( controller1.$slider, undefined, 'no sliders without range' );
		assert.strictEqual( controller2.$slider, undefined, 'no sliders without range' );

	} );

	unit( 'color', () => {

		const gui = new GUI();

		// 122 / 255, 38 / 255, 171 / 255
		const obj = {
			r: 0.47843137254901963,
			g: 0.14901960784313725,
			b: 0.6705882352941176
		};

		const arr = [ obj.r, obj.g, obj.b ];
		const int = 0x7a26ab;
		const string = '#7a26ab';

		assert.strictEqual( gui.addColor( { obj }, 'obj' ).$input.value, string );
		assert.strictEqual( gui.addColor( { arr }, 'arr' ).$input.value, string );
		assert.strictEqual( gui.addColor( { int }, 'int' ).$input.value, string );
		assert.strictEqual( gui.addColor( { string }, 'string' ).$input.value, string );

	} );

	unit( 'destroy', () => {

		const gui = new GUI();
		gui.add( { x: 0 }, 'x' );
		gui.add( { x: 0 }, 'x' );
		gui.add( { x: 0 }, 'x' );

		const folder1 = gui.addFolder( 'folder' );
		folder1.add( { x: 0 }, 'x' );
		folder1.add( { x: 0 }, 'x' );

		const folder2 = folder1.addFolder( 'folder' );
		folder2.add( { x: 0 }, 'x' );
		folder2.add( { x: 0 }, 'x' );

		let childCount = 0;
		let destroyCount = 0;

		gui.children.forEach( spyDestroyRecursive );

		gui.destroy();

		assert.strictEqual( destroyCount, childCount, 'destroy was called exactly once on each child' );
		assert.strictEqual( gui.children.length, 0, 'children is empty' );
		assert.strictEqual( folder1.children.length, 0, 'children is empty' );
		assert.strictEqual( folder2.children.length, 0, 'children is empty' );

		function spyDestroyRecursive( child ) {
			childCount++;
			spy( child, 'destroy', () => destroyCount++ );
			if ( child.children ) {
				child.children.forEach( spyDestroyRecursive );
			}
		}

		function spy( instance, methodName, spy ) {
			const method = instance[ methodName ];
			if ( typeof method !== 'function' ) {
				throw Error( `Tried to spy on "${methodName}" but it's not a function: ${method}` );
			}
			instance[ methodName ] = function() {
				method.apply( this, arguments );
				spy.apply( this, arguments );
			};
		}

	} );

	unit( 'slider precision', () => {

		const gui = new GUI();

		sliderTest( 0, 1 );
		sliderTest( 0, 3 );
		sliderTest( 0, 5 );
		sliderTest( 0, 1000 / 3 );

		function sliderTest( min, max ) {

			const target = { x: 0 };
			const controller = gui.add( target, 'x', min, max );

			const rect = controller.$slider.getBoundingClientRect();

			controller.$slider.$callEventListener( 'mousedown', {
				clientX: Math.floor( rect.left )
			} );

			assert.strictEqual( target.x, 0 );

			for ( let clientX = Math.floor( rect.left ); clientX < Math.ceil( rect.right ); clientX++ ) {

				window.$callEventListener( 'mousemove', { clientX } );

				const message = `value never has more precision than step [${min},${max}] ${controller._step} ${target.x}`;
				assert( decimals( target.x ) <= decimals( controller._step ), message );

			}

			window.$callEventListener( 'mouseup' );

		}

		function decimals( number ) {
			const parts = number.toString().split( '.' );
			return parts.length === 1 ? 0 : parts[ 1 ].length;
		}

	} );

	unit( 'arrow keys and mousewheel', () => {

		const gui = new GUI();

		let controller;

		// $input

		controller = gui.add( { x: 0 }, 'x' );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38 } );
		assert.strictEqual( controller.getValue(), 1, 'no params: one arrow key = 1' );

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38 } );
		assert.strictEqual( controller.getValue(), 0.01, 'implicit step: 100 arrow keys = full range' );

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, shiftKey: true } );
		assert.strictEqual( controller.getValue(), 0.1, 'implicit step: 10 shift arrow keys = full range' );

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, altKey: true } );
		assert.strictEqual( controller.getValue(), 0.001, 'implicit step: 1000 alt arrow keys = full range' );

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38 } );
		assert.strictEqual( controller.getValue(), 1, 'explicit step: 1 arrow key = 1 step' );

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, altKey: true } );
		assert.strictEqual( controller.getValue(), 1, 'explicit step: 1 alt arrow key also = 1 step' );

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, shiftKey: true } );
		assert.strictEqual( controller.getValue(), 10, 'explicit step: 1 shift arrow key = 10 step' );

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
		assert.strictEqual( controller.getValue(), 0, 'mousewheel on input only works when input is focused' );

		controller.$input.$callEventListener( 'focus' );
		controller.$input.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
		assert.strictEqual( controller.getValue(), 1, 'explicit step: 1 line = 1 step' );

		// $slider

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$slider.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
		assert.strictEqual( controller.getValue(), 0.001, 'implicit step: 100 lines = full range' );

		controller = gui.add( { x: 0 }, 'x', 0, 1, 0.1 );
		controller.$slider.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
		assert.strictEqual( controller.getValue(), 0.1, 'explicit step: 1 line = 1 step' );

	} );

	unit( 'forEachController', () => {

		const gui = new GUI();

		gui.add( { x: 0 }, 'x' );
		gui.add( { x: 0 }, 'x' );
		gui.add( { x: 0 }, 'x' );

		const folder1 = gui.addFolder( 'title' );
		folder1.add( { x: 0 }, 'x' );
		folder1.add( { x: 0 }, 'x' );
		folder1.add( { x: 0 }, 'x' );

		const folder2 = folder1.addFolder( 'title' );
		folder2.add( { x: 0 }, 'x' );
		folder2.add( { x: 0 }, 'x' );
		folder2.add( { x: 0 }, 'x' );

		const folder3 = gui.addFolder( 'title' );
		folder3.add( { x: 0 }, 'x' );
		folder3.add( { x: 0 }, 'x' );

		let controllersVisited;
		const visit = c => {
			assert.strictEqual( controllersVisited.indexOf( c ), -1, 'forEachController visits each controller exactly once' );
			controllersVisited.push( c );
		};

		controllersVisited = [];
		gui.forEachController( visit );
		assert.strictEqual( controllersVisited.length, 3, 'recursive defaults to false' );

		controllersVisited = [];
		gui.forEachController( visit, true );
		assert.strictEqual( controllersVisited.length, 11, 'recursive' );

		controllersVisited = [];
		folder1.forEachController( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited = [];
		folder1.forEachController( visit, true );
		assert.strictEqual( controllersVisited.length, 6 );

		controllersVisited = [];
		folder2.forEachController( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited = [];
		folder2.forEachController( visit, true );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited = [];
		folder3.forEachController( visit );
		assert.strictEqual( controllersVisited.length, 2 );

		controllersVisited = [];
		folder3.forEachController( visit, true );
		assert.strictEqual( controllersVisited.length, 2 );

	} );

} );
