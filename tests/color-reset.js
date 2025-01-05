import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	// make sure references remain intact after reset

	const gui = new GUI();

	const colorArr = [ 1, 0, 0.5 ];
	const ctrl1 = gui.addColor( { colorArr }, 'colorArr' );
	ctrl1._setValueFromHexString( '#00f' );
	ctrl1.reset();

	assert.strictEqual( ctrl1.getValue(), colorArr, 'reset color array retains reference' );

	const colorView = new Float32Array( colorArr );
	const ctrl2 = gui.addColor( { colorView }, 'colorView' );
	ctrl2._setValueFromHexString( '#00f' );
	ctrl2.reset();

	assert.strictEqual( ctrl2.getValue(), colorView, 'reset color view retains reference' );

	const colorObj = { r: 0, g: 0.2, b: 0 };
	const ctrl3 = gui.addColor( { colorObj }, 'colorObj' );
	ctrl3._setValueFromHexString( '#00f' );
	ctrl3.reset();

	assert.strictEqual( ctrl3.getValue(), colorObj, 'reset color obj retains reference' );

};
