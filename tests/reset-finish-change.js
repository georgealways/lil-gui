import assert from 'assert';
import GUI from '../dist/lil-gui.esm.js';

export default () => {

	const gui = new GUI();

	const tracker = new assert.CallTracker();
	const handler = tracker.calls( function(){}, 1 );

	const c = gui.add( { x: 0 }, 'x' );

	c.onFinishChange( handler );

	c.reset();

	tracker.verify();

};
