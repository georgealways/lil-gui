import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const test = ( message, { captureKeys, elementToTest, expectedCalls, keyCode } ) => {

		const gui = new GUI( { captureKeys } );

		const keydownTracker = new CallTracker();
		const keyupTracker = new CallTracker();

		window.addEventListener( 'keydown', keydownTracker.handler );
		window.addEventListener( 'keyup', keyupTracker.handler );

		const el = elementToTest( gui );

		el.$callEventListener( 'keydown', { code: keyCode } );
		el.$callEventListener( 'keyup', { code: keyCode } );

		const debug = JSON.stringify( { captureKeys, expectedCalls, keyCode }, null, 2 );
		message = `${message}\n${debug}`;

		assert.strictEqual( keydownTracker.numCalls, expectedCalls, message );
		assert.strictEqual( keyupTracker.numCalls, expectedCalls, message );

	};

	test( 'key events do not propagate from controllers if captureKeys is true', {
		captureKeys: true,
		elementToTest: gui => gui.add( { str: '' }, 'str' ).domElement,
		expectedCalls: 0,
		keyCode: 'Backspace'
	} );

	test( 'captureKeys defaults to true', {
		captureKeys: undefined,
		elementToTest: gui => gui.add( { str: '' }, 'str' ).domElement,
		expectedCalls: 0,
		keyCode: 'Backspace'
	} );

	test( 'key events propagate from folder titles if captureKeys is false', {
		captureKeys: false,
		elementToTest: gui => gui.$title,
		expectedCalls: 1,
		keyCode: 'Backspace'
	} );

	test( 'key events do not propagate from folder titles if captureKeys is true', {
		captureKeys: true,
		elementToTest: gui => gui.$title,
		expectedCalls: 0,
		keyCode: 'Backspace'
	} );

};
