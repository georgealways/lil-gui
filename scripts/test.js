import './test-shim.js';
import test from './test-runner.js';
import assert from 'assert';

import GUI, { GUI as _GUI } from '../build/lil-gui.module';

test( unit => {

	unit( '', () => {

		assert.strictEqual( GUI, _GUI, 'GUI is available as both default and named export' );

		const gui = new GUI();

		assert( gui, 'can be instantiated' );

		assert.strictEqual( typeof gui.add, 'function', 'gui.add exists' );

	} );

	unit( 'name', () => {

		const gui = new GUI();
		const name = 'david';
		const controller = gui.add( { x: 0 }, 'x' ).name( name );

		assert.strictEqual( controller.$name.innerHTML, name, 'name sets innerHTML' );

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
			if ( typeof method != 'function' ) {
				throw Error( `Tried to spy on "${methodName}" but it's not a function: ${method}` );
			}
			instance[ methodName ] = function() {
				method.apply( this, arguments );
				spy.apply( this, arguments );
			};
		}

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

	unit( 'number', () => {

		const gui = new GUI();
		const controller1 = gui.add( { x: 0 }, 'x' );
		const controller2 = gui.add( { x: 0 }, 'x', 0 );

		assert.strictEqual( controller1.$slider, undefined, 'no sliders without range' );
		assert.strictEqual( controller2.$slider, undefined, 'no sliders without range' );

	} );

	unit( 'slider', () => {

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

				const message = `float precision [${min},${max}] ${controller._step} ${target.x}`;
				assert( decimals( target.x ) <= decimals( controller._step ), message );

			}

			window.$callEventListener( 'mouseup' );

		}

		function decimals( number ) {
			const parts = number.toString().split( '.' );
			return parts.length === 1 ? 0 : parts[ 1 ].length;
		}

	} );

	unit( 'increment', () => {

		const gui = new GUI();

		let controller;

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38 } );
		// 100 arrow keys to make the full range without explicit step
		assert.strictEqual( controller.getValue(), 0.01 );

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, shiftKey: true } );
		// 10 shift arrow keys to make the full range without explicit step
		assert.strictEqual( controller.getValue(), 0.1 );

		controller = gui.add( { x: 0 }, 'x', 0, 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38, altKey: true } );
		// 1000 alt arrow keys to make the full range without explicit step
		assert.strictEqual( controller.getValue(), 0.001 );

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'keydown', { keyCode: 38 } );
		// assert.strictEqual( controller.getValue(), 1 );
		// TODO this should pass, but would involve testing for explicit step

		controller = gui.add( { x: 0 }, 'x' ).step( 1 );
		controller.$input.$callEventListener( 'focus' );
		controller.$input.$callEventListener( 'wheel', { deltaY: -1, deltaX: 0 } );
		assert.strictEqual( controller.getValue(), 1 );

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
