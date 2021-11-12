import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();
	const controller1 = gui.add( { x: 0 }, 'x' );
	const controller2 = gui.add( { x: 0 }, 'x', 0 );

	assert.strictEqual( controller1.$slider, undefined, 'no sliders without range' );
	assert.strictEqual( controller2.$slider, undefined, 'no sliders without range' );

};
