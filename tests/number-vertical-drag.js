import assert from 'assert';
import GUI from '..';

import simulateDrag from './utils/simulateDrag';

export default () => {

	const gui = new GUI();
	const obj = { x: 3 };
	const num = gui.add( obj, 'x' );

	simulateDrag( 'mouse', num.$input, { dx: 235, dy: 0 } );
	assert.strictEqual( obj.x, 3, "horizontal drags don't trigger change" );

	simulateDrag( 'mouse', num.$input, { dx: -200, dy: 4 } );
	assert.strictEqual( obj.x, 3, "ambiguous drags don't trigger change" );

	simulateDrag( 'mouse', num.$input, { dx: 0, dy: 4 } );
	assert.strictEqual( obj.x, 3, "small vertical drags don't trigger change" );

	simulateDrag( 'mouse', num.$input, { dx: 0, dy: -25 } );
	assert.strictEqual( obj.x, 28, 'vertical drags change' );

	simulateDrag( 'mouse', num.$input, { dx: 0, dy: 131, altKey: true } );
	assert.strictEqual( obj.x, 14.9, 'vertical drags change with modifier keys' );

	simulateDrag( 'mouse', num.$input, { dx: 0, dy: 34, shiftKey: true } );
	assert.strictEqual( obj.x, -325.1, 'vertical drags change with modifier keys' );

	num.step( 0.1 );
	simulateDrag( 'mouse', num.$input, { dx: 0, dy: 23 } );
	assert.strictEqual( obj.x, obj.x, -325.1, 'vertical drags uses step' );

};
