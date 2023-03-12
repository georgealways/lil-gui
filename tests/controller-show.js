import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();
	const controller = gui.add( { x: 0 }, 'x' );

	assert.strictEqual( controller.domElement.style.display, undefined, 'Undefined by default' );

	controller.show();
	assert.strictEqual( controller.domElement.style.display, '', 'Shown after call to .show()' );

	controller.hide();
	assert.strictEqual( controller.domElement.style.display, 'none', 'Hidden after call to .hide()' );

	controller.show( true );
	assert.strictEqual( controller.domElement.style.display, '', 'Shown after call to .show(true)' );

	controller.show( false );
	assert.strictEqual( controller.domElement.style.display, 'none', 'Hidden after call to .show(false)' );

	controller.show( controller._hidden );
	assert.strictEqual( controller.domElement.style.display, '', 'Shown after toggle' );

	controller.show( controller._hidden );
	assert.strictEqual( controller.domElement.style.display, 'none', 'Hidden after toggle' );

};
