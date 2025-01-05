import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const gui = new GUI();

	const colors = {
		string: '#00ffaa',
		hex: 0x00ffaa,
		obj: { r: 0, g: 1, b: 0.6 },
		arr: [ 0, 1, 0.6 ],
		view: new Float32Array( [ 0, 1, 0.6 ] )
	};

	for ( const kind in colors ) {

		const controller = gui.addColor( colors, kind );

		const tracker = new CallTracker();

		controller.onChange( tracker.handler );

		controller.$input.value = '#ffffff';
		controller.$input.$callEventListener( 'input' );

		assert.strictEqual( tracker.numCalls, 1, `color controller ${kind} fires onChange events` );

	}

};
