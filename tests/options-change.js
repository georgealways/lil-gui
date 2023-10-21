import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();

	const ctrl1 = gui.add( { x: 0 }, 'x', [ 0, 1, 2 ] );

	const newOpts = [ 4, 5, 6 ];
	const ctrl2 = ctrl1.options( newOpts );

	assert.deepStrictEqual( ctrl2._values, newOpts, 'options() can be changed after creation' );
	assert.strictEqual( ctrl1, ctrl2, 'calling options() on an option controller doesn\'t create a new controller' );

};
