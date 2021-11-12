import assert from 'assert';
import GUI from '..';

export default () => {

	const gui = new GUI();

	const object1 = { x: 0 };
	const controller = gui.add( object1, 'x' );

	const object2 = { y: 0 };
	const nested = gui.addFolder( '' ).add( object2, 'y' );

	let tracker = new assert.CallTracker();

	let handler, _args;

	handler = tracker.calls( ( ...args ) => _args = args );

	gui.onChange( handler );

	let value = 1;

	controller.setValue( value );
	assert.strictEqual( gui._onChange, handler, 'sets _onChange' );
	assert.deepStrictEqual( _args, [ {
		object: object1,
		property: 'x',
		controller,
		value
	} ], 'changes trigger change handler' );

	value = 2;

	nested.setValue( value );
	assert.deepStrictEqual( _args, [ {
		object: object2,
		property: 'y',
		controller: nested,
		value
	} ], 'changes to nested folder trigger parent change handler' );

};
