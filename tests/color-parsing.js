import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();

	// 122 / 255, 38 / 255, 171 / 255
	const obj = {
		r: 0.47843137254901963,
		g: 0.14901960784313725,
		b: 0.6705882352941176
	};

	const arr = [ obj.r, obj.g, obj.b ];
	const int = 0x7a26ab;
	const string = '#7a26ab';

	assert.strictEqual( gui.addColor( { obj }, 'obj' ).$input.value, string );
	assert.strictEqual( gui.addColor( { arr }, 'arr' ).$input.value, string );
	assert.strictEqual( gui.addColor( { int }, 'int' ).$input.value, string );
	assert.strictEqual( gui.addColor( { string }, 'string' ).$input.value, string );

	// todo: it doesn't get hit with any edge cases or malformed colors

};
