import test from './test-env.js';
import assert from 'assert';

import GUI, { GUI as _GUI } from '../build/lil-gui.module';

test( describe => {

	describe( 'default import', () => {

		assert.strictEqual( GUI, _GUI, 'GUI is available as both default and named export' );

		const gui = new GUI();

		assert( gui, 'can be instantiated' );

		assert.strictEqual( typeof gui.add, 'function', 'gui.add exists' );

	} );

	describe( 'name', () => {

		const gui = new GUI();
		const controller = gui.add( { x: 0 }, 'x' ).name( 'jeremy' );

		assert.strictEqual( controller.$name.innerHTML, 'jeremy', 'name sets innerHTML' );

	} );

	describe( 'destroy', () => {

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
			instance[ methodName ] = function() {
				method.apply( this, arguments );
				spy.apply( this, arguments );
			};
		}

	} );

	describe( 'color', () => {

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

} );
