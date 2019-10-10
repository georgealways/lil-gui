import './test-shim';
import test from './test-runner';
import assert from 'assert';

import GUI,
{
	GUI as _GUI,
	BooleanController,
	StringController,
	FunctionController,
	NumberController,
	OptionController
} from '..';

test( unit => {

	unit( 'api', () => {

		assert.strictEqual( GUI, _GUI, 'GUI is available as both default and named export' );

		const gui = new GUI();

		function testControllerType( controller, type ) {
			assert( controller instanceof type );
			assert.strictEqual( controller, controller.disable() );
			assert.strictEqual( controller, controller.enable() );
			assert.strictEqual( controller, controller.listen() );
			assert.strictEqual( controller, controller.max() );
			assert.strictEqual( controller, controller.min() );
			assert.strictEqual( controller, controller.name( 'hi' ) );
			assert.strictEqual( controller, controller.onChange( function() { } ) );
			assert.strictEqual( controller, controller.onFinishChange( function() { } ) );
			assert.strictEqual( controller, controller.reset() );
			assert.strictEqual( controller, controller.setValue() );
			assert.strictEqual( controller, controller.step() );
			assert.strictEqual( controller, controller.updateDisplay() );
		}

		testControllerType( gui.add( { x: false }, 'x' ), BooleanController );

		testControllerType( gui.add( { x: 0 }, 'x' ), NumberController );
		testControllerType( gui.add( { x: function() { } }, 'x' ), FunctionController );
		testControllerType( gui.add( { x: '' }, 'x' ), StringController );
		testControllerType( gui.add( { x: '' }, 'x', [ '', 'a' ] ), OptionController );

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

	unit( 'getControllers', () => {

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

		const controllersVisited = [];
		const visit = c => {
			assert.strictEqual( controllersVisited.indexOf( c ), -1, 'forEachController visits each controller exactly once' );
			controllersVisited.push( c );
		};

		controllersVisited.length = 0;
		gui.getControllers().forEach( visit );
		assert.strictEqual( controllersVisited.length, 11, 'recursive defaults to true' );

		controllersVisited.length = 0;
		gui.getControllers( false ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 3, 'recursive' );

		controllersVisited.length = 0;
		folder1.getControllers( false ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited.length = 0;
		folder1.getControllers().forEach( visit );
		assert.strictEqual( controllersVisited.length, 6 );

		controllersVisited.length = 0;
		folder2.getControllers( false ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited.length = 0;
		folder2.getControllers().forEach( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited.length = 0;
		folder3.getControllers( false ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 2 );

		controllersVisited.length = 0;
		folder3.getControllers().forEach( visit );
		assert.strictEqual( controllersVisited.length, 2 );

		controllersVisited.length = 0;
		gui.getFolders( true ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 3 );

	} );

	unit( 'export reset import', () => {

		// make an obj, remember original state

		const obj = {
			boolean: false,
			color1: '#aa00ff',
			color2: [ 1 / 3, 2 / 3, 1 ],
			color3: { r: 2 / 3, g: 1, b: 1 / 3 },
			color4: [ 0, 170, 255 ],
			color5: { r: 10, g: 21, b: 34 },
			func: function() {},
			number: 0,
			options: 'a',
			string: 'foo'
		};

		const originalShallow = Object.assign( {}, obj );

		function deepClone( obj ) {
			const clone = {};
			for ( let key in obj ) {
				const val = obj[ key ];
				if ( Array.isArray( val ) ) {
					clone[ key ] = Array.from( val );
				} else if ( typeof val !== 'function' && Object( val ) === val ) {
					clone[ key ] = deepClone( val );
				} else {
					clone[ key ] = val;
				}
			}
			return clone;
		}

		const originalDeep = deepClone( obj );

		function compare( state ) {
			for ( let key in obj ) {
				const val = obj[ key ];
				const deep = state[ key ];
				const shallow = originalShallow[ key ];
				if ( Object( val ) === val ) {
					assert.deepStrictEqual( val, deep, 'deep ' + key );
					assert.strictEqual( val, shallow, 'shallow ' + key );
				} else {
					assert.strictEqual( val, deep );
				}
			}
		}

		// add it to gui

		const gui = new GUI();

		const booleanCtrl = gui.add( obj, 'boolean' );
		const color1Ctrl = gui.addColor( obj, 'color1' );
		const color2Ctrl = gui.addColor( obj, 'color2' );
		const color3Ctrl = gui.addColor( obj, 'color3' );
		const color4Ctrl = gui.addColor( obj, 'color4', 255 );
		const color5Ctrl = gui.addColor( obj, 'color5', 255 );
		const funcCtrl = gui.add( obj, 'func' );
		const numberCtrl = gui.add( obj, 'number' );
		const optionsCtrl = gui.add( obj, 'options', [ 'a', 'b', 'c' ] );
		const stringCtrl = gui.add( obj, 'string' );

		// change it via gui

		booleanCtrl.setValue( true );
		color1Ctrl._setValueFromHexString( '#0fac8f' );
		color2Ctrl._setValueFromHexString( '#3fccea' );
		color3Ctrl._setValueFromHexString( '#219c3a' );
		color4Ctrl._setValueFromHexString( '#0033aa' );
		color5Ctrl._setValueFromHexString( '#88fac3' );
		funcCtrl; // function controller is kinda just here for symmetry. don't know what to do with it yet.
		numberCtrl.setValue( 1 );
		optionsCtrl.setValue( 'c' );
		stringCtrl.setValue( 'bar' );

		const newState = deepClone( obj );

		// console.log( originalDeep );
		// console.log( newState );

		// export
		const saved = gui.export( true, false );

		// reset gui to original state
		gui.reset();

		// assert matches original state
		// assert object types retain reference
		compare( originalDeep );

		// import
		gui.import( saved );

		// assert matches original state
		// assert object types retain reference

		compare( newState );

	} );

} );
