import assert from 'assert';
import GUI from '../dist/lil-gui.esm.min.js';

export default () => {
	for ( const type of [ 'mouse', 'touch' ] ) {
		for ( const scenario of [
			{ start: 0.8, min: 0, max: 60, expected: 60 },
			{ start: 0.2, min: 40, max: 100, expected: 40 },
			{ start: 0.8, min: 40, max: 100, expected: 80 },
			{ start: 0.8, min: 40, max: 100, step: 7, expected: 80 }
		] ) {
			const gui = new GUI();
			const object = { value: 50 };
			const controller = gui.add( object, 'value', 0, 100, 1 );
			const calls = [];
			controller.onFinishChange( value => calls.push( value ) );
			const rect = controller.$slider.getBoundingClientRect();
			const point = { clientX: rect.left + rect.width * scenario.start, clientY: rect.top };
			const event = type === 'touch' ? { touches: [ point ] } : point;
			controller.$slider.$callEventListener( type === 'mouse' ? 'mousedown' : 'touchstart', event );
			controller.min( scenario.min ).max( scenario.max );
			if ( scenario.step ) controller.step( scenario.step );
			controller.updateDisplay();
			window.$callEventListener( type === 'mouse' ? 'mouseup' : 'touchend', event );
			assert.deepStrictEqual( calls, [ scenario.expected ], `${type}: release respects current bounds` );
			assert.strictEqual( object.value, scenario.expected, `${type}: model agrees with released value` );
			gui.destroy();
		}
	}

	for ( const scenario of [
		{ y: 20, min: 0, max: 60, expected: 60 },
		{ y: 80, min: 40, max: 100, expected: 40 }
	] ) {
		const gui = new GUI();
		const object = { value: 50 };
		const controller = gui.add( object, 'value', 0, 100, 1 );
		const calls = [];
		controller.onFinishChange( value => calls.push( value ) );
		controller.$input.$callEventListener( 'mousedown', { clientX: 50, clientY: 50 } );
		window.$callEventListener( 'mousemove', { clientX: 50, clientY: scenario.y } );
		controller.min( scenario.min ).max( scenario.max );
		window.$callEventListener( 'mouseup', { clientX: 50, clientY: scenario.y } );
		assert.deepStrictEqual( calls, [ scenario.expected ], 'vertical drag uses current bounds' );
		gui.destroy();
	}

	const gui = new GUI();
	const object = { value: 80 };
	const controller = gui.add( object, 'value', 0, 100 );
	const calls = [];
	controller.onFinishChange( value => calls.push( value ) );
	controller.max( 60 );
	controller.$input.$callEventListener( 'mousedown', { clientX: 50, clientY: 50 } );
	window.$callEventListener( 'mouseup', { clientX: 50, clientY: 50 } );
	assert.strictEqual( object.value, 80, 'clicking text without dragging preserves programmatic values' );
	assert.deepStrictEqual( calls, [], 'a text click without a change does not finish an edit' );
	controller.setValue( 50 );
	controller.reset();
	assert.strictEqual( object.value, 80, 'programmatic reset retains the initial value' );
	gui.destroy();
};
