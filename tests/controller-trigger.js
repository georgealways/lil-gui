import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();

	const obj = { x: 42 };
	const controller = gui.add( obj, 'x' );

	const tracker = new CallTracker();

	// Test that trigger calls onChange with current value
	controller.onChange( tracker.handler );
	controller.trigger();

	assert.strictEqual( tracker.numCalls, 1, 'trigger: calls onChange once' );
	assert.strictEqual( tracker.lastThis, controller, 'trigger: this is bound to controller in handler' );
	assert.deepEqual( tracker.lastArgs, [ 42 ], 'trigger: current value is passed to onChange' );

	// Test that trigger is chainable
	const result = controller.trigger();
	assert.strictEqual( result, controller, 'trigger: returns the controller for chaining' );

	// Test that trigger works with updated values
	controller.setValue( 100 );
	controller.trigger();

	// Expected: 1 (first trigger) + 1 (chainable trigger) + 1 (setValue onChange) + 1 (trigger after setValue)
	const expectedCalls = 4;
	assert.strictEqual( tracker.numCalls, expectedCalls,
		'trigger: after setValue, both setValue onChange and trigger onChange are called' );
	assert.deepEqual( tracker.lastArgs, [ 100 ], 'trigger: passes updated value to onChange' );

	// Test that trigger works even without onChange callback
	const controller2 = gui.add( { y: 10 }, 'y' );
	controller2.trigger(); // Should not throw

	// Test the use case from the issue
	const state = {
		partsVisible: false
	};

	const parts = [
		{ visible: true },
		{ visible: true },
		{ visible: true }
	];

	gui.add( state, 'partsVisible' ).onChange( visible => {
		for ( const part of parts ) {
			part.visible = visible;
		}
	} ).trigger();

	// All parts should now be false due to trigger
	assert.strictEqual( parts[ 0 ].visible, false, 'trigger: use case - part 0 visibility set' );
	assert.strictEqual( parts[ 1 ].visible, false, 'trigger: use case - part 1 visibility set' );
	assert.strictEqual( parts[ 2 ].visible, false, 'trigger: use case - part 2 visibility set' );

};
