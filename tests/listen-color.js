import assert from 'assert';
import GUI from '..';

import spy from './utils/spy';

export default () => new Promise( done => {

	// listen should only call updateDisplay if the value has changed

	const gui = new GUI();

	const tracker = new assert.CallTracker();

	const obj = { x: { r: 0, g: 1, b: 1 } };

	const ctrl = gui.addColor( obj, 'x' );

	let animationFrames = 0;

	// 3 = 2 changes + 1 initial update
	spy( ctrl, 'updateDisplay', tracker.calls( 3 ) );
	spy( ctrl, '_listenCallback', () => {
		animationFrames++;
	} );

	ctrl.listen();

	// change 1
	obj.x.r = 1;

	// change 2
	setTimeout( () => {
		obj.x.g = 0.5;
	}, 50 );

	setTimeout( () => {
		tracker.verify();
		assert( animationFrames > 3 );
		done();
	}, 100 );

} );
