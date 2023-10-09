import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();

	const tracker = new CallTracker();

	const c = gui.add( { x: 0 }, 'x' );

	c.onFinishChange( tracker.handler );

	c.reset();

	assert.strictEqual( tracker.calls, 1 );

};
