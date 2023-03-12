import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {

	const gui = new GUI();

	const controller = gui.add( { x: 0 }, 'x' );

	let tracker = new assert.CallTracker();

	let handler, _args, _this;

	handler = tracker.calls( function( ...args ) {
		_this = this;
		_args = args;
	}, 1 );

	controller.onChange( handler );

	const value = 9;
	controller.setValue( value );

	assert.strictEqual( controller._onChange, handler, 'onChange: sets _onChange' );
	assert.strictEqual( _this, controller, 'onChange: this is bound to controller in handler' );
	assert.deepEqual( _args, [ value ], 'onChange: new value is the first and only argument' );

	tracker.verify();

	// function controller should call onChange after click

	tracker = new assert.CallTracker();
	handler = tracker.calls( () => {}, 1 );

	const functionController = gui.add( { fnc() {} }, 'fnc' );
	functionController.onChange( handler );
	functionController.$button.$callEventListener( 'click' );

	tracker.verify();

};
