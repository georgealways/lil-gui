import assert from 'assert';
import GUI from '..';

export default () => {

	// make sure references remain intact after reset

	const gui = new GUI();

	const colorArr = [ 1, 0, 0.5 ];
	const ctrl1 = gui.addColor( { colorArr }, 'colorArr' );
	ctrl1._setValueFromHexString( '#00f' );
	ctrl1.reset();

	assert.strictEqual( ctrl1.getValue(), colorArr, 'reset color array retains reference' );

	const colorObj = { r: 0, g: 0.2, b: 0 };
	const ctrl2 = gui.addColor( { colorObj }, 'colorObj' );
	ctrl2._setValueFromHexString( '#00f' );
	ctrl2.reset();

	assert.strictEqual( ctrl2.getValue(), colorObj, 'reset color obj retains reference' );

};
