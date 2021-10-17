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
			assert.strictEqual( controller, controller.onChange( function () { } ) );
			assert.strictEqual( controller, controller.onFinishChange( function () { } ) );
			assert.strictEqual( controller, controller.reset() );
			assert.strictEqual( controller, controller.setValue() );
			assert.strictEqual( controller, controller.step() );
			assert.strictEqual( controller, controller.updateDisplay() );
		}

		testControllerType( gui.add( { x: false }, 'x' ), BooleanController );

		testControllerType( gui.add( { x: 0 }, 'x' ), NumberController );
		testControllerType( gui.add( { x: function () { } }, 'x' ), FunctionController );
		testControllerType( gui.add( { x: '' }, 'x' ), StringController );
		testControllerType( gui.add( { x: '' }, 'x', ['', 'a'] ), OptionController );

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

		const arr = [obj.r, obj.g, obj.b];
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
			const method = instance[methodName];
			if ( typeof method !== 'function' ) {
				throw Error( `Tried to spy on "${methodName}" but it's not a function: ${method}` );
			}
			instance[methodName] = function () {
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
			return parts.length === 1 ? 0 : parts[1].length;
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
		gui.getFolders().forEach( visit );
		assert.strictEqual( controllersVisited.length, 3 );

		controllersVisited.length = 0;
		gui.getFolders( false ).forEach( visit );
		assert.strictEqual( controllersVisited.length, 2 );

	} );

	unit( 'save reset load', () => {

		// make some objects, remember their original state

		const obj1 = {
			boolean: false,
			color1: '#aa00ff',
			color2: [1 / 3, 2 / 3, 1],
			color3: { r: 2 / 3, g: 1, b: 1 / 3 },
			color4: [0, 170, 255],
			color5: { r: 10, g: 21, b: 34 },
			func: function () { },
			number: 0,
			options: 'a',
			string: 'foo'
		};

		const obj2 = {
			string: 'collision test',
			number: 2
		};

		const obj1Tester = new Tester( obj1 );
		const obj2Tester = new Tester( obj2 );

		const gui = new GUI();

		// add every controller type to the gui
		const booleanCtrl = gui.add( obj1, 'boolean' );
		const color1Ctrl = gui.addColor( obj1, 'color1' );
		const color2Ctrl = gui.addColor( obj1, 'color2' );
		const color3Ctrl = gui.addColor( obj1, 'color3' );
		const color4Ctrl = gui.addColor( obj1, 'color4', 255 );
		const color5Ctrl = gui.addColor( obj1, 'color5', 255 );
		const numberCtrl = gui.add( obj1, 'number' );
		const optionsCtrl = gui.add( obj1, 'options', ['a', 'b', 'c'] );
		const stringCtrl = gui.add( obj1, 'string' );

		// and add some more to folders to test recursive
		const folder = gui.addFolder( 'Folder' );
		const folderString = folder.add( obj2, 'string' );
		const folderNumber = folder.add( obj2, 'number' );

		// change it via gui
		booleanCtrl.setValue( true );
		color1Ctrl._setValueFromHexString( '#0fac8f' );
		color2Ctrl._setValueFromHexString( '#3fccea' );
		color3Ctrl._setValueFromHexString( '#219c3a' );
		color4Ctrl._setValueFromHexString( '#0033aa' );
		color5Ctrl._setValueFromHexString( '#88fac3' );
		numberCtrl.setValue( 1 );
		optionsCtrl.setValue( 'c' );
		stringCtrl.setValue( 'bar' );

		// also change some nested ones to test recursive
		folderString.setValue( 'somethin' );
		folderNumber.setValue( 200 );

		// remember new state
		obj1Tester.modified = deepClone( obj1 );
		obj2Tester.modified = deepClone( obj2 );

		// save
		const saved = gui.save();

		// reset gui to original state
		gui.reset();

		// current values should be same as original
		obj1Tester.compare( obj1Tester.originalDeep );
		obj2Tester.compare( obj2Tester.originalDeep );

		// import
		gui.load( saved );

		// current values should be same as modified
		obj1Tester.compare( obj1Tester.modified );
		obj2Tester.compare( obj2Tester.modified );

		function Tester( obj ) {

			this.originalDeep = deepClone( obj );
			const originalShallow = Object.assign( {}, obj );

			// assert matches original state
			// assert object types retain reference
			this.compare = ( state ) => {
				for ( let key in obj ) {
					const val = obj[key];
					const deep = state[key];
					const shallow = originalShallow[key];
					if ( Object( val ) === val ) {
						assert.deepStrictEqual( val, deep, 'deep ' + key );
						assert.strictEqual( val, shallow, 'shallow ' + key );
					} else {
						assert.strictEqual( val, deep );
					}
				}
			}

		}

		function deepClone( obj ) {
			const clone = {};
			for ( let key in obj ) {
				const val = obj[key];
				if ( Array.isArray( val ) ) {
					clone[key] = Array.from( val );
				} else if ( typeof val !== 'function' && Object( val ) === val ) {
					clone[key] = deepClone( val );
				} else {
					clone[key] = val;
				}
			}
			return clone;
		}

	} );

	unit( 'save reset load cont', () => {

		let gui = new GUI();
		const foo = 'bar';

		const a = { foo }, b = { foo };
		gui.add( a, 'foo' );
		gui.add( b, 'foo' );

		assert.throws( () => gui.save(), Error, 'throws error if controller names collide' );

		gui = new GUI();
		gui.addFolder( 'foo' );
		gui.addFolder( 'foo' );

		assert.throws( () => gui.save(), Error, 'throws error if folder names collide' );

		gui = new GUI();
		gui.add( { foo }, 'foo' );

		const f1 = gui.addFolder( 'foo' );
		f1.add( { foo }, 'foo' );

		const f2 = f1.addFolder( 'foo' );
		f2.add( { foo }, 'foo' );

		assert.doesNotThrow( () => gui.save(), Error, "doesn't throw error if names collide across folders" );

		assert.throws( () => gui.load( {} ), Error, "throws error if load object doesn't have a controllers object" );

	} );

	unit( 'openAnimated', () => {
		new GUI().openAnimated();
	} );

	unit( 'controller.onChange', () => {

		const gui = new GUI();

		const controller = gui.add( { x: 0 }, 'x' );

		let tracker = new assert.CallTracker();

		let handler, _args, _this;

		function testMethod( method ) {

			handler = tracker.calls( function ( ...args ) {
				_this = this;
				_args = args;
			}, 1 );

			controller[method]( handler );

			const value = 9;
			controller.setValue( value );

			assert.strictEqual( controller._onChange, handler, method + ': sets _onChange' );
			assert.strictEqual( _this, controller, method + ': this is bound to controller in handler' );
			assert.deepEqual( _args, [value], method + ': new value is the first and only argument' );

			tracker.verify();

		}

		testMethod( 'onChange' );
		testMethod( 'onFinishChange' );

	} );

	unit( 'gui.onChange', () => {

		const gui = new GUI();

		const object1 = { x: 0 };
		const controller = gui.add( object1, 'x' );

		const object2 = { y: 0 };
		const nested = gui.addFolder( '' ).add( object2, 'y' );

		let tracker = new assert.CallTracker();

		let handler, _args;

		handler = tracker.calls( ( ...args ) => _args = args );

		gui.onChange( handler );

		let value = 1;

		controller.setValue( value );
		assert.strictEqual( gui._onChange, handler, 'sets _onChange' );
		assert.deepStrictEqual( _args, [{
			object: object1,
			property: 'x',
			controller,
			value
		}], 'changes trigger change handler' );

		value = 2;

		nested.setValue( value );
		assert.deepStrictEqual( _args, [{
			object: object2,
			property: 'y',
			controller: nested,
			value
		}], 'changes to nested folder trigger parent change handler' );

	} );

} );
