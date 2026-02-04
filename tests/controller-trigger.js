import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();
	const tracker = new CallTracker();

	const c = gui.add( { x: 42 }, 'x' );
	c.onChange( tracker.handler );

	c.trigger();

	assert.strictEqual( tracker.numCalls, 1 );
	assert.strictEqual( tracker.lastThis, c );
	assert.deepEqual( tracker.lastArgs, [ 42 ] );

	assert.strictEqual( c.trigger(), c, 'trigger is chainable' );

	c.setValue( 100 );

	assert.strictEqual( tracker.numCalls, 3 );
	assert.deepEqual( tracker.lastArgs, [ 100 ] );

	gui.add( { y: 10 }, 'y' ).trigger();

	const gui2 = new GUI();
	const parentTracker = new CallTracker();
	const childTracker = new CallTracker();

	gui2.onChange( parentTracker.handler );
	gui2.add( { z: 5 }, 'z' ).onChange( childTracker.handler ).trigger();

	assert.strictEqual( childTracker.numCalls, 1 );
	assert.strictEqual( parentTracker.numCalls, 0, 'does not propagate to parent' );

};
