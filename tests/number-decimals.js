import assert from 'assert';
import GUI from '..';


export default () => {

	const gui = new GUI();
	const obj = { x: 3.1007 };
	const num = gui.add(obj, 'x').decimals(1);


	let expectedDisplay = "3";
	num.decimals(0);
	assert.strictEqual(obj.x, 3.1007, "setting decimal precision affects actual value");
	assert.strictEqual(num.$input.value, expectedDisplay, `setting decimal precision doesn't correctly round display value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)

	expectedDisplay = "3.1"
	num.decimals(1);
	assert.strictEqual(obj.x, 3.1007, "setting decimal precision affects actual value");
	assert.strictEqual(num.$input.value, expectedDisplay, `setting decimal precision doesn't correctly round display value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)

	num.decimals(5);
	expectedDisplay = "3.10070"
	assert.strictEqual(num.$input.value, expectedDisplay, `setting decimal precision doesn't correctly add trailing zeroes to display value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)

	num.decimals(1.9);
	expectedDisplay = "3.1"
	assert.strictEqual(num.$input.value, expectedDisplay, `setting decimal precision that is not an integer doesn't correctly add round display value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)

	//much larger decimals will start changing display value when adding trailing zeroes due to floating point accuracy, probably not really an issue
	num.decimals(15);
	expectedDisplay = "3.100700000000000"
	assert.strictEqual(obj.x, 3.1007, "setting large decimal precision affects actual value");
	assert.strictEqual(num.$input.value, expectedDisplay, `setting large decimal precision doesn't correctly add trailing zeroes to display value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)

	num.decimals(undefined);
	assert.strictEqual(obj.x, 3.1007, "setting undefined decimal precision affects actual value");
	assert.strictEqual(num.$input.value, 3.1007, "Undefined decimal affects actual value");

	obj.x = 24.56;
	num.decimals(1);
	expectedDisplay = "24.6";
	assert.strictEqual(num.$input.value, expectedDisplay, `setting object value outside of controller doesn't correctly update duisplay value \nExpected: ${expectedDisplay} \nActual: ${num.$input.value}`)
	
	
};
