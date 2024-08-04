import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

import CallTracker from './utils/CallTracker.js';

export default () => {

	const test = ( message, { elementToTest, expectedCalls, keyCode } ) => {

		const gui = new GUI();

		const keydownTracker = new CallTracker();
		const keyupTracker = new CallTracker();

		window.addEventListener( 'keydown', keydownTracker.handler );
		window.addEventListener( 'keyup', keyupTracker.handler );

		const el = elementToTest( gui );

		// console.log( el );

		el.$callEventListener( 'keydown', { code: keyCode } );
		el.$callEventListener( 'keyup', { code: keyCode } );

		const debug = JSON.stringify( { expectedCalls, keyCode }, null, 2 );
		message = `${message}\n${debug}`;

		assert.strictEqual( keydownTracker.numCalls, expectedCalls, message );
		assert.strictEqual( keyupTracker.numCalls, expectedCalls, message );

	};

	test( 'key events do not propagate from string controllers', {
		elementToTest: gui => gui.add( { prop: '' }, 'prop' ).$input,
		expectedCalls: 0,
		keyCode: 'a'
	} );

	test( 'key events do not propagate from number controller\'s text input', {
		elementToTest: gui => gui.add( { prop: 0 }, 'prop' ).$input,
		expectedCalls: 0,
		keyCode: 'a'
	} );

	test( 'key events do not propagate from color controller\'s text input', {
		elementToTest: gui => gui.addColor( { prop: '#fff' }, 'prop' ).$text,
		expectedCalls: 0,
		keyCode: 'a'
	} );

	test( 'key events DO propagate from boolean controller\'s checkbox', {
		elementToTest: gui => gui.addColor( { prop: '#fff' }, 'prop' ).$input,
		expectedCalls: 1,
		keyCode: 'a'
	} );

	test( 'key events DO propagate from folder titles', {
		elementToTest: gui => gui.addFolder( 'folder' ).$title,
		expectedCalls: 1,
		keyCode: 'space'
	} );

};
