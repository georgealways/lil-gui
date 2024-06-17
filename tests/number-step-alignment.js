import assert from 'assert';
import { GUI } from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();

	const target = { x: 0 };
	const controller = gui.add( target, 'x', 1, 11 ).step( 2 );

	const expectedValues = new Set( [ 1, 3, 5, 7, 9, 11 ] );
	const actualValues = new Set();

	const rect = controller.$slider.getBoundingClientRect();

	assert.strictEqual( target.x, 0, "step/min/max don't affect value until user interaction" );

	controller.$slider.$callEventListener( 'mousedown', {
		clientX: Math.floor( rect.left )
	} );

	// move the mouse across the slider
	for ( let clientX = Math.floor( rect.left ); clientX < Math.ceil( rect.right ); clientX++ ) {
		window.$callEventListener( 'mousemove', { clientX } );
		actualValues.add( target.x );
	}

	window.$callEventListener( 'mouseup' );

	assert.deepStrictEqual(
		actualValues,
		expectedValues,
		'slider steps correctly even when min/max are not divisible by step'
	);

};
