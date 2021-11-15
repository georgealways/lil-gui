import assert from 'assert';
import GUI from '..';

import simulateDrag from './utils/simulateDrag';

export default () => {

	const gui = new GUI();

	const obj = { x: 0 };
	const ctrl = gui.add( obj, 'x', 0, 1000 );

	let tracker = new assert.CallTracker();

	let handler, _args, _this;

	handler = tracker.calls( function( ...args ) {
		_this = this;
		_args = args;
	}, 4 ); // expecting this many onFinishChange

	ctrl.onFinishChange( handler );
	assert.strictEqual( ctrl._onFinishChange, handler, 'Number.onFinishChange: sets _onFinishChange' );

	let prefix;

	// onFinishChange 1
	prefix = 'number finish change (mouse, drag slider)';

	simulateDrag( 'mouse', ctrl.$slider, { dx: 20 } );
	assert.strictEqual( _this, ctrl, `${prefix}: this is bound to controller in handler` );
	assert.deepEqual( _args, [ obj.x ], `${prefix}: new value is the first and only argument` );

	// todo: nit picky, but tapping in the same place on the slider shouldn't trigger onFinishChange

	// onFinishChange 2
	prefix = 'number finish change (touch, drag slider)';

	simulateDrag( 'touch', ctrl.$slider, { dx: -30 } );
	assert.strictEqual( _this, ctrl, `${prefix}: this is bound to controller in handler` );
	assert.deepEqual( _args, [ obj.x ], `${prefix}: new value is the first and only argument` );

	// onFinishChange 3
	prefix = 'number finish change (mouse, drag input)';

	simulateDrag( 'mouse', ctrl.$input, { dy: 20 } );
	assert.strictEqual( _this, ctrl, `${prefix}: this is bound to controller in handler` );
	assert.deepEqual( _args, [ obj.x ], `${prefix}: new value is the first and only argument` );

	// onFinishChange 4: blur input
	prefix = 'number finish change (blur input)';
	ctrl.$input.focus();
	ctrl.$input.value = '666';
	ctrl.$input.$callEventListener( 'input' );
	ctrl.$input.blur();

	assert.strictEqual( _this, ctrl, `${prefix}: this is bound to controller in handler` );
	assert.deepEqual( _args, [ 666 ], `${prefix}: new value is the first and only argument` );

	// blurs without changes don't call onFinishChange
	ctrl.$input.focus();
	ctrl.$input.blur();

	// todo: the final onFinishChange would be wheel on slider, but that involves a 400ms timeout

	tracker.verify();

};
