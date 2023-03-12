import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();
	const obj = { x: 3.1007 };
	const num = gui.add( obj, 'x' );

	num.decimals( 0 );
	assert.strictEqual( obj.x, 3.1007, "setting decimal precision doesn't affect actual value" );
	assert.strictEqual( num.$input.value, '3', 'setting decimal precision rounds display value' );

	num.decimals( 1 );
	assert.strictEqual( obj.x, 3.1007, "setting decimal precision doesn't affect actual value" );
	assert.strictEqual( num.$input.value, '3.1', 'setting decimal precision rounds display value' );

	num.decimals( 5 );
	assert.strictEqual( obj.x, 3.1007, "setting decimal precision doesn't affect actual value" );
	assert.strictEqual( num.$input.value, '3.10070', 'setting decimal precision rounds display value' );

	num.decimals( undefined );
	assert.strictEqual( obj.x, 3.1007, "unsetting decimal precision doesn't affect actual value" );
	// no strict here, our DOM shim doesn't coerce <input>.value to string
	assert.equal( num.$input.value, '3.1007', 'Undefined decimal affects actual value' );

};
