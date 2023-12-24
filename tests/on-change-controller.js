import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();

	const controller = gui.add( { x: 0 }, 'x' );

	let tracker = new CallTracker();

	controller.onChange( tracker.handler );

	const value = 9;
	controller.setValue( value );

	assert.strictEqual( controller._onChange, tracker.handler, 'onChange: sets _onChange' );
	assert.strictEqual( tracker.lastThis, controller, 'onChange: this is bound to controller in handler' );
	assert.deepEqual( tracker.lastArgs, [ value ], 'onChange: new value is the first and only argument' );

	assert.strictEqual( tracker.numCalls, 1 );

	controller.setValue( value );

	assert.strictEqual( tracker.numCalls, 1, 'redundant calls to setValue do not trigger onChange' );

	// function controller should call onChange after click

	tracker = new CallTracker();

	const functionController = gui.add( { fnc() {} }, 'fnc' );
	functionController.onChange( tracker.handler );
	functionController.$button.$callEventListener( 'click' );

	assert.strictEqual( tracker.numCalls, 1 );

};
