import assert from 'assert';
import { GUI } from '../dist/lil-gui.esm.min.js';

export default () => {

	stepTest( {
		start: 0,
		min: 1,
		max: 10,
		step: 1,
		expectedValues: [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ]
	} );

	stepTest( {
		start: 0,
		min: 1,
		max: 11,
		step: 2,
		expectedValues: [ 3, 5, 7, 9, 11 ]
	} );

	stepTest( {
		start: 0,
		min: 10,
		step: 3,
		expectedValues: [ 10, 13, 16, 19, 22, 25, 28 ]
	} );

	stepTest( {
		start: 21,
		max: 20,
		step: 7,
		expectedValues: [ 13, 6, -1, -8, -15, -22 ]
	} );

	function stepTest( { start, min, max, step, expectedValues } ) {

		const gui = new GUI();

		const target = { x: start };
		const controller = gui.add( target, 'x', min, max, step );

		const actualValues = [];

		assert.strictEqual( target.x, start, "value isn't modified until user interaction." );

		for ( let i = 0; i < expectedValues.length; i++ ) {

			// key up if min is defined, otherwise key down
			const code = min !== undefined ? 'ArrowUp' : 'ArrowDown';

			controller.$input.$callEventListener( 'keydown', { code } );
			actualValues.push( target.x );

		}

		assert.deepStrictEqual(
			actualValues,
			expectedValues,
			'slider steps correctly even when min/max are not divisible by step. ' +
			`actual: ${[ ...actualValues ]} ` +
			`expected: ${[ ...expectedValues ]}`
		);

	}

};
