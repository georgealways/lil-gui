import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const tracker = new CallTracker();

	const root = new GUI();

	const folder1 = root.addFolder();
	const folder2 = root.addFolder();

	root.onOpenClose( tracker.handler );

	folder1.close();
	assert.strictEqual( tracker.lastArgs[ 0 ], folder1 );
	assert.strictEqual( tracker.lastThis, root );

	folder2.close();
	assert.strictEqual( tracker.lastArgs[ 0 ], folder2 );
	assert.strictEqual( tracker.lastThis, root );

	// ignore redundant calls
	folder2.close();

	assert.deepEqual( tracker.numCalls, 2 );

};

