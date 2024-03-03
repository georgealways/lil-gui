import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();

	const tracker = new CallTracker();

	const c = gui.add( { x: 0 }, 'x' );

	c.setValue( 1 );
	c.onFinishChange( tracker.handler );

	c.reset();

	assert.strictEqual( tracker.numCalls, 1, 'reset triggers onFinishChange' );

	c.reset();

	assert.strictEqual( tracker.numCalls, 1, 'redundant calls to reset do not trigger onFinishChange' );

};
